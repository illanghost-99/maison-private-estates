# Maison Private Estates – AI Mäklaragent

Premium AI-driven fastighetsplattform för lyxsegmentet i Stockholm.

## Design

- **Färgtema:** Svart (#0a0a0a) + Guld (#c9a84c)
- **Typografi:** Playfair Display (rubriker) + Inter (brödtext)
- **Stil:** Minimalistisk, elegant, glassmorphism, stora bilder

## Funktioner i denna version

### Publik webb
- Startsida med hero, utvalda objekt och CTA
- Till salu – listning med filter
- Bostadskort (detaljsida) med fakta, beskrivning, kostnader, visningstider
- Sålda bostäder
- Boka värdering (formulär)
- Persistent AI-chattwidget (Maison AI)

### Mäklarpanel (`/dashboard`)
- KPI-översikt (möten, leads, affärer, intäkt)
- AI-rekommendationer med prioritet
- Dagens möten
- Nya leads med scoring
- Nyckeltal och aktiva objekt

### AI-assistent
- Chattwidget tillgänglig på alla sidor
- Svarar på frågor om objekt, värdering, visning, marknad
- Snabbvalsknappar
- Simulerad intelligent routing (ersätts med riktig agent i produktion)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide Icons
- Zod

## Kom igång

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Projektstruktur

```
src/
├── app/                  # Pages (App Router)
│   ├── page.tsx          # Startsida
│   ├── till-salu/        # Listning
│   ├── bostad/[slug]/    # Detaljsida
│   ├── salda/            # Sålda
│   ├── boka-vardering/   # Bokningsformulär
│   └── dashboard/        # Mäklarpanel
├── components/
│   ├── ui/               # Button, Badge
│   ├── layout/           # Header, Footer
│   ├── property/         # PropertyCard
│   └── ai/               # ChatWidget
├── lib/
│   ├── utils.ts
│   └── mock-data.ts      # Demo-data
└── types/
    └── index.ts          # TypeScript-modeller
```

## Nästa steg (produktion)

1. Koppla riktig databas (PostgreSQL + Prisma)
2. Integrera AI-agent (LangGraph / OpenAI / Claude)
3. Kalendersynk (Google Calendar / Microsoft Graph)
4. SMS/E-post (Twilio + Resend)
5. Autentisering (Clerk) för dashboard
6. GDPR-samtyckeshantering
7. Externa data-API:er (med behörighet)

## Viktigt

Systemet använder för närvarande mock-data. Det påstår inte tillgång till live-register eller externa kunddatabaser. All personuppgiftshantering ska följa GDPR.
