import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs", dts: ".d.mts" }),
    dts: true,
    external: ["emdash"],
  },
  {
    entry: { "sandbox-entry": "src/sandbox-entry.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    bundle: true,
    external: ["cloudflare:workers", "cloudflare:email"],
  },
]);
