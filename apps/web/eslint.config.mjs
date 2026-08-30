import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Mermaidman predates the React Compiler-oriented hook rules enabled by
    // current Next.js lint presets. Keep correctness-oriented hook checks, but
    // do not make compiler optimization eligibility a merge gate yet.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Generated Rust/WASM glue is verified by cargo/wasm-pack, not ESLint.
    "public/wasm/**",
    "src/rust-engine/pkg/**",
    "src/rust-engine/target/**",
    "src/hooks/mermaidman_engine.js",

    // Bundled Radical AI Studio Kit contains upstream/demo/CRM code and
    // generated types. Mermaidman consumes a small set of UI primitives from
    // it, but the subtree is not maintained as first-party Mermaidman source.
    "src/components/radical-ai-studio-kit/**",
  ]),
]);

export default eslintConfig;
