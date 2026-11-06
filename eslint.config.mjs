// Flat ESLint config for Next 16. eslint-config-next 16 ships native flat
// configs, so we import them directly — going through FlatCompat crashes on
// ESLint 10 ("Converting circular structure to JSON") because the shareable
// configs carry plugin objects with cycles.
//
// To add project rules, append objects to the exported array. Keep the surface
// small and intentional — rules exist to catch real bugs, not to re-litigate
// style preferences the formatter already handles.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
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

export default config;
