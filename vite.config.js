// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TanStack Start's route-tree codegen always appends a TS-only
// `import type` / `declare module` footer to routeTree.gen.js, even with
// `router.disableTypes` set — there's no flag to turn that footer off. This
// plugin strips it at load time so the plain-JS build never sees it.
function stripRouteTreeTypeFooter() {
  const target = path.join(__dirname, "src/routeTree.gen.js");
  return {
    name: "strip-route-tree-type-footer",
    load(id) {
      if (id !== target) return null;
      const raw = fs.readFileSync(target, "utf8");
      const cleaned = raw
        .split("\n")
        .filter((line) => !/^import type /.test(line))
        .join("\n")
        .replace(/declare module ['"][^'"]+['"]\s*\{[\s\S]*?\n\}\n?/g, "");
      return cleaned;
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.js (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Plain JavaScript project — no .ts/.tsx sources, so generate routeTree.gen.js.
    router: { disableTypes: true },
  },
  // Explicit alias so "@/..." imports resolve even without a tsconfig.json
  // driving the bundled tsConfigPaths plugin.
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [stripRouteTreeTypeFooter()],
  },
});
