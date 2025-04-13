import { useState, useEffect } from "react";
import PrimaryButton from "~/components/PrimaryButton";

export default function Options() {
  const [apiKey, setApiKey] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    browser.storage.local.get(["ClaudiaApiKey"]).then((result) => {
      if (result.ClaudiaApiKey) {
        setApiKey(result.ClaudiaApiKey);
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    browser.storage.local.set({ ClaudiaApiKey: apiKey }).then(() => {
      setStatus("Options saved.");
      setTimeout(() => setStatus(""), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-5 font-sans">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Claudia Options</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="mb-2 block font-medium text-gray-700">
              API Key
            </label>
            <input
              name="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-2 focus:outline-blue-500"
            />
          </div>
          <PrimaryButton>Save</PrimaryButton>
          {status && <div className="mt-4 rounded-md bg-green-50 p-3 text-green-700">{status}</div>}
        </form>
      </div>
    </div>
  );
}
