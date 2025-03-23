document.addEventListener('DOMContentLoaded', function () {
    const optionsForm = document.getElementById('options-form');
    const apiKeyInput = document.getElementById('apiKey');
    const status = document.getElementById('status');

    chrome.storage.sync.get(['ClaudiaApiKey'], function (result) {
        if (result.ClaudiaApiKey) {
            apiKeyInput.value = result.ClaudiaApiKey;
        }
    });

    optionsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const apiKey = apiKeyInput.value;
        chrome.storage.sync.set({ ClaudiaApiKey: apiKey }, function () {
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 2000);
        });
    });
});
