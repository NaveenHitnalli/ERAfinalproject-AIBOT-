import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { User, Bot, ExternalLink, ShoppingCart } from "lucide-react";
import { useState } from "react";

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
          <div className="prose prose-sm prose-slate max-w-none [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_a]:text-primary [&_a]:font-medium [&_hr]:border-border [&_table]:text-xs [&_th]:text-foreground [&_td]:text-foreground [&_th]:px-2 [&_td]:px-2 [&_th]:py-1.5 [&_td]:py-1.5 [&_table]:border-border [&_tr]:border-border">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => <ProductImage src={src || ""} alt={alt || "Product"} />,
                a: ({ href, children }) => {
                  const text = String(children);
                  const isBuyLink = text.toLowerCase().includes("buy") || text.includes("→") || text.includes("🛒");
                  
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 no-underline transition-colors text-xs font-medium rounded-lg px-3 py-1.5 ${
                        isBuyLink
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {isBuyLink && <ShoppingCart className="w-3 h-3" />}
                      {children}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-border">
                    <table className="w-full text-xs">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-muted/50 text-foreground font-semibold text-left px-3 py-2 border-b border-border">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 border-b border-border/50">{children}</td>
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

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Generate a better fallback based on alt text
  const getFallbackUrl = () => {
    const terms = alt.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).slice(0, 4).join(",");
    return `https://source.unsplash.com/400x500/?${terms},fashion,clothing`;
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border bg-card shadow-sm max-w-[240px]">
      {!loaded && (
        <div className="w-full h-[200px] bg-muted animate-pulse flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-muted-foreground/30" />
        </div>
      )}
      <img
        src={error ? getFallbackUrl() : src}
        alt={alt}
        className={`w-full h-[200px] object-cover ${loaded ? "block" : "hidden"}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }}
      />
    </div>
  );
}
