import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e2255f11/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Mock data generators ---
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const TOKENS = ["BTC", "ETH", "SOL", "ARB", "MATIC", "AVAX", "LINK", "DOGE", "ADA", "DOT"];
const BASE_PRICES: Record<string, number> = {
  BTC: 68500, ETH: 3420, SOL: 178, ARB: 1.32, MATIC: 0.72,
  AVAX: 38.5, LINK: 15.2, DOGE: 0.165, ADA: 0.48, DOT: 7.3
};

// Prices endpoint
app.get("/make-server-e2255f11/prices", (c) => {
  const prices = TOKENS.map((symbol) => {
    const base = BASE_PRICES[symbol];
    const change24h = randomBetween(-8, 12);
    const price = base * (1 + change24h / 100);
    return {
      symbol,
      price: +price.toFixed(symbol === "BTC" ? 2 : symbol === "ETH" ? 2 : 4),
      change24h: +change24h.toFixed(2),
      volume24h: +(randomBetween(1e6, 5e9)).toFixed(0),
      marketCap: +(price * randomBetween(1e7, 2e10)).toFixed(0),
      high24h: +(price * (1 + randomBetween(0, 0.05))).toFixed(4),
      low24h: +(price * (1 - randomBetween(0, 0.05))).toFixed(4),
      timestamp: new Date().toISOString(),
    };
  });
  return c.json({ ok: true, data: prices });
});

// Signals endpoint
const SIGNAL_TYPES = ["whale_alert", "momentum_shift", "volume_spike", "smart_money", "liquidation", "accumulation", "breakout", "divergence"];
const SEVERITIES = ["low", "medium", "high", "critical"];

app.get("/make-server-e2255f11/signals", (c) => {
  const count = Math.floor(randomBetween(5, 15));
  const signals = Array.from({ length: count }, (_, i) => {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const type = SIGNAL_TYPES[Math.floor(Math.random() * SIGNAL_TYPES.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const minutesAgo = Math.floor(randomBetween(1, 180));
    return {
      id: `sig-${Date.now()}-${i}`,
      type,
      token,
      severity,
      message: `${type.replace(/_/g, " ").toUpperCase()} detected on ${token}`,
      value: +randomBetween(10000, 5000000).toFixed(0),
      confidence: +randomBetween(0.55, 0.98).toFixed(2),
      timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    };
  });
  return c.json({ ok: true, data: signals });
});

// Events endpoint
const EVENT_TYPES = ["trade", "transfer", "mint", "burn", "swap", "stake", "unstake", "governance", "airdrop", "listing"];

app.get("/make-server-e2255f11/events", (c) => {
  const limit = parseInt(c.req.query("limit") || "12");
  const events = Array.from({ length: limit }, (_, i) => {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const minutesAgo = Math.floor(randomBetween(1, 360));
    return {
      id: `evt-${Date.now()}-${i}`,
      type,
      token,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} event for ${token}`,
      amount: +randomBetween(100, 1000000).toFixed(2),
      from: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      to: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    };
  });
  return c.json({ ok: true, data: events });
});

// Execution status endpoint
app.get("/make-server-e2255f11/execution/status", (c) => {
  return c.json({
    ok: true,
    data: {
      active: true,
      mode: "paper",
      balance: 10000.0,
      positions: 3,
      totalPnL: +randomBetween(-500, 1500).toFixed(2),
      dailyPnL: +randomBetween(-200, 400).toFixed(2),
      winRate: +randomBetween(0.45, 0.75).toFixed(2),
      lastUpdate: new Date().toISOString(),
    }
  });
});

// Pockets endpoint
app.get("/make-server-e2255f11/pockets", (c) => {
  return c.json({
    ok: true,
    data: [
      {
        id: "pocket-1",
        name: "Main Trading",
        balance: 5000.0,
        allocated: 3200.0,
        available: 1800.0,
        positions: 5,
        pnl: +randomBetween(-200, 500).toFixed(2),
      },
      {
        id: "pocket-2",
        name: "Reserve",
        balance: 3000.0,
        allocated: 0,
        available: 3000.0,
        positions: 0,
        pnl: 0,
      },
      {
        id: "pocket-3",
        name: "High Risk",
        balance: 2000.0,
        allocated: 1500.0,
        available: 500.0,
        positions: 2,
        pnl: +randomBetween(-300, 800).toFixed(2),
      },
    ]
  });
});

// Copy trade endpoint
app.get("/make-server-e2255f11/copytrade/all", (c) => {
  const count = Math.floor(randomBetween(3, 8));
  const trades = Array.from({ length: count }, (_, i) => {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const entryPrice = BASE_PRICES[token] * randomBetween(0.95, 1.05);
    const currentPrice = entryPrice * randomBetween(0.92, 1.15);
    const pnl = ((currentPrice - entryPrice) / entryPrice) * 100;
    const status = Math.random() > 0.3 ? "open" : "closed";
    return {
      id: `trade-${Date.now()}-${i}`,
      walletAddress: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      tokenSymbol: token,
      tokenAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      entry: +entryPrice.toFixed(4),
      current: +currentPrice.toFixed(4),
      amount: +randomBetween(10, 1000).toFixed(2),
      pnl: +pnl.toFixed(2),
      status,
      openedAt: new Date(Date.now() - randomBetween(3600000, 86400000 * 7)).toISOString(),
      closedAt: status === "closed" ? new Date(Date.now() - randomBetween(0, 3600000)).toISOString() : null,
    };
  });
  return c.json({ ok: true, data: trades });
});

// Watched wallet trades endpoint
app.get("/make-server-e2255f11/wallets/watched/trades", (c) => {
  const count = Math.floor(randomBetween(5, 20));
  const trades = Array.from({ length: count }, (_, i) => {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const type = Math.random() > 0.5 ? "buy" : "sell";
    const minutesAgo = Math.floor(randomBetween(1, 1440));
    return {
      id: `wtrade-${Date.now()}-${i}`,
      wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      walletLabel: ["Whale #1", "Smart Money", "DeFi Alpha", "Sniper Bot"][Math.floor(Math.random() * 4)],
      token,
      tokenAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      type,
      amount: +randomBetween(10, 5000).toFixed(2),
      price: BASE_PRICES[token] * randomBetween(0.98, 1.02),
      valueUSD: +randomBetween(1000, 500000).toFixed(2),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    };
  });
  return c.json({ ok: true, data: trades });
});

// Wallet scan endpoint
app.get("/make-server-e2255f11/wallets/scan", (c) => {
  return c.json({
    ok: true,
    data: {
      scanning: Math.random() > 0.7,
      lastScan: new Date(Date.now() - randomBetween(30000, 300000)).toISOString(),
      walletsFound: Math.floor(randomBetween(8, 25)),
      activeWallets: Math.floor(randomBetween(3, 12)),
      newSignals: Math.floor(randomBetween(0, 5)),
    }
  });
});

Deno.serve((req) => app.fetch(req));