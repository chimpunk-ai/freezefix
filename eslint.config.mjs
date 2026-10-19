// Flat ESLint config for Next 16. Uses FlatCompat to pull in the shareable
// configs that eslint-config-next ships (which are still in the legacy
// extends format for now), then adds ignores for build output and generated
// files that aren't meant to be linted.
//
// To add project rules, append objects to the exported array. Keep the
// surface small and intentional — rules exist to catch real bugs, not to
// re-litigate style preferences the formatter already handles.

import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "cloudflare-env.d.ts",
      "next-env.d.ts",
      ".wrangler/**",
      "public/**",
    ],
  },
];
