import React, { useState, useEffect } from 'react';
import './Popup.css';

export default function Popup() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        browser.storage.local.get(['ClaudiaApiKey']).then((result) => {
            if (result.ClaudiaApiKey) {
                setApiKey(result.ClaudiaApiKey);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) {
            setResponse('Please enter a question.');
            return;
        }

        setLoading(true);
        setResponse('Loading...');

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) {
                throw new Error('Unable to get the active tab.');
            }

            const [{ result: pageContent }] = await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText,
            });

            const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey!,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true',
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
                            content: `User question: <userInput>${userInput}</userInput>`
                        }
                    ],
                    max_tokens: 1024
                }),
            });

            const data = await apiResponse.json();
            const responseText = data?.content[0].text.split('\n')
                .map((line: string) => line.trim() ? `<p>${line}</p>` : '<br>')
                .join('');;

            setResponse(responseText || 'No response.');
        } catch (error) {
            setResponse(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!apiKey) {
        return (
            <div className="popup-container">
                <p>Please set your API key in the options page.</p>
                <button onClick={() => browser.runtime.openOptionsPage()}>Open Options</button>
            </div>
        );
    }

    return (
        <div className="popup-container">
            <div className="header">
                <h1>Claudia</h1>
                <p>Ask Claude about the current page</p>
            </div>
            <div className="response-area" dangerouslySetInnerHTML={{ __html: response }} />
            <form className="input-section" onSubmit={handleSubmit}>
                <textarea
                    className="user-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                />
                <button className="submit-button" type="submit" disabled={loading}>
                    Ask Claude
                </button>
            </form>
        </div>
    );
}
