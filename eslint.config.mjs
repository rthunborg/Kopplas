import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    "supabase/.temp/**",
    "tmp/**",
    // Immutable BMAD render cache contains generated Markdown/JSON, not source.
    "_bmad/render/**",
    // Immutable supplied design exports are reference evidence, not app source.
    "docs/design/claude-design/v*/handoff/**",
  ]),
]);

export default eslintConfig;
