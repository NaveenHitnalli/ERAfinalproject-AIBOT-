import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] };

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? "bg-chat-user" : "bg-surface"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-chat-user-foreground" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-foreground" />
        )}
      </div>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-[12px_12px_2px_12px] px-4 py-2.5"
            : "text-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
