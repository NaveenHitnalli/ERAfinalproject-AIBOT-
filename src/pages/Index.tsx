import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag, LogOut, LogIn, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { useCart } from "@/context/CartContext";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { VoiceSearchButton } from "@/components/chat/VoiceSearchButton";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { QuickActionButtons } from "@/components/chat/QuickActionButtons";
import { CartSidebar } from "@/components/chat/CartSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const [language, setLanguage] = useState("en");
  const [input, setInput] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages } = useChat(language);
  const { itemCount, isAuthenticated, refreshCart, session } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickAction = (message: string) => {
    if (isLoading) return;
    sendMessage(message);
  };

  const handleVoiceResult = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    refreshCart();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-medium tracking-tight text-foreground">
              Shopping Assistant
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Ask me anything about products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSelector value={language} onChange={setLanguage} />

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
              title="Sign in"
            >
              <LogIn className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  How can I help you shop today?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Search products, manage your cart, or get recommendations
                </p>
              </div>
              <QuickActionButtons onAction={handleQuickAction} disabled={isLoading} />
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 mb-4"
            >
              <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse-soft" />
              </div>
              <div className="flex gap-1 items-center pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions when there are messages */}
      {messages.length > 0 && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-2">
          <QuickActionButtons onAction={handleQuickAction} disabled={isLoading} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 hover:bg-surface rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-1 bg-surface rounded-xl px-3 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Search products, ask for recommendations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5"
              disabled={isLoading}
            />
            <VoiceSearchButton onResult={handleVoiceResult} language={language} />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => { setIsCartOpen(false); refreshCart(); }} />
    </div>
  );
}
