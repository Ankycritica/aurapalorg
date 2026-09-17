import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, History, Plus, X } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updated_at: string };

const SUGGESTIONS = [
  "Rewrite my top resume bullet to be stronger",
  "What should I say when they ask my salary expectation?",
  "Turn my plan into what I should do this week",
  "How do I explain a six-month career gap?",
];

/**
 * Conversational layer over the one-shot plan. The plan is passed as seedPlan on
 * the first message so Aura can refer to it; after that the thread carries its
 * own history server-side.
 */
export function AuraChat({ seedPlan }: { seedPlan?: unknown }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  const loadThreads = useCallback(async () => {
    const { data } = await supabase
      .from("chat_threads").select("id, title, updated_at")
      .order("updated_at", { ascending: false }).limit(20);
    setThreads((data as Thread[]) ?? []);
  }, []);

  const openThread = async (id: string) => {
    const { data } = await supabase
      .from("chat_messages").select("role, content")
      .eq("thread_id", id).order("created_at", { ascending: true });
    setMessages((data as Msg[]) ?? []);
    setThreadId(id);
    setShowHistory(false);
  };

  const newThread = () => {
    setMessages([]);
    setThreadId(null);
    setShowHistory(false);
    taRef.current?.focus();
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in again."); setStreaming(false); return; }

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/aura-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: content,
          threadId,
          // Only useful when the thread is being created.
          seedPlan: threadId ? undefined : seedPlan ?? undefined,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Aura could not reply. Please try again.");
      }

      const newId = resp.headers.get("x-thread-id");
      if (newId && !threadId) setThreadId(newId);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { /* partial frame */ }
        }
      }

      if (!acc.trim()) throw new Error("Aura returned an empty reply.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
        return copy;
      });
      toast.error(msg);
    } finally {
      setStreaming(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight">Ask Aura</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => { setShowHistory((s) => !s); if (!showHistory) loadThreads(); }}>
            {showHistory ? <X className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
            {showHistory ? "Close" : "History"}
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={newThread}>
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          )}
        </div>
      </header>

      {showHistory ? (
        <div className="max-h-[420px] overflow-y-auto p-3">
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-6 text-center">
              No saved conversations yet. They appear here once you start chatting.
            </p>
          ) : (
            threads.map((t) => (
              <button key={t.id} onClick={() => openThread(t.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <p className="text-sm truncate">{t.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(t.updated_at).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="max-h-[460px] min-h-[180px] overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Aura remembers your plan. Ask it to go deeper on any part of it.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-4 py-2.5 text-sm"
                      : "max-w-[92%] text-sm leading-relaxed"
                  }>
                    {m.role === "assistant" && !m.content && streaming ? (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                      </span>
                    ) : m.role === "assistant" ? (
                      <div className="prose-aura [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h3]:font-semibold [&_h3]:mt-3 [&_strong]:text-foreground [&_strong]:font-semibold text-muted-foreground">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/50 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask a follow-up…  (Enter to send, Shift+Enter for a new line)"
                className="flex-1 resize-none bg-secondary/40 border border-border/50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-border max-h-32"
                disabled={streaming}
              />
              <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl"
                onClick={() => send()} disabled={streaming || !input.trim()}>
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 px-1">
              Conversations are saved to your account so you can pick them up later.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
