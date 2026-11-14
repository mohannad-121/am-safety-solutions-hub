import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { answerCustomer, type AssistantReply } from "@/lib/assistant";

type Message = { id: number; role: "assistant" | "customer"; text: string; links?: AssistantReply["links"] };
const quickQuestions = ["Which protection suits a slab edge?", "Help me choose a safety net", "What is EN 13374?", "I need a quotation"];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", text: "Hello. Tell me about your project or choose a common question below." }]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const ask = (question: string) => {
    const cleaned = question.trim().slice(0, 300);
    if (!cleaned) return;
    const reply = answerCustomer(cleaned);
    const stamp = Date.now();
    setMessages((current) => [...current, { id: stamp, role: "customer", text: cleaned }, { id: stamp + 1, role: "assistant", text: reply.text, links: reply.links }]);
    setQuery("");
  };

  const submit = (event: FormEvent) => { event.preventDefault(); ask(query); };

  return <div className="fixed bottom-5 right-5 z-[70]">
    <button type="button" aria-label={open ? "Close AMBS assistant" : "Open AMBS assistant"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl transition hover:scale-105">{open ? <X/> : <MessageCircle/>}</button>
    {open && <section className="absolute bottom-16 right-0 flex h-[min(620px,calc(100dvh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-border bg-white shadow-2xl" aria-label="AMBS project assistant">
      <header className="bg-[#20262b] px-5 py-4 text-white"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold uppercase">AMBS Project Assistant</h2><p className="mt-1 text-xs text-white/65">Products, standards and project guidance</p></div><span className="h-2.5 w-2.5 rounded-full bg-green-400" title="Available"/></div></header>
      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f5f6f7] p-4" aria-live="polite">{messages.map((message) => <div key={message.id} className={message.role === "customer" ? "ml-8" : "mr-5"}><div className={`rounded-lg px-4 py-3 text-sm leading-6 ${message.role === "customer" ? "bg-accent text-white" : "border border-border bg-white text-foreground"}`}>{message.text}</div>{message.links && message.links.length > 0 && <div className="mt-2 grid gap-2">{message.links.map((link) => <Link key={link.path} to={link.path} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm font-bold transition hover:border-accent hover:text-accent"><span><small className="mr-2 text-[10px] uppercase text-muted-foreground">{link.label}</small>{link.title}</span><ArrowUpRight size={15}/></Link>)}</div>}</div>)}</div>
      {messages.length === 1 && <div className="flex flex-wrap gap-2 border-t border-border px-4 pt-3">{quickQuestions.map((question) => <button key={question} type="button" onClick={() => ask(question)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:border-accent hover:text-accent">{question}</button>)}</div>}
      <form onSubmit={submit} className="flex gap-2 p-4"><label htmlFor="ambs-assistant-input" className="sr-only">Ask the AMBS project assistant</label><input id="ambs-assistant-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about your project..." maxLength={300} className="h-11 min-w-0 flex-1 rounded-md border border-border px-3 text-sm outline-none focus:border-accent"/><button type="submit" disabled={!query.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><Send size={18}/></button></form>
      <p className="border-t border-border px-4 py-2 text-[10px] leading-4 text-muted-foreground">General guidance only. Final project-specific design and approval must be confirmed by the responsible consultant or qualified engineer.</p>
    </section>}
  </div>;
}
