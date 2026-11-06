// Flat ESLint config for Next 16.
//
// History: this file used to load the Next presets through FlatCompat, i.e.
// `compat.extends("next/core-web-vitals", "next/typescript")`. That path made
// ESLint 10 crash before linting a single file:
//
//   TypeError: Converting circular structure to JSON
//   at @eslint/eslintrc/lib/shared/config-validator.js
//
// The reason is that since Next 16, `eslint-config-next` ships its presets as
// native flat config, not as legacy `extends` strings. Handing a flat config to
// FlatCompat asks @eslint/eslintrc to validate it as a legacy shareable config,
// and the plugin object it contains is circular, so JSON.stringify blows up.
// ESLint 10 also dropped the legacy eslintrc pipeline entirely, so there is no
// version of that arrangement that works.
//
// The fix is to import the presets directly and spread them into the array.
// `asArray` keeps this working whether a preset exports one config object or an
// array of them, so a minor bump in eslint-config-next can't silently break the
// lint step again.
//
// To add project rules, append objects to the exported array. Keep the surface
// small and intentional — rules exist to catch real bugs, not to re-litigate
// style preferences the formatter already handles.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const asArray = (preset) => (Array.isArray(preset) ? preset : [preset]);

export default [
  ...asArray(nextCoreWebVitals),
  ...asArray(nextTypescript),
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "cloudflare-env.d.ts",
      "next-env.d.ts",
      "public/**",
    ],
  },
];
