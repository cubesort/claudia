import React, { useState, useEffect } from 'react';
import './Options.css';

export default function Options() {
    const [apiKey, setApiKey] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        browser.storage.local.get(['ClaudiaApiKey']).then((result) => {
            if (result.ClaudiaApiKey) {
                setApiKey(result.ClaudiaApiKey);
            }
        });
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        browser.storage.local.set({ ClaudiaApiKey: apiKey }).then(() => {
            setStatus('Options saved.');
            setTimeout(() => setStatus(''), 2000);
        });
    };

    return (
        <div className="options-container">
            <h1>Claudia Options</h1>
            <form className="options-form" onSubmit={handleSave}>
                <label htmlFor="apiKey">API Key:</label>
                <input
                    id="apiKey"
                    name="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <button type="submit">Save</button>
            </form>
            {status && <div className="options-status">{status}</div>}
        </div>
    );
}
