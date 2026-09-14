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
      "Hej, välkommen till Maison Private Estates. Jag hjälper dig gärna vidare – oavsett om du tittar på ett objekt, vill ha en värdering eller bara vill stämma av marknaden. Vad kan jag hjälpa dig med?",
    timestamp: new Date(),
  },
];

const QUICK_ACTIONS = [
  "Jag vill boka ett möte",
  "Berätta om aktuella objekt",
  "Boka värdering",
  "Jag tittar på en bostad",
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
    }, 700 + Math.random() * 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gold-gradient shadow-lg shadow-gold/30 flex items-center justify-center text-black transition-all duration-300 hover:scale-105 hover:shadow-gold/50",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right",
          "bg-black-soft border border-gold/20 shadow-2xl shadow-black/60",
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        )}
      >
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

/**
 * Professionell, naturlig ton.
 * Mål: leda samtalet mot bokning av möte med mäklaren
 * utan att låta säljande eller konstlat.
 */
function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  // Direkt bokning
  if (
    lower.includes("boka möte") ||
    lower.includes("boka ett möte") ||
    lower.includes("kundmöte") ||
    lower.includes("träffa mäklare") ||
    lower.includes("prata med mäklare")
  ) {
    return "Självklart. Det enklaste är att du lämnar namn, telefonnummer och ungefär när det passar – så ser vi till att mäklaren återkommer och bokar in en tid. Vill du hellre boka värdering eller en visning direkt?";
  }

  // Tittar på objekt / visar intresse
  if (
    lower.includes("tittar") ||
    lower.includes("intresserad") ||
    lower.includes("bostad") ||
    lower.includes("objekt") ||
    lower.includes("lägenhet") ||
    lower.includes("villa") ||
    lower.includes("strandvägen") ||
    lower.includes("djursholm") ||
    lower.includes("södermalm") ||
    lower.includes("öser")
  ) {
    return "Bra att du hör av dig. För att komma vidare ordentligt brukar det bästa vara ett kort samtal eller möte med vår mäklare – då kan ni gå igenom just det som är viktigt för dig. Vill du att jag hjälper dig att boka in en tid, eller föredrar du att börja med mer information om ett specifikt objekt?";
  }

  // Värdering
  if (lower.includes("värdering") || lower.includes("vad är min bostad värd")) {
    return "Absolut. En värdering är kostnadsfri och ger dig en tydlig bild av marknadsläget. Om du vill kan jag ta emot adress och önskemål om tid, så bokar mäklaren in ett möte med dig. Vilken adress gäller det?";
  }

  // Visning
  if (lower.includes("visning") || lower.includes("boka visning")) {
    return "Gärna. Säg vilket objekt eller område det gäller, så kan jag antingen ge dig kommande visningstider eller se till att du får en privat genomgång med mäklaren. Många föredrar det senare – det blir mer konkret.";
  }

  // Marknad
  if (
    lower.includes("marknad") ||
    lower.includes("prisutveckling") ||
    lower.includes("stockholm")
  ) {
    return "Premiumsegmentet i Stockholm håller sig stabilt, särskilt i områden som Östermalm och Djursholm. För att få en bild som stämmer för just dig är det ofta mest värdefullt att sitta ner en stund med mäklaren. Ska jag hjälpa dig att boka ett sådant möte?";
  }

  // Pris
  if (lower.includes("pris") || lower.includes("kostar") || lower.includes("budget")) {
    return "Priserna varierar beroende på läge och skick – våra objekt ligger ungefär mellan 12 och 42 miljoner. Om du berättar ungefärligt spann och område kan jag peka ut relevanta bostäder. Vill du också att mäklaren ringer upp dig för att stämma av mer i detalj?";
  }

  // Aktuella objekt
  if (
    lower.includes("aktuella") ||
    lower.includes("till salu") ||
    lower.includes("visa") ||
    lower.includes("rekommendera")
  ) {
    return "Just nu har vi bland annat en våning på Strandvägen, en villa i Djursholm och en penthouse på Södermalm. Vill du att jag filtrerar efter område eller budget? Annars kan mäklaren gå igenom alternativen med dig i ett kort möte – det sparar ofta tid.";
  }

  // Vem / mäklaren
  if (
    lower.includes("mäklare") ||
    lower.includes("grundare") ||
    lower.includes("vem")
  ) {
    return "Du pratar med teamet bakom Maison Private Estates. Vår ansvarige mäklare tar de flesta kundmötena personligen och har lång erfarenhet av premiumsegmentet i Stockholm. Vill du att jag bokar in dig för ett samtal eller möte med honom?";
  }

  // Tveksamhet / bara tittar
  if (
    lower.includes("bara tittar") ||
    lower.includes("vet inte") ||
    lower.includes("kanske") ||
    lower.includes("senare")
  ) {
    return "Det är helt okej. Många börjar precis där. Om du vill kan du lämna en kontaktuppgift så hör mäklaren av sig när det passar dig – utan förpliktelser. Annars finns jag här om du får frågor längs vägen.";
  }

  // Standard – alltid mjuk stängning mot möte
  return "Tack, jag hjälper dig gärna. För att komma vidare på riktigt brukar ett kort möte eller samtal med vår mäklare vara det mest effektiva. Vill du att jag hjälper dig att boka in det, eller har du en mer specifik fråga först?";
}
