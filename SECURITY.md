# Security Policy

## Supported versions

Mermaidman is currently alpha software. Security fixes are applied to the latest code on `main` and, once tagged releases begin, to the latest release unless maintainers explicitly state otherwise.

Older `0.x` snapshots should not be assumed to receive security updates.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for a vulnerability that could expose credentials, user data, arbitrary code execution, filesystem access, service abuse, or another exploitable condition.

Prefer GitHub's private vulnerability reporting / Security Advisory flow for this repository when it is available. If private reporting is not enabled, contact the repository maintainer through a private contact method listed on their GitHub profile and include:

- the affected component and commit/release;
- reproduction steps or a minimal proof of concept;
- expected impact;
- any suggested mitigation;
- whether you have disclosed the issue anywhere else.

Please give maintainers a reasonable opportunity to investigate and release a fix before public disclosure.

## Secrets

Never commit API keys, tokens, credentials, `.env.local` files, private URLs, or customer data.

The optional web integrations use server-side environment variables:

- `ANTHROPIC_API_KEY`
- `GIPHY_API_KEY`

The repository's `.env.example` files must contain placeholders only.

## Deployment notes

### AI route

The current alpha `/api/ai` implementation is a server-side Anthropic proxy but does not include authentication, per-user quotas, or rate limiting. A public deployment with a funded Anthropic key can therefore create an abuse/cost risk.

Do not treat the AI route as production-hardened until the deployment adds appropriate access and abuse controls.

### External embeds

Rich nodes can display external iframe/media URLs. Treat those URLs as untrusted input. Production deployments should constrain supported schemes/providers and apply an appropriate iframe sandbox/allow policy.

### Tauri

The desktop shell can read and write local files and maintains a local SQLite database. Changes to Tauri commands, filesystem capabilities, shell permissions, or path handling deserve security review because they cross the browser/OS boundary.

## Dependency vulnerabilities

For dependency-only reports, include the affected package/crate, vulnerable version range, advisory identifier if known, and whether Mermaidman exercises the vulnerable code path.
