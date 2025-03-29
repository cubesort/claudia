document.addEventListener('DOMContentLoaded', function () {
    browser.storage.local.get(['ClaudiaApiKey']).then((result) => {
        if (!result.ClaudiaApiKey) {
            document.getElementById('content').innerHTML = `
                <p>Please set your API key.</p>
                <button id="open-options">Open Options</button>
            `;
            document.getElementById('open-options').addEventListener('click', function () {
                browser.runtime.openOptionsPage();
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

    async function handleSubmit() {
        const inputText = userInput.value.trim();
        if (!inputText) {
            responseArea.textContent = 'Please ask a question.';
            return;
        }

        responseArea.textContent = 'Loading...';

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

            const [{ result: pageContent }] = await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText,
            });

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
                    system: [
                        {
                            type: "text",
                            text: 'You are a helpful AI assistant analyzing webpage content. ' +
                                'The full content of the webpage will be provided in a separate ' +
                                'system prompt. The user question will be provided in a message ' +
                                'prompt. Focus on providing clear, concise answers based on the ' +
                                'webpage content. If the answer cannot be found in the webpage ' +
                                'content, clearly state that.'
                        },
                        {
                            type: "text",
                            text: `Page content: <pageContent>${pageContent}</pageContent>`,
                            cache_control: { "type": "ephemeral" }
                        },
                    ],
                    messages: [
                        {
                            role: 'user',
                            content: `User question: <userInput>${inputText}</userInput>`
                        }
                    ],
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
    }

    submitButton.addEventListener('click', handleSubmit);

    userInput.addEventListener('keydown', async function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit();
        }
    });
}
