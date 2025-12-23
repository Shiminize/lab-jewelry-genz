> **Note:** This document is archived. The canonical, merged implementation plan now lives in `Docs/widget_system_overview.md`. Keep this file only as supplementary reference material.

1) System Overview (No‑AI Architecture)
Front‑end widget (React/JS)
Renders header, chips (quick intents), messages, product cards, inline actions (Attach inspiration, Track order, Talk to stylist), offer card, CSAT.
Sends structured events instead of free‑text: INTENT_FIND_PRODUCT, INTENT_TRACK_ORDER, etc. Free text is still allowed; the widget passes it to the backend router that uses keyword rules (no ML) to determine the intent.
Backend chat orchestrator (Node/Express)
Rule engine: maps input → intent → state machine step.
Business services:
CatalogService (content‑based filtering, SQL queries)
OrderService (track by order # or email/zip)
ReturnService (RMA, labels, policy checks)
CapsuleService (48‑hr hold, 3D turnaround request)
StylistService (create ticket in CRM / send email)
CSATService (store feedback)
Session store: keeps chat state, chosen items, contact data, last seen intent.
Data sources
Your product catalog (SQL/Shopify GraphQL/REST).
Orders/Returns endpoints.
CRM or email queue for human escalation.
Key idea: Everything is a finite‑state conversation, and every state is powered by deterministic code paths, not AI.
2) Deterministic Intent & State Model
Intents (top level)
find_product (sub‑intents: ear stack, ring, gifts under budget, ready‑to‑ship)
track_order
return_exchange (resize, return)
sizing_repairs
care_warranty
financing
stylist_contact
capsule_reserve
csat
How intents are detected without AI
UI chips & buttons map directly to intents.
Keyword rules (case‑insensitive, trimmed punctuation):
track order|where is my order|order status|track → track_order
return|exchange|resize → return_exchange
ring|earrings|necklace|bracelet|engagement|solitaire|halo|stack → find_product
care|warranty|clean|polish → care_warranty
finance|affirm|klarna|pay over time → financing
Command shortcuts: /track 12345, /gift 300, /size 6.
Conversation states (finite‑state machine)
WELCOME → prompts; quick chips visible.
COLLECT_PRODUCT_PREFS (budget, metal, stone, style) → SHOW_RECS.
SHOW_RECS → add to bag / compare / see on hand / Reserve capsule.
TRACK_ORDER_INPUT (email+order or email+zip) → TRACK_ORDER_RESULT.
RETURN_INIT → RETURN_OPTIONS → RMA_CREATED.
ESCALATE_FORM → ticket.
CSAT_PROMPT → CSAT_STORED.
3) Product Recommendations Without AI
Use content‑based filtering and heuristics:
Filters
Category (ring/earrings/necklaces/bracelets)
Metal (14k yellow/white/rose, platinum)
Stone (lab‑grown, natural diamond, sapphire, none)
Price range (min/max)
Inventory (in_stock = true)
Shipping promise (e.g., ship_days <= 3 → “Ships today/this week”)
Ranking (deterministic score)
weight for “bestseller_score”
weight for margin or promo multiplier
style match (e.g., “solitaire”, “halo”, “pavé”) via tag overlap
– penalty for being just over budget
tie‑break by recency or views
This yields reliable, explainable recommendations with zero AI.
4) Offer Card & Capsule Logic (Rule‑Based)
Trigger the “Reserve your Capsule (48h)” card when any of these happen:
User added ≥2 items to shortlist OR
User uploaded inspiration OR
User used “Design my capsule” flow OR
Query contains “custom”, “design”, “render”, “mix metals”
Reserve = create a “capsule” record (TTL 48h) with selected SKUs, hold price, and schedule 3D turnarounds (internal task).
5) Returns/Exchanges/Resizing (Deterministic)
Rules:
Return window = e.g., 30 days from delivery (config).
First resize free within 60 days (config).
Non‑returnable categories (custom, engraved) flagged in catalog.
6) Sample Code — Backend (Node + Express + TypeScript)
These samples are production‑leaning and ready to adapt.
6.1 Types & Utilities
// src/types.ts
export type Intent =
  | "find_product"
  | "track_order"
  | "return_exchange"
  | "sizing_repairs"
  | "care_warranty"
  | "financing"
  | "stylist_contact"
  | "capsule_reserve"
  | "csat";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
}

export interface SessionState {
  id: string;
  lastIntent?: Intent;
  productPrefs?: {
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    metal?: string;
    stone?: string;
    styleTags?: string[];
    readyToShip?: boolean;
  };
  shortlist: string[];     // product IDs
  capsuleId?: string;
  contact?: { name?: string; email?: string; phone?: string };
}

export interface Product {
  id: string;
  title: string;
  category: "ring" | "earrings" | "necklace" | "bracelet";
  metal: "14k_yellow" | "14k_white" | "14k_rose" | "platinum";
  stone?: "lab_diamond" | "natural_diamond" | "sapphire" | "none";
  price: number;
  in_stock: boolean;
  ship_days: number;
  tags: string[];          // e.g., ["solitaire","halo","pave","minimal"]
  bestseller_score: number; // 0..1
  margin_score: number;     // 0..1
  ready_to_ship: boolean;
}
// src/intentRules.ts
import { Intent } from "./types";

const patterns: Array<{ intent: Intent; regex: RegExp }> = [
  { intent: "track_order", regex: /(track|where.*order|order.*status)/i },
  { intent: "return_exchange", regex: /(return|exchange|resize)/i },
  { intent: "sizing_repairs", regex: /(size|sizing|repair)/i },
  { intent: "care_warranty", regex: /(care|warranty|clean|polish)/i },
  { intent: "financing", regex: /(finance|affirm|klarna|installments|split pay)/i },
  { intent: "stylist_contact", regex: /(human|stylist|talk to (someone|a stylist))/i },
  { intent: "capsule_reserve", regex: /(reserve|capsule|render|3d)/i },
  { intent: "find_product", regex: /(ring|earrings|ear|necklace|bracelet|gift|halo|solitaire|stack)/i },
];

export function detectIntentFromText(input: string): Intent | undefined {
  const s = input.trim();
  for (const p of patterns) if (p.regex.test(s)) return p.intent;
  // command shortcuts
  if (/^\/track\s+\S+/.test(s)) return "track_order";
  if (/^\/gift\b/.test(s)) return "find_product";
  return undefined;
}
6.2 In‑Memory Catalog (replace with DB/Shopify later)
// src/catalog.ts
import { Product } from "./types";

export const products: Product[] = [
  {
    id: "p1",
    title: "Aurora Classic Solitaire",
    category: "ring",
    metal: "14k_white",
    stone: "lab_diamond",
    price: 1290,
    in_stock: true,
    ship_days: 2,
    tags: ["solitaire", "classic", "minimal"],
    bestseller_score: 0.9,
    margin_score: 0.7,
    ready_to_ship: true,
  },
  {
    id: "p2",
    title: "Nova Pavé Band",
    category: "ring",
    metal: "14k_yellow",
    stone: "lab_diamond",
    price: 690,
    in_stock: true,
    ship_days: 3,
    tags: ["pave", "stack", "classic"],
    bestseller_score: 0.8,
    margin_score: 0.6,
    ready_to_ship: true,
  },
  {
    id: "p3",
    title: "Halo Studs 0.5ct",
    category: "earrings",
    metal: "14k_white",
    stone: "lab_diamond",
    price: 279,
    in_stock: true,
    ship_days: 1,
    tags: ["halo", "gift", "sparkle"],
    bestseller_score: 0.7,
    margin_score: 0.5,
    ready_to_ship: true,
  },
  // ...more rows
];
6.3 Deterministic Recommender (filter + score)
// src/recommender.ts
import { Product } from "./types";

export interface Prefs {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  metal?: string;
  stone?: string;
  styleTags?: string[];
  readyToShip?: boolean;
}

export function searchAndRank(catalog: Product[], prefs: Prefs): Product[] {
  const filtered = catalog.filter(p => {
    if (prefs.category && p.category !== prefs.category) return false;
    if (prefs.metal && p.metal !== prefs.metal) return false;
    if (prefs.stone && p.stone !== prefs.stone) return false;
    if (typeof prefs.budgetMin === "number" && p.price < prefs.budgetMin!) return false;
    if (typeof prefs.budgetMax === "number" && p.price > prefs.budgetMax!) return false;
    if (prefs.readyToShip && !p.ready_to_ship) return false;
    return p.in_stock;
  });

  function tagOverlap(a: string[] = [], b: string[] = []) {
    const A = new Set(a.map(s => s.toLowerCase()));
    const B = new Set(b.map(s => s.toLowerCase()));
    let c = 0;
    A.forEach(x => { if (B.has(x)) c++; });
    return c;
  }

  const ranked = filtered
    .map(p => {
      const styleScore = prefs.styleTags?.length ? tagOverlap(p.tags, prefs.styleTags) / 3 : 0;
      let priceScore = 0;
      if (typeof prefs.budgetMax === "number") {
        const diff = prefs.budgetMax - p.price;
        // reward close-to-budget (without going over)
        priceScore = diff >= 0 ? Math.min(1, diff / Math.max(50, prefs.budgetMax * 0.2)) : -0.3;
      }
      const shipScore = p.ship_days <= 2 ? 0.2 : 0;
      const score = styleScore * 0.5 + p.bestseller_score * 0.3 + p.margin_score * 0.1 + priceScore * 0.1 + shipScore;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.p);

  return ranked.slice(0, 6);
}
6.4 Chat Router (no AI)
// src/server.ts
import express from "express";
import bodyParser from "body-parser";
import { detectIntentFromText } from "./intentRules";
import { products } from "./catalog";
import { searchAndRank } from "./recommender";
import { SessionState, Intent } from "./types";

const app = express();
app.use(bodyParser.json());

const sessions = new Map<string, SessionState>();

function getSession(sessionId: string): SessionState {
  let s = sessions.get(sessionId);
  if (!s) {
    s = { id: sessionId, shortlist: [] };
    sessions.set(sessionId, s);
  }
  return s;
}

// --- Domain Services (stubs; replace with real integrations) ---
const ReturnPolicy = { returnDays: 30, freeResizeDays: 60 };

async function trackOrder({ email, orderId, zip }: { email?: string; orderId?: string; zip?: string }) {
  // Replace with your order system query
  if (orderId === "ABC123") {
    return { status: "Out for delivery", eta: "2025-10-13", carrier: "FedEx", tracking: "7777777777" };
  }
  return null;
}

async function createReturn({ orderId, reason }: { orderId: string; reason: string }) {
  // Create RMA in your OMS
  return { rma: "RMA-91234", labelUrl: "https://example/label/RMA-91234.pdf" };
}

async function createStylistTicket(payload: any) {
  // Send to CRM / email
  return { ticketId: "STY-00999" };
}

async function reserveCapsule({ session, itemIds }: { session: SessionState; itemIds: string[] }) {
  // Persist with TTL=48h
  const capsuleId = "CAP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  session.capsuleId = capsuleId;
  return { capsuleId, expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString() };
}

app.post("/chat", async (req, res) => {
  const { sessionId, message, meta } = req.body as { sessionId: string; message?: string; meta?: any };

  const session = getSession(sessionId);
  let intent: Intent | undefined = meta?.intent || (message ? detectIntentFromText(message) : undefined);

  // If no intent and no message, return welcome bundle
  if (!intent && !message) {
    return res.json({
      ui: {
        header: "Let’s craft your spark.",
        subheader: "Design support, instant answers, insider perks.",
        chips: [
          { label: "Find my ring", intent: "find_product" },
          { label: "Gifts under $300", intent: "find_product", payload: { budgetMax: 300 } },
          { label: "Ready to ship", intent: "find_product", payload: { readyToShip: true } },
          { label: "Track my order", intent: "track_order" },
          { label: "Returns & resizing", intent: "return_exchange" },
        ],
        inlineActions: ["Attach inspiration", "Track order", "Talk to stylist"],
      },
      messages: [
        { role: "assistant", text: "Choose a journey or ask anything — I reply instantly.", timestamp: Date.now() },
      ],
    });
  }

  // Route by intent
  switch (intent) {
    case "find_product": {
      const prefs = {
        category: meta?.category,
        budgetMin: meta?.budgetMin,
        budgetMax: meta?.budgetMax,
        metal: meta?.metal,
        stone: meta?.stone,
        styleTags: meta?.styleTags,
        readyToShip: meta?.readyToShip,
      };
      session.productPrefs = { ...session.productPrefs, ...prefs };
      const recs = searchAndRank(products, session.productPrefs || {});
      const cards = recs.map(p => ({
        type: "product_card",
        id: p.id,
        title: p.title,
        subtitle: `${p.category} · ${p.metal.replace("14k_", "14k ")}${p.stone && " · " + p.stone.replace("_", " ")}`,
        price: p.price,
        shipping: p.ship_days <= 1 ? "Ships today" : `Ships in ${p.ship_days} days`,
        ctas: [
          { label: "Add to Bag", action: { type: "add_to_bag", productId: p.id } },
          { label: "Compare", action: { type: "compare_add", productId: p.id } },
          { label: "See on hand", action: { type: "view_360", productId: p.id } },
        ],
        tags: p.tags,
      }));
      // Offer card trigger
      const showOffer = (session.shortlist.length >= 2) || (session.productPrefs?.styleTags?.length ?? 0) > 0;
      return res.json({
        messages: [{ role: "assistant", text: "Here are pieces you’ll love:", timestamp: Date.now() }],
        cards,
        offer: showOffer
          ? {
              title: "Reserve your Aurora Capsule for 48 hours",
              body: "We’ll hold your shortlist and send 3D turnarounds under 24h.",
              cta: { label: "Reserve my capsule", action: { type: "reserve_capsule" } },
            }
          : undefined,
      });
    }

    case "track_order": {
      const { orderId, email, zip } = meta || {};
      if (!orderId && !email) {
        return res.json({
          messages: [{ role: "assistant", text: "Enter your order # (or email + zip) and I’ll fetch live status.", timestamp: Date.now() }],
          form: { fields: [{ name: "orderId", label: "Order #", required: false }, { name: "email", label: "Email", required: false }, { name: "zip", label: "ZIP/Postal", required: false }], submitIntent: "track_order" }
        });
      }
      const result = await trackOrder({ email, orderId, zip });
      if (!result) {
        return res.json({ messages: [{ role: "assistant", text: "I couldn’t find that one. Check details or try email + zip.", timestamp: Date.now() }] });
      }
      return res.json({
        messages: [{
          role: "assistant",
          text: `Found it — ${result.status}. ETA ${result.eta} by ${result.carrier}. Tracking ${result.tracking}. Want SMS updates?`,
          timestamp: Date.now(),
        }],
      });
    }

    case "return_exchange": {
      const { orderId, reason } = meta || {};
      if (!orderId) {
        return res.json({
          messages: [{ role: "assistant", text: `Returns within ${ReturnPolicy.returnDays} days. Enter your order # to start.`, timestamp: Date.now() }],
          form: { fields: [{ name: "orderId", label: "Order #", required: true }, { name: "reason", label: "Reason", required: true }], submitIntent: "return_exchange" }
        });
      }
      const rma = await createReturn({ orderId, reason });
      return res.json({
        messages: [{ role: "assistant", text: `Your return is set. RMA ${rma.rma}. Download label: ${rma.labelUrl}`, timestamp: Date.now() }],
      });
    }

    case "stylist_contact": {
      const { name, email, phone } = meta || {};
      if (!email) {
        return res.json({
          messages: [{ role: "assistant", text: "A stylist replies within 1 hour. Share your name & email to connect.", timestamp: Date.now() }],
          form: { fields: [{ name: "name", label: "Name", required: true }, { name: "email", label: "Email", required: true }, { name: "phone", label: "Phone (optional)", required: false }], submitIntent: "stylist_contact" }
        });
      }
      const ticket = await createStylistTicket({ name, email, phone, sessionId: session.id });
      session.contact = { name, email, phone };
      return res.json({
        messages: [{ role: "assistant", text: `You’re all set — ticket ${ticket.ticketId}. A stylist will email you within an hour.`, timestamp: Date.now() }],
      });
    }

    case "capsule_reserve": {
      const chosen = session.shortlist.length ? session.shortlist : (meta?.itemIds ?? []);
      if (!chosen.length) {
        return res.json({ messages: [{ role: "assistant", text: "Add at least two items to your shortlist to reserve a capsule.", timestamp: Date.now() }] });
      }
      const result = await reserveCapsule({ session, itemIds: chosen });
      return res.json({
        messages: [{ role: "assistant", text: `Capsule reserved: ${result.capsuleId}. Price held for 48h. Expires ${result.expiresAt}.`, timestamp: Date.now() }],
      });
    }

    case "csat": {
      // store rating & optional comment
      return res.json({ messages: [{ role: "assistant", text: "Thanks for your feedback — we’re polishing things constantly.", timestamp: Date.now() }] });
    }

    default: {
      // Fallback: ask to choose a chip (no AI)
      return res.json({
        messages: [{ role: "assistant", text: "Try one of these to get started: Find my ring, Gifts under $300, Ready to ship, Track my order, Returns & resizing.", timestamp: Date.now() }],
      });
    }
  }
});

app.listen(3001, () => console.log("Widget backend running on :3001"));
7) Sample Code — React Widget (TypeScript)
Minimal, clean, and intentionally deterministic. You can drop this into a ChatWidget.tsx.
// src/ChatWidget.tsx
import React, { useEffect, useRef, useState } from "react";

type Intent =
  | "find_product"
  | "track_order"
  | "return_exchange"
  | "sizing_repairs"
  | "care_warranty"
  | "financing"
  | "stylist_contact"
  | "capsule_reserve"
  | "csat";

type Card =
  | {
      type: "product_card";
      id: string;
      title: string;
      subtitle: string;
      price: number;
      shipping: string;
      tags?: string[];
      ctas: { label: string; action: { type: string; productId?: string } }[];
    };

interface ChatResponse {
  ui?: {
    header: string;
    subheader?: string;
    chips?: { label: string; intent: Intent; payload?: any }[];
    inlineActions?: string[];
  };
  messages?: { role: "user" | "assistant"; text: string; timestamp: number }[];
  cards?: Card[];
  offer?: { title: string; body: string; cta: { label: string; action: { type: string } } };
  form?: { fields: { name: string; label: string; required: boolean }[]; submitIntent: Intent };
}

export const ChatWidget: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [messages, setMessages] = useState<ChatResponse["messages"]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [ui, setUi] = useState<ChatResponse["ui"]>();
  const [offer, setOffer] = useState<ChatResponse["offer"]>();
  const [form, setForm] = useState<ChatResponse["form"]>();
  const [input, setInput] = useState("");

  const scroller = useRef<HTMLDivElement>(null);

  async function callChat(payload: any) {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...payload }),
    });
    const data = (await res.json()) as ChatResponse;
    if (data.ui) setUi(data.ui);
    if (data.messages) setMessages(prev => [...prev, ...data.messages!]);
    if (data.cards) setCards(data.cards);
    setOffer(data.offer);
    setForm(data.form);
    setTimeout(() => scroller.current?.scrollTo(0, scroller.current.scrollHeight), 0);
  }

  useEffect(() => {
    // initial welcome
    callChat({});
  }, []);

  function sendFreeText() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input, timestamp: Date.now() }]);
    callChat({ message: input });
    setInput("");
  }

  function sendIntent(intent: Intent, payload?: any) {
    callChat({ meta: { intent, ...payload } });
  }

  return (
    <div style={{ width: 380, height: 640, border: "1px solid #eee", borderRadius: 12, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontWeight: 600 }}>{ui?.header ?? "Concierge"}</div>
        {ui?.subheader && <div style={{ color: "#777", fontSize: 12 }}>{ui.subheader}</div>}
      </div>

      {/* Chips */}
      {!!ui?.chips?.length && (
        <div style={{ padding: "10px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ui.chips!.map((c, i) => (
            <button key={i} onClick={() => sendIntent(c.intent, c.payload)} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 16, background: "#fff", cursor: "pointer" }}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages + Cards */}
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages?.map((m, idx) => (
          <div key={idx} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#0b74ff" : "#f7f7f7", color: m.role === "user" ? "#fff" : "#222", padding: "10px 12px", borderRadius: 12, maxWidth: "85%" }}>
            {m.text}
          </div>
        ))}

        {cards?.map((c, i) => c.type === "product_card" && (
          <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 600 }}>{c.title}</div>
            <div style={{ color: "#666", fontSize: 12, margin: "2px 0 8px" }}>{c.subtitle}</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>${c.price.toFixed(2)}</div>
            <div style={{ color: "#2b7a0b", fontSize: 12, marginBottom: 8 }}>{c.shipping}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.ctas.map((cta, k) => (
                <button key={k} onClick={() => {
                  if (cta.action.type === "add_to_bag") alert(`Added ${c.id} to bag`);
                  if (cta.action.type === "compare_add") alert(`Added ${c.id} to compare`);
                  if (cta.action.type === "view_360") alert(`Show 360 for ${c.id}`);
                }} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
                  {cta.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Offer card */}
      {offer && (
        <div style={{ padding: 12, borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
          <div style={{ fontWeight: 600 }}>{offer.title}</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>{offer.body}</div>
          <button onClick={() => sendIntent("capsule_reserve")} style={{ padding: "8px 12px", background: "#111", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" }}>
            {offer.cta.label}
          </button>
        </div>
      )}

      {/* Inline actions row */}
      {!!ui?.inlineActions?.length && (
        <div style={{ padding: 8, borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, justifyContent: "space-between" }}>
          {ui.inlineActions!.map((a, i) => (
            <button key={i} onClick={() => {
              if (/track/i.test(a)) sendIntent("track_order");
              else if (/stylist/i.test(a)) sendIntent("stylist_contact");
              else alert("Upload inspiration not implemented in this demo");
            }} style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Dynamic form */}
      {form && (
        <div style={{ padding: 12, borderTop: "1px solid #f0f0f0", background: "#fff" }}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const payload = Object.fromEntries(fd.entries());
            sendIntent(form.submitIntent, payload);
          }}>
            <div style={{ display: "grid", gap: 8 }}>
              {form.fields.map(f => (
                <label key={f.name} style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12 }}>{f.label}{f.required ? " *" : ""}</span>
                  <input name={f.name} required={f.required} style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
                </label>
              ))}
            </div>
            <button type="submit" style={{ marginTop: 10, padding: "8px 12px", background: "#111", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" }}>
              Continue
            </button>
          </form>
        </div>
      )}

      {/* Composer */}
      <div style={{ padding: 8, borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about rings, gifts, or order status…" style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
        <button onClick={sendFreeText} style={{ padding: "10px 12px", background: "#0b74ff", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
};
8) CSAT, Escalation & Trust (No‑AI)
CSAT trigger: after order status shown, after RMA created, or after “Add to Bag”.
“How did Aurora do today?” → Great / Needs follow‑up.
If negative, auto‑open escalation form with a short text area.
Escalation: surface benefits (renders, pricing, sizing), SLA (“reply within 1 hour”), and privacy copy.
Privacy & compliance: Never store payment data in chat. Render privacy assurance line in footer.
9) Analytics & Cost Control
Log intent → action → result events (no PII in logs).
Track conversion: product card impressions → clicks → add‑to‑bag → checkout.
Track support: order tracking completion, RMA label generated, stylist ticket created.
A/B test: header copy, chips order, offer CTA variants.
Because there’s no AI, your cost is predictable (compute + integrations only).
10) Limitations vs. AI (and when to upgrade)
Pros (No‑AI): deterministic behavior, fast, cheap, easy to QA, brand‑safe messaging.
Cons: cannot interpret ambiguous free text as well; might miss nuanced styling or bespoke requests.
When to add AI: long free‑text briefs (“vintage‑inspired, east‑west bezel, $2–3k”), image matching of inspiration photos, multilingual tone adaptation. You can guardrail AI by keeping this same router and only calling an LLM for the “hard mode” turns.
11) What to wire next (drop‑in targets)
Replace stubs with your real endpoints:
GET /api/products?filters…
GET /api/orders/:id or GET /api/orders?email=…&zip=…
POST /api/returns
POST /api/stylist/ticket
POST /api/capsules (with 48h TTL)
Hook checkout actions to your cart API (Shopify/Commerce platform).
Add authentication handoff for logged‑in experiences (saved ring sizes, addresses).
