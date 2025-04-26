import { useState, useEffect, useRef } from "react";
import { Message, CLAUDE_MODELS, getResponse } from "~/utils/api/anthropic";
import PrimaryButton from "~/components/PrimaryButton";

export default function Popup() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(
    CLAUDE_MODELS.claude_3_5_haiku.apiString,
  );
  const lastUserMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    browser.storage.local.get(["ClaudiaApiKey"]).then((result) => {
      if (result.ClaudiaApiKey) {
        setApiKey(result.ClaudiaApiKey);
      }
    });
  }, []);

  useEffect(() => {
    if (lastUserMessageRef.current) {
      lastUserMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: Message = {
      role: "user",
      content: userInput,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("Unable to get the active tab.");

      const [{ result: pageContent = "" }] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
      });

      const response = await getResponse(
        apiKey!,
        [...messages, newUserMessage],
        pageContent,
        selectedModel,
      );
      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data?.content[0].text || "No response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${(error as Error).message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  if (!apiKey) {
    return (
      <div className="w-[400px] space-y-4 p-3 font-sans text-[14px] text-gray-800">
        <p>Please set your API key in the options page.</p>
        <PrimaryButton onClick={() => browser.runtime.openOptionsPage()}>
          Open Options
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex max-h-[600px] w-[400px] flex-col p-3 font-sans text-[14px] text-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Claudia</h1>
        <p className="text-gray-600">Ask Claude about the current page</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-md px-3 py-2 ${
              message.role === "user" ? "self-end bg-blue-500 text-white" : "self-start bg-gray-100"
            }`}
            ref={
              index === messages.length - 1 && message.role === "user" ? lastUserMessageRef : null
            }
          >
            <div className="text-sm break-words whitespace-pre-wrap">
              {message.content
                .split("\n")
                .map((line, i) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="self-start rounded-md bg-gray-100 px-3 py-2">
            <div className="text-sm break-words whitespace-pre-wrap">
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>
      <form className="border-t border-gray-300 pt-4" onSubmit={handleSubmit}>
        <textarea
          className="h-[60px] w-full resize-none rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-2 focus:outline-blue-500 disabled:bg-gray-50"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={loading}
        />
        <div className="mt-2 flex justify-end gap-3">
          <select
            className="cursor-pointer rounded border border-r-8 border-transparent p-2 outline outline-gray-300 focus:outline-2 focus:outline-blue-500 disabled:bg-gray-50"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
          >
            {Object.keys(CLAUDE_MODELS).map((modelKey: string) => {
              const model = CLAUDE_MODELS[modelKey as keyof typeof CLAUDE_MODELS];

              return (
                <option
                  key={model.apiString}
                  value={model.apiString}
                  selected={selectedModel === model.apiString}
                >
                  {model.name}
                </option>
              );
            })}
          </select>
          <PrimaryButton type="submit" disabled={loading}>
            Ask Claude
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
