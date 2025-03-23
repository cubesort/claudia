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
            responseArea.textContent = 'Please ask a question.';
            return;
        }

        responseArea.textContent = 'Loading...';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const [{ result: pageContent }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText,
            });

            const prompt = 'You are a helpful AI assistant analyzing webpage content. ' +
                'Below is the content from the current webpage, followed by a user\'s question. ' +
                'Focus on providing clear, concise answers based on the page content.' +
                `Page content: <pageContent>${pageContent}</pageContent>. ` +
                `User question: <userInput>${inputText}</userInput> ` +
                'Please answer the question based on the page content above. ' +
                'If the answer cannot be found in the page content, clearly state that.';

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
                        content: prompt
                    }],
                    max_tokens: 1024
                })
            });

            const data = await response.json();
            if (data.content && data.content[0] && data.content[0].text) {
                const responseText = data.content[0].text;
                responseArea.innerHTML = responseText
                    .split('\n')
                    .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
                    .join('');
            } else {
                responseArea.textContent = 'Unexpected response.';
            }
        } catch (error) {
            responseArea.textContent = 'Error: ' + error.message;
        }
    });
}
