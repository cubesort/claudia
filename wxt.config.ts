import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Claudia",
    version: "0.2.0",
    description: "Ask Claude about the current page.",
    permissions: ["storage", "activeTab", "scripting"],
    host_permissions: ["https://api.anthropic.com/*"],
  },
  outDir: "dist",
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
});
