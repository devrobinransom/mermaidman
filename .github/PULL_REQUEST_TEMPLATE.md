## Summary

<!-- What changed and why? Keep this focused. -->

## Type of change

- [ ] Bug fix
- [ ] Feature
- [ ] Parser / source-format change
- [ ] Refactor
- [ ] Documentation
- [ ] Build / tooling

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `cargo test --manifest-path apps/web/src/rust-engine/Cargo.toml` (when browser parser changed)
- [ ] `cargo test -p mermaidman-core` (when shared core changed)
- [ ] I manually exercised the affected editor flow

If a check is not applicable or could not be run because of platform dependencies, explain why below.

## Source-format impact

<!-- For parser/serializer/directive changes, include before/after Mermaidman text and compatibility notes. Otherwise write "None". -->

## UI evidence

<!-- Screenshots/video for visible UI changes. Delete this section when not applicable. -->

## Checklist

- [ ] The change is focused and avoids unrelated churn.
- [ ] Parser/source-format behavior has regression coverage where relevant.
- [ ] New Mermaidman directives or schema changes are documented.
- [ ] No secrets, credentials, private URLs, or customer data are included.
- [ ] README / contributor docs were updated when setup or behavior changed.
