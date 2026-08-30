import { timingSafeEqual } from 'node:crypto';

type RateBucket = {
    count: number;
    resetAt: number;
};

type AiGateSuccess = { ok: true };
type AiGateFailure = {
    ok: false;
    status: number;
    code: string;
    error: string;
    retryAfter?: number;
};

export type AiGateResult = AiGateSuccess | AiGateFailure;

const globalRateState = globalThis as typeof globalThis & {
    __mermaidmanAiRateBuckets?: Map<string, RateBucket>;
};

const rateBuckets =
    globalRateState.__mermaidmanAiRateBuckets ??
    (globalRateState.__mermaidmanAiRateBuckets = new Map<string, RateBucket>());

const WINDOW_MS = 60_000;

function envPositiveInt(name: string, fallback: number): number {
    const parsed = Number.parseInt(process.env[name] ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function secureEquals(expected: string, provided: string): boolean {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    return a.length === b.length && timingSafeEqual(a, b);
}

function clientKey(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }
    return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    try {
        const originUrl = new URL(origin);
        const forwardedHost = request.headers.get('x-forwarded-host');
        const host = forwardedHost ?? request.headers.get('host') ?? new URL(request.url).host;
        return originUrl.host === host;
    } catch {
        return false;
    }
}

function rateLimit(request: Request): AiGateResult {
    const limit = envPositiveInt('MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE', 8);
    const now = Date.now();
    const key = clientKey(request);
    const existing = rateBuckets.get(key);

    if (!existing || existing.resetAt <= now) {
        rateBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true };
    }

    if (existing.count >= limit) {
        return {
            ok: false,
            status: 429,
            code: 'ai_rate_limited',
            error: 'AI request limit reached. Try again shortly.',
            retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
    }

    existing.count += 1;
    return { ok: true };
}

/**
 * Protect the paid AI proxy.
 *
 * Production fails closed by default. Deployments must either:
 * - configure MERMAIDMAN_AI_ACCESS_TOKEN and send it as x-mermaidman-ai-token, or
 * - explicitly set MERMAIDMAN_AI_ALLOW_PUBLIC=true, which permits same-origin
 *   browser calls subject to the rate limit.
 *
 * The in-memory limiter is a baseline guard for a single runtime instance. A
 * horizontally scaled public deployment should replace it with a shared store.
 */
export function authorizeAiRequest(request: Request): AiGateResult {
    const configuredToken = process.env.MERMAIDMAN_AI_ACCESS_TOKEN?.trim();
    const allowPublic = process.env.MERMAIDMAN_AI_ALLOW_PUBLIC === 'true';

    if (configuredToken) {
        const provided = request.headers.get('x-mermaidman-ai-token') ?? '';
        if (!provided || !secureEquals(configuredToken, provided)) {
            return {
                ok: false,
                status: 401,
                code: 'ai_access_required',
                error: 'AI access token required.',
            };
        }
    } else {
        if (!allowPublic) {
            return {
                ok: false,
                status: 503,
                code: 'ai_disabled',
                error: 'AI access is disabled for this deployment.',
            };
        }

        if (!isSameOrigin(request)) {
            return {
                ok: false,
                status: 403,
                code: 'ai_origin_rejected',
                error: 'AI requests must come from the Mermaidman application origin.',
            };
        }
    }

    return rateLimit(request);
}
