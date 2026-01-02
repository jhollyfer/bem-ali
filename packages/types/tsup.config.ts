import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "domains/authentication/index": "src/domains/authentication/index.ts",
    "core/index": "src/core/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: "es2024",
  outDir: "dist",
  treeshake: true,
});
