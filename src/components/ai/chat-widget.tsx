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

type Booking = {
  step: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  type: string;
  preferredTime: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hej, jag är Erfans assistent. Jag svarar på vanliga frågor om att köpa och sälja i Sollentuna – och kan boka in ett möte, en visning eller en värdering. Vad kan jag hjälpa dig med?",
    timestamp: new Date(),
  },
];

const QUICK_ACTIONS = [
  "Boka möte",
  "Boka värdering",
  "Hur går en försäljning till?",
  "Vem är Erfan?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pushAssistant = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const startBooking = (type: string) => {
    setBooking({
      step: 1,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      type,
      preferredTime: "",
    });
    return (
      "Självklart. Jag bokar " +
      type +
      " åt dig. Vad heter du i förnamn?"
    );
  };

  const finishBooking = async (data: Booking) => {
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          type: data.type,
          preferredTime: data.preferredTime,
          message: "Bokning via AI-chatt: " + data.type,
          booking: true,
          forceNotify: true,
        }),
      });
      const { pushToCrm } = await import("@/lib/crm-client");
      pushToCrm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        message: "Bokning via AI-chatt: " + data.type,
        flag: "hot",
        source: "AI-chatt",
        type: data.type,
      });
    } catch {}
    setBooking(null);
    return (
      "Tack " +
      data.firstName +
      ". Jag har skickat förfrågan till Erfan med namn, telefon och e-post. Han återkommer så snart han kan för att bekräfta " +
      data.type +
      (data.preferredTime ? " (" + data.preferredTime + ")" : "") +
      "."
    );
  };

  const handleBookingStep = async (text: string): Promise<string> => {
    if (!booking) return generateGeneral(text);
    const next = { ...booking };
    if (next.step === 1) {
      next.firstName = text;
      next.step = 2;
      setBooking(next);
      return "Tack. Och efternamn?";
    }
    if (next.step === 2) {
      next.lastName = text;
      next.step = 3;
      setBooking(next);
      return "Vilket telefonnummer når Erfan dig bäst på?";
    }
    if (next.step === 3) {
      next.phone = text;
      next.step = 4;
      setBooking(next);
      return "Vilken e-postadress ska vi använda?";
    }
    if (next.step === 4) {
      next.email = text;
      next.step = 5;
      setBooking(next);
      return "Vilken dag och tid passar ungefär? Till exempel tisdag eftermiddag.";
    }
    next.preferredTime = text;
    return await finishBooking(next);
  };

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      let response: string;
      if (booking) {
        response = await handleBookingStep(content);
      } else {
        const lower = content.toLowerCase();
        if (
          lower.includes("boka") ||
          lower.includes("möte") ||
          lower.includes("visning") ||
          lower.includes("värdering")
        ) {
          let type = "ett möte";
          if (lower.includes("värdering")) type = "en värdering";
          else if (lower.includes("visning")) type = "en visning";
          response = startBooking(type);
        } else {
          response = generateGeneral(content);
        }
      }
      pushAssistant(response);
      setIsTyping(false);
    }, 500);
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
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 bg-black-elevated">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gold-gradient flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Erfans assistent</p>
              <p className="text-[11px] text-gold">Online · Bokar möten</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length < 3 && !booking && (
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
              className="flex-1 bg-black border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gold/40"
            />
            <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

function generateGeneral(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("erfan") || lower.includes("vem") || lower.includes("mäklare")) {
    return "Erfan Irandost är registrerad fastighetsmäklare i Sollentuna, utbildad vid KTH med över nio års erfarenhet inom försäljning och service. Han tar helhetsansvar från första mötet till avslut. Vill du att jag bokar ett samtal med honom?";
  }
  if (lower.includes("sälj") || lower.includes("försälj")) {
    return "En försäljning börjar med ett möte och en värdering. Därefter planeras visning, marknadsföring och budgivning. Erfan följer processen hela vägen och återkopplar löpande. Ska jag boka en värdering?";
  }
  if (lower.includes("köp")) {
    return "När du vill köpa hjälper Erfan dig att formulera vad du söker, bevaka marknaden i Sollentuna och gå vidare när rätt bostad dyker upp. Ett kort möte räcker ofta för att komma igång. Vill du boka det?";
  }
  if (lower.includes("sollentuna") || lower.includes("område") || lower.includes("marknad")) {
    return "Sollentuna har en blandning av villor, radhus och lägenheter – från Tureberg och Häggvik till Edsviken, Viby och Väsjön. Marknaden rör sig, så en aktuell genomgång med Erfan ger en bättre bild än generella siffror. Vill du boka ett möte?";
  }
  if (lower.includes("provision") || lower.includes("kostar") || lower.includes("arvode") || lower.includes("pris")) {
    return "Arvode och upplägg går vi igenom personligen – det beror på uppdraget. Det enklaste är ett kostnadsfritt första möte. Ska jag boka in det?";
  }
  if (lower.includes("värdering")) {
    return "En värdering är kostnadsfri och ger en tydlig bild av läget. Jag kan boka den åt dig direkt om du vill.";
  }
  if (lower.includes("hej") || lower.includes("hallå") || lower.includes("tjena")) {
    return "Hej. Jag hjälper dig med frågor om att köpa eller sälja i Sollentuna, och kan boka möte med Erfan. Vad är du ute efter?";
  }
  return "Tack, jag hjälper dig gärna. Jag kan svara på frågor om processen, Sollentuna och Erfans arbetssätt – eller boka ett möte, en visning eller en värdering. Vad vill du göra?";
}
