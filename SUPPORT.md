# Support

Mermaidman is an early open-source project and does not currently provide a commercial support SLA.

## Bugs

Use the GitHub bug report template and include:

- a minimal Mermaid/Mermaidman input that reproduces the issue;
- browser/OS or Tauri platform when relevant;
- what you expected to happen;
- what actually happened;
- screenshots or console output when useful.

Parser bugs are much easier to fix when the report includes the smallest failing diagram.

## Feature requests

Use the feature request template. Explain the problem or workflow first, then the proposed behavior. For changes to the Mermaidman file/directive format, include backwards-compatibility considerations.

## Setup questions

Before filing a setup issue, check:

1. `pnpm install` was run from the repository root;
2. `wasm-pack` is installed;
3. `pnpm wasm:build` has populated `apps/web/public/wasm/`;
4. optional API keys are only needed for Anthropic AI actions and Giphy search.

## Security issues

Do not use a normal support or bug issue for a security vulnerability. Follow [SECURITY.md](SECURITY.md).
