export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const CLAUDE_MODELS = {
  claude_3_7_sonnet: {
    name: "Claude 3.7 Sonnet",
    apiString: "claude-3-7-sonnet-latest",
  },

  claude_3_5_haiku: {
    name: "Claude 3.5 Haiku",
    apiString: "claude-3-5-haiku-latest",
  },
  claude_3_5_sonnet_v2: {
    name: "Claude 3.5 Sonnet",
    apiString: "claude-3-5-sonnet-latest",
  },
  claude_3_opus: {
    name: "Claude 3 Opus",
    apiString: "claude-3-opus-latest",
  },
};

export async function getResponse(
  apiKey: string,
  messages: Message[],
  pageContent: string,
  model: string,
) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      system: [
        {
          type: "text",
          text:
            "You are a helpful AI assistant analyzing webpage content. Primary directive:\n" +
            "1. Start with information from the webpage\n" +
            "2. After providing the page's information, if you have additional relevant knowledge, ask: " +
            "'Would you like me to provide additional context about this topic?'\n" +
            "3. If the topic isn't covered in the page at all, say 'This topic isn't covered in the current page. " +
            "Would you like me to share what I know about it?'\n" +
            "4. When the user agrees, provide the additional information directly without asking again\n" +
            "5. When sharing your knowledge, only add factual, relevant information and preface with " +
            "'Based on my knowledge...'\n" +
            "6. Keep responses clear, concise, and accurate.",
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
      role,
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
