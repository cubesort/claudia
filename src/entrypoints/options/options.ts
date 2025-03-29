document.addEventListener('DOMContentLoaded', function () {
    const optionsForm = document.getElementById('options-form');
    const apiKeyInput = document.getElementById('apiKey');
    const status = document.getElementById('status');

    browser.storage.local.get(['ClaudiaApiKey']).then((result) => {
        if (result.ClaudiaApiKey) {
            apiKeyInput.value = result.ClaudiaApiKey;
        }
    });

    optionsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const apiKey = apiKeyInput.value;
        browser.storage.local.set({ ClaudiaApiKey: apiKey }).then(() => {
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 2000);
        });
    });
});
