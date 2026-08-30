import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { authorizeAiRequest } from '@/lib/aiGuard';

// Server-side Claude proxy for AI co-authoring (summarize / expand / to-diagram).
// Keeps ANTHROPIC_API_KEY off the client. Production access fails closed unless
// the deployment explicitly enables same-origin public AI or configures an
// access token. See apps/web/.env.example and docs/DEPLOYMENT.md.

export const runtime = 'nodejs';

type Action = 'summarize' | 'expand' | 'todiagram';

const MODEL = 'claude-opus-4-8';

const SPECS: Record<
    Action,
    { system: string; user: (label: string, content: string) => string; schema: Record<string, unknown> }
> = {
    summarize: {
        system: 'You summarize a concept on a diagram canvas. Reply with one or two crisp sentences. No preamble.',
        user: (label, content) => `Summarize this node.\nLabel: ${label}\n${content ? `Content:\n${content}` : ''}`,
        schema: {
            type: 'object',
            properties: { summary: { type: 'string' } },
            required: ['summary'],
            additionalProperties: false,
        },
    },
    expand: {
        system: 'You break a concept into sub-topics for a diagram. Return 3–5 short labels (2–4 words each), specific and non-overlapping.',
        user: (label, content) => `Break this topic into sub-topics.\nTopic: ${label}\n${content ? `Context:\n${content}` : ''}`,
        schema: {
            type: 'object',
            properties: { items: { type: 'array', items: { type: 'string' } } },
            required: ['items'],
            additionalProperties: false,
        },
    },
    todiagram: {
        system:
            'You turn a concept into a small Mermaid flowchart. Output ONLY mermaid topology starting with "graph TD", 3–6 nodes, simple ids (A,B,C…) with bracket labels and --> edges. No directives, no prose, no code fences.',
        user: (label, content) => `Create a flowchart for this concept.\nConcept: ${label}\n${content ? `Context:\n${content}` : ''}`,
        schema: {
            type: 'object',
            properties: { mermaid: { type: 'string' } },
            required: ['mermaid'],
            additionalProperties: false,
        },
    },
};

export async function POST(request: Request) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
        return NextResponse.json(
            { error: 'ANTHROPIC_API_KEY not configured', code: 'ai_provider_not_configured' },
            { status: 503 }
        );
    }

    const gate = authorizeAiRequest(request);
    if (!gate.ok) {
        const headers = gate.retryAfter ? { 'Retry-After': String(gate.retryAfter) } : undefined;
        return NextResponse.json(
            { error: gate.error, code: gate.code },
            { status: gate.status, headers }
        );
    }

    let body: { action?: Action; label?: string; content?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid request body', code: 'invalid_request' }, { status: 400 });
    }

    const action = body.action;
    if (!action || !SPECS[action]) {
        return NextResponse.json({ error: 'unknown action', code: 'unknown_action' }, { status: 400 });
    }
    const spec = SPECS[action];
    const label = (body.label ?? '').slice(0, 2000);
    const content = (body.content ?? '').slice(0, 8000);

    try {
        const client = new Anthropic({ apiKey: key });
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: spec.system,
            messages: [{ role: 'user', content: spec.user(label, content) }],
            output_config: { format: { type: 'json_schema', schema: spec.schema } },
        });

        if (response.stop_reason === 'refusal') {
            return NextResponse.json(
                { error: 'The request was declined.', code: 'ai_refusal' },
                { status: 200 }
            );
        }

        const text = response.content.find((b) => b.type === 'text') as { text: string } | undefined;
        let result: unknown = {};
        try {
            result = JSON.parse(text?.text ?? '{}');
        } catch {
            result = {};
        }

        return NextResponse.json({ result, model: response.model });
    } catch (err) {
        const message = err instanceof Anthropic.APIError ? err.message : 'AI request failed';
        return NextResponse.json({ error: message, code: 'ai_provider_error' }, { status: 502 });
    }
}
