import { defineConfig } from 'wxt';

export default defineConfig({
    manifest: {
        name: 'Claudia',
        version: '0.1',
        description: 'Ask Claude about current page.',
        permissions: ['storage', 'activeTab', 'scripting'],
        host_permissions: ['https://api.anthropic.com/*'],
    },
    outDir: "dist",
    srcDir: "src",
    modules: ['@wxt-dev/module-react'],
});
