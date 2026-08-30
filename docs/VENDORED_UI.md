# Bundled Radical UI kit

Mermaidman currently vendors `apps/web/src/components/radical-ai-studio-kit/` from an earlier Radical CRM / AI Studio experiment.

The Mermaidman editor uses only a small subset of its UI primitives (for example Button, Card, Input, Textarea, Tabs, Badge, Breadcrumbs, and Divider). The same subtree also contains unrelated CRM demos, generated CRM types, experimental 3D components, Frappe hooks, and React code that was not authored to the current Mermaidman/Next.js lint baseline.

For that reason the subtree is excluded from Mermaidman's first-party ESLint gate. This is intentional isolation, not an assertion that the vendored code is lint-clean.

## Preferred cleanup path

1. Copy the small set of primitives Mermaidman actually uses into a first-party `components/ui` area.
2. Preserve behavior and visual tokens with focused screenshots/tests.
3. Remove unused CRM/demo/generated code from the Mermaidman dependency surface.
4. Delete the vendored subtree once no runtime imports remain.
5. Re-enable normal first-party lint rules for the extracted primitives.

Avoid broad refactors inside the vendored kit while it remains auxiliary code; changes should instead reduce Mermaidman's dependency on it.
