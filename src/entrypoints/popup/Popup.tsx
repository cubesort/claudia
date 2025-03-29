import React, { useState, useEffect } from 'react';
import { Message, getResponse } from '../../utils/api/anthropic';
import './Popup.css';

export default function Popup() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
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
        if (!userInput.trim()) return;

        const newUserMessage: Message = {
            role: 'user',
            content: userInput,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setUserInput('');
        setLoading(true);

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) throw new Error('Unable to get the active tab.');

            const [{ result: pageContent }] = await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText,
            });

            const apiResponse = await getResponse(apiKey!, [newUserMessage], pageContent);
            const data = await apiResponse.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: data?.content[0].text || 'No response.',
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${(error as Error).message}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
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
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">
                            <p>
                                {message.content
                                    .split('\n')
                                    .map((line, i) =>
                                        line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                                    )}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="message-content">
                            <p>Thinking...</p>
                        </div>
                    </div>
                )}
            </div>
            <form className="input-section" onSubmit={handleSubmit}>
                <textarea
                    className="user-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                    disabled={loading}
                />
                <button className="submit-button" type="submit" disabled={loading}>
                    Ask Claude
                </button>
            </form>
        </div>
    );
}
