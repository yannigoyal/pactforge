"use client";

import { useEffect, useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { NdaFormValues } from "@/lib/nda/schema";
import { getNextField, OPTIONAL_FIELD_PATH } from "@/lib/nda/chatFields";
import { applyExtractedFields, sendChatMessage, type ChatMessage } from "@/lib/nda/chat";

interface NdaChatProps {
  values: NdaFormValues;
  setValue: UseFormSetValue<NdaFormValues>;
}

export function NdaChat({ values, setValue }: NdaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAskedOptional, setHasAskedOptional] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const sendHistory = async (history: ChatMessage[]) => {
    setError(null);
    setIsLoading(true);

    const nextField = getNextField(values, hasAskedOptional);

    try {
      const { reply, extractedFields } = await sendChatMessage(history, values, nextField);
      applyExtractedFields(setValue, extractedFields);
      if (nextField?.path === OPTIONAL_FIELD_PATH) setHasAskedOptional(true);
      if (reply.trim()) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTurn = (userText: string | null) => {
    const history =
      userText !== null ? [...messages, { role: "user" as const, content: userText }] : messages;
    if (userText !== null) setMessages(history);
    sendHistory(history);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: kick off the opening question on mount
    sendTurn(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendTurn(text);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Chat with the assistant</h2>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {messages.map((message, index) => (
          <p
            key={index}
            className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
              message.role === "assistant"
                ? "self-start bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "self-end bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            }`}
          >
            {message.content}
          </p>
        ))}
        {isLoading ? (
          <p className="self-start rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Thinking…
          </p>
        ) : null}
        <div ref={scrollAnchorRef} />
      </div>

      {error ? (
        <div role="alert" className="flex items-center justify-between gap-2 text-sm text-red-600 dark:text-red-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => sendHistory(messages)}
            className="shrink-0 font-medium underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type your answer…"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
