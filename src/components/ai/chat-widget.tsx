"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Välkommen till Maison Private Estates. Jag är din personliga AI-assistent. Hur kan jag hjälpa dig idag? Jag kan svara på frågor om våra bostäder, boka visning eller värdering, eller ge dig marknadsinsikter.",
    timestamp: new Date(),
  },
];

const QUICK_ACTIONS = [
  "Visa aktuella objekt",
  "Boka värdering",
  "Marknadsläge Stockholm",
  "Boka visning",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate intelligent AI response (in production this calls the real agent)
    setTimeout(() => {
      const response = generateResponse(content);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 900 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gold-gradient shadow-lg shadow-gold/30 flex items-center justify-center text-black transition-all duration-300 hover:scale-105 hover:shadow-gold/50",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right",
          "bg-black-soft border border-gold/20 shadow-2xl shadow-black/60",
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 bg-black-elevated">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Maison AI</p>
              <p className="text-[11px] text-gold">Online • Svarar direkt</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gold text-black rounded-br-md"
                    : "bg-black-elevated text-gray-200 border border-white/5 rounded-bl-md"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-black-elevated border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        {messages.length < 3 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="text-xs px-3 py-1.5 rounded-full border border-gold/20 text-gold/80 hover:bg-gold/10 hover:border-gold/40 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gold/10 bg-black-elevated">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv din fråga..."
              className="flex-1 bg-black border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/40 transition-colors"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-10 w-10 shrink-0"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("värdering") || lower.includes("boka värdering")) {
    return "Självklart. Jag kan boka en kostnadsfri värdering åt dig. Vilken adress gäller det, och vilken tid passar dig bäst de närmaste dagarna? Du kan också gå direkt till bokningssidan via menyn.";
  }

  if (lower.includes("visning") || lower.includes("boka visning")) {
    return "Gärna. Vi har flera kommande visningar. Är du intresserad av ett specifikt objekt, eller vill du att jag visar de mest aktuella visningstiderna i Östermalm, Vasastan eller Djursholm?";
  }

  if (lower.includes("marknad") || lower.includes("prisutveckling") || lower.includes("stockholm")) {
    return "Marknadsläget i Stockholm är fortsatt stabilt för premiumsegmentet. På Östermalm och i Djursholm ser vi fortsatt stark efterfrågan på objekt över 15 MSEK. Genomsnittlig försäljningstid för våra utvalda objekt ligger just nu på cirka 28 dagar. Vill du ha en mer detaljerad rapport för ett specifikt område?";
  }

  if (lower.includes("objekt") || lower.includes("till salu") || lower.includes("aktuella")) {
    return "Just nu har vi flera exklusiva objekt ute. Bland annat en spektakulär våning på Strandvägen med takterrass, en arkitektritad villa i Djursholm samt en penthouse på Södermalm med utsikt över Riddarfjärden. Vill du att jag filtrerar efter område, pris eller typ av bostad?";
  }

  if (lower.includes("pris") || lower.includes("kostar")) {
    return "Priserna varierar kraftigt beroende på läge, skick och unika kvaliteter. Våra aktuella objekt ligger mellan cirka 12 och 42 miljoner kronor. Berätta gärna mer om dina preferenser så kan jag ge dig mer precisa rekommendationer.";
  }

  return "Tack för din fråga. Jag hjälper dig gärna vidare. För mer specifika uppgifter om enskilda objekt, budgivning eller juridiska frågor kan jag antingen ge dig generell vägledning eller koppla dig direkt till vår ansvarige mäklare. Vad vill du veta mer om?";
}
