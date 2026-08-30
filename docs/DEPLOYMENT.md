# Deployment and security notes

Mermaidman is local-first and can run without any paid API integration. The base editor, parser, canvas, source mutations, local project store, and export path do not require Anthropic or Giphy credentials.

## AI proxy

`/api/ai` uses `ANTHROPIC_API_KEY` server-side. The route now fails closed unless the deployment chooses an access policy.

### Option A — same-origin browser access

For a small trusted deployment where the Mermaidman browser app itself should use AI:

```dotenv
ANTHROPIC_API_KEY=...
MERMAIDMAN_AI_ALLOW_PUBLIC=true
MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE=8
```

This mode:

- accepts only requests carrying the application origin;
- applies a per-client in-memory request limit;
- keeps hard input and output limits in the route;
- never sends the provider key to the browser.

The in-memory limiter is intentionally a baseline, not a distributed quota system. A horizontally scaled or high-value public deployment should put `/api/ai` behind authenticated application sessions and a shared rate-limit/quota store.

### Option B — explicit access token

For API clients or a reverse proxy that can inject a private credential:

```dotenv
ANTHROPIC_API_KEY=...
MERMAIDMAN_AI_ACCESS_TOKEN=use-a-long-random-secret
MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE=8
```

Requests must include:

```text
x-mermaidman-ai-token: use-a-long-random-secret
```

Do not expose that secret as a `NEXT_PUBLIC_*` variable. The current browser UI intentionally does not persist the deployment access token.

If neither `MERMAIDMAN_AI_ALLOW_PUBLIC=true` nor `MERMAIDMAN_AI_ACCESS_TOKEN` is configured, the paid AI route is disabled even when `ANTHROPIC_API_KEY` exists.

## Rich embeds

External iframe nodes are treated as untrusted content. Mermaidman currently normalizes/permits HTTPS embeds from:

- YouTube (converted to `youtube-nocookie.com` embed URLs)
- Vimeo
- Figma

Other iframe URLs and unsafe URL schemes are blocked. Allowed frames use an explicit sandbox, restricted permissions, a strict referrer policy, and lazy loading.

Plain image/GIF nodes are not iframes and continue to support ordinary remote image URLs.

## Secrets

Keep these server-side only:

- `ANTHROPIC_API_KEY`
- `MERMAIDMAN_AI_ACCESS_TOKEN`
- `GIPHY_API_KEY`

Never commit `.env.local` or production values. Rotate a credential immediately if it appears in an issue, screenshot, build log, or commit.

## Recommended production hardening

Before treating an internet-facing deployment as production-grade:

1. Put AI actions behind real user/session authentication.
2. Replace the in-memory rate limiter with Redis/KV/database-backed quotas when running multiple instances.
3. Set platform-level request/body limits and observability around `/api/ai`.
4. Add CSP headers that match the embed allowlist.
5. Keep GitHub Actions green for the web build and both Rust parser paths.
6. Review dependency update PRs manually, especially parser and desktop-runtime major versions.
