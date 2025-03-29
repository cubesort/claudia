export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function getResponse(
    apiKey: string,
    messages: Message[],
    pageContent: string | undefined
) {
    return fetch('https://api.anthropic.com/v1/messages', {
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
                    type: 'text',
                    text:
                        'You are a helpful AI assistant analyzing webpage content. ' +
                        'The full content of the webpage will be provided in a separate ' +
                        'system prompt. The user question will be provided in a message ' +
                        'prompt. Focus on providing clear, concise answers based on the ' +
                        'webpage content. If the answer cannot be found in the webpage ' +
                        'content, clearly state that.',
                },
                {
                    type: 'text',
                    text: `Page content: <pageContent>${pageContent}</pageContent>`,
                    cache_control: { type: 'ephemeral' },
                },
            ],
            messages: [
                {
                    role: messages[0].role,
                    content: `User question: <userInput>${messages[0].content}</userInput>`,
                },
            ],
            max_tokens: 1024,
        }),
    });
}
