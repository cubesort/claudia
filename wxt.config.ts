import { defineConfig } from 'wxt';

export default defineConfig({
    manifest: {
        name: 'Claudia',
        version: '0.1',
        description: 'Ask Claude about current page.',
        permissions: ['storage', 'activeTab', 'scripting'],
        host_permissions: ['https://api.anthropic.com/*'],
        action: {
            default_popup: 'popup/popup.html',
        },
        options_page: 'options/options.html',
    },
    outDir: "dist",
    srcDir: "src",
});
