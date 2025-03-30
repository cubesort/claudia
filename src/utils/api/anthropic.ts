export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function getResponse(apiKey: string, messages: Message[], pageContent: string) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      system: [
        {
          type: "text",
          text:
            "You are a helpful AI assistant analyzing webpage content. " +
            "The full content of the webpage will be provided in a separate " +
            "system prompt. The user question will be provided in a message " +
            "prompt. Focus on providing clear, concise answers based on the " +
            "webpage content and the conversation history. If the answer " +
            "cannot be found in the webpage content, clearly state that.",
        },
        {
          type: "text",
          text: `<webpageContent>${pageContent}</webpageContent>`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: createApiMessages(messages),
      max_tokens: 1024,
    }),
  });
}

interface TextMessage {
  role: "user" | "assistant";
  content: [
    {
      type: "text";
      text: string;
      cache_control?: {
        type: "ephemeral";
      };
    },
  ];
}

const createApiMessages = (messages: Message[]) => {
  return messages.map(({ role, content }, index) => {
    const isLastMessage = index === messages.length - 1;
    const isThirdToLast = index === messages.length - 3;

    const textMessage: TextMessage = {
      role: role,
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };

    if (isLastMessage || isThirdToLast) {
      textMessage.content[0].cache_control = { type: "ephemeral" };
    }

    return textMessage;
  });
};
