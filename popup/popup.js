function saveOptions() {
    const userInput = document.getElementById('user-input').value;
    chrome.storage.sync.set({ userInput: userInput }, function () {
        console.log('Options saved:', userInput);
    });
}

function restoreOptions() {
    chrome.storage.sync.get(['userInput'], function (result) {
        document.getElementById('user-input').value = result.userInput || '';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['ClaudiaApiKey'], function (result) {
        console.log('API key:', result.ClaudiaApiKey);
        if (!result.ClaudiaApiKey) {
            document.getElementById('content').innerHTML = `
                <p>Please set your API key.</p>
                <button id="open-options">Open Options</button>
            `;
            document.getElementById('open-options').addEventListener('click', function () {
                chrome.runtime.openOptionsPage();
            });
        } else {
            initializePopup(result.ClaudiaApiKey);
        }
    });
});

function initializePopup(apiKey) {
    const submitButton = document.getElementById('submit-button');
    const userInput = document.getElementById('user-input');
    const responseArea = document.getElementById('response-area');

    submitButton.addEventListener('click', async function () {
        const inputText = userInput.value.trim();
        if (!inputText) {
            responseArea.textContent = 'Please enter some text';
            return;
        }

        responseArea.textContent = 'Loading...';

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    messages: [{
                        role: 'user',
                        content: inputText
                    }],
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            responseArea.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            responseArea.textContent = 'Error: ' + error.message;
        }
    });
}
