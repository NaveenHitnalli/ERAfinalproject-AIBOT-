import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChat(language: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      };

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            language,
          }),
        }
      );

      if (resp.status === 429) {
        setMessages([...newMessages, { role: "assistant", content: "I'm receiving too many requests right now. Please try again in a moment." }]);
        return;
      }
      if (resp.status === 402) {
        setMessages([...newMessages, { role: "assistant", content: "Service is temporarily unavailable. Please try again later." }]);
        return;
      }

      if (!resp.ok) {
        throw new Error("Failed to get response");
      }

      const data = await resp.json();
      setMessages([...newMessages, { role: "assistant", content: data.content || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, isLoading, sendMessage, clearMessages };
}
