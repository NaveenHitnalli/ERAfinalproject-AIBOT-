import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Bot, ExternalLink } from "lucide-react";

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
          <div className="prose prose-sm prose-slate max-w-none [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_a]:text-primary [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline [&_hr]:border-border [&_table]:text-foreground [&_th]:text-foreground [&_td]:text-foreground">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => (
                  <div className="my-3 rounded-xl overflow-hidden border border-border bg-card shadow-sm max-w-[260px]">
                    <img
                      src={src}
                      alt={alt || "Product"}
                      className="w-full h-[200px] object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop";
                      }}
                    />
                  </div>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-lg text-xs hover:bg-primary/20 transition-colors no-underline"
                  >
                    {children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
