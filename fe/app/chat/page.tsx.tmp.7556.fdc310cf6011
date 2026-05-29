"use client";

import { useRef, useState, useEffect } from "react";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Is salmon healthy?",
  "What can I eat for muscle gain?",
  "Is broccoli keto-friendly?",
  "Suggest an alternative to white rice",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Ask me anything about food, nutrition or diets. 🥗" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.chatbot.ask(message, { conversationHistory: history });
      setMessages((m) => [...m, { role: "assistant", content: res.data.message }]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Chat failed");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Nutrition Assistant</h1>
        <p className="text-muted-foreground mb-6">Powered by the backend chatbot engine.</p>

        <Card className="bg-card/50 border-primary/20 flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/40 p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1 rounded-full border border-border/60 hover:border-primary/40 text-muted-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a food…"
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </>
  );
}
