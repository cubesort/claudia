import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  manifest: {
    name: "Claudia",
    version: "0.4.2",
    description: "Ask Claude about the current page.",
    permissions: ["storage", "activeTab", "scripting"],
    host_permissions: ["https://api.anthropic.com/*"],
  },
  outDir: "dist",
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
