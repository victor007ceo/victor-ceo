import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2255f11`;

async function request(path: string, options?: RequestInit & { signal?: AbortSignal }): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  // If caller provides a signal, abort our controller when it fires
  if (options?.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeout);
      throw new DOMException("Aborted", "AbortError");
    }
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`API error ${res.status} on ${path}: ${text}`);
      throw new Error(`API ${path}: ${res.status}`);
    }

    const json = await res.json();
    if (!json.ok) {
      console.error(`API logic error on ${path}: ${json.error}`);
      throw new Error(json.error || `API ${path} failed`);
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

type Opts = { signal?: AbortSignal };

// Markets
export const fetchMarkets = (limit = 50, offset = 0, opts?: Opts) =>
  request(`/markets?limit=${limit}&offset=${offset}`, opts);

export const fetchMarketDetail = (id: string, opts?: Opts) =>
  request(`/markets/${id}`, opts);

export const fetchEvents = (limit = 20, opts?: Opts) =>
  request(`/events?limit=${limit}`, opts);

// Prices & Signals
export const fetchPrices = (tokenIds?: string, opts?: Opts) =>
  request(`/prices${tokenIds ? `?tokens=${tokenIds}` : ""}`, opts);

export const fetchSignals = (opts?: Opts) => request("/signals", opts);

// Wallets
export const fetchWallets = (opts?: Opts) => request("/wallets", opts);

export const fetchWalletDetail = (address: string, opts?: Opts) =>
  request(`/wallets/${address}`, opts);

export const trackWallet = (address: string, alias?: string) =>
  request("/wallets/track", {
    method: "POST",
    body: JSON.stringify({ address, alias }),
  });

export const untrackWallet = (address: string) =>
  request(`/wallets/${address}`, { method: "DELETE" });

// Live Trades
export const fetchLiveTrades = (opts?: Opts) => request("/trades/live", opts);

// Watched wallet trades (real activity from radar-watched wallets)
export const fetchWatchedWalletTrades = (opts?: Opts) => request("/wallets/watched/trades", opts);

// Scanner v5 — Real /v1/leaderboard with full filters
export interface ScanSettings {
  minPnl?: number | null;
  maxPnl?: number | null;
  minVolume?: number;
  minAvgOrder?: number;
  minTradeCount?: number;
  onlyVerified?: boolean;
  timePeriod?: string | null;
  category?: string | null;
  maxResults?: number;
}

export const scanTopWallets = (
  mode: "scan" | "reset" = "scan",
  settings?: ScanSettings
) =>
  request("/wallets/scan", {
    method: "POST",
    body: JSON.stringify({ mode, settings: settings || {} }),
  });

// Returns { wallets: [...], state: {...} | null }
export const loadScannedWallets = (opts?: Opts) =>
  request("/wallets/scan", opts);

export const toggleScanWatch = (address: string, watched: boolean) =>
  request("/wallets/scan/watch", {
    method: "POST",
    body: JSON.stringify({ address, watched }),
  });

// Wallet detail (View More — on-demand enrichment via trades + closed-positions)
export const fetchScanWalletDetail = (address: string) =>
  request(`/wallets/scan/detail/${address.toLowerCase()}`);

// Wallet Lookup (manual search by address)
export const lookupWallet = (address: string) =>
  request(`/wallets/lookup/${address.toLowerCase()}`);

// Debug: probe /v1/leaderboard directly
export const debugLeaderboard = (timePeriod = "all", limit = 3) =>
  request(`/wallets/scan/debug?timePeriod=${timePeriod}&orderBy=PNL&limit=${limit}`);

// Pockets
export const fetchPockets = (opts?: Opts) => request("/pockets", opts);

export const savePocket = (pocket: any) =>
  request("/pockets", {
    method: "POST",
    body: JSON.stringify({ pocket }),
  });

export const deletePocket = (id: string | number) =>
  request(`/pockets/${id}`, { method: "DELETE" });

// ─── Paper Copy Trading ────────────────────────────────────────────────

export const getCopyConfig = (opts?: Opts) => request("/copytrade/config", opts);

export const updateCopyConfig = (config: any) =>
  request("/copytrade/config", { method: "PUT", body: JSON.stringify(config) });

export const evaluateCopyTrade = (address: string, score: number, pnl: number, avgTrade: number, alias?: string | null) =>
  request("/copytrade/evaluate", {
    method: "POST",
    body: JSON.stringify({ address, score, pnl, avgTrade, alias }),
  });

export const getCopyDecisions = (opts?: Opts) => request("/copytrade/decisions", opts);

export const getCopyPositions = (opts?: Opts) => request("/copytrade/positions", opts);

export const closeCopyPosition = (id: string, closePrice?: number) =>
  request(`/copytrade/positions/${id}/close`, {
    method: "POST",
    body: JSON.stringify({ closePrice }),
  });

export const getCopyOrders = (opts?: Opts) => request("/copytrade/orders", opts);

export const getCopyEvents = (opts?: Opts) => request("/copytrade/events", opts);

export const getCopySummary = (opts?: Opts) => request("/copytrade/summary", opts);

export const resetCopyTrading = () =>
  request("/copytrade/reset", { method: "POST", body: JSON.stringify({}) });

export const staleClosePaperPositions = (maxAgeMs?: number) =>
  request("/copytrade/stale-close", { method: "POST", body: JSON.stringify({ maxAgeMs }) });

// Combined endpoint: fetches config, summary, decisions, positions, orders in one request
export const getCopyAll = (opts?: Opts) => request("/copytrade/all", opts);

// ─── Real Execution Foundation ─────────────────────────────────────────

export const getExecutionSettings = (opts?: Opts) => request("/execution/settings", opts);
export const updateExecutionSettings = (settings: any) =>
  request("/execution/settings", { method: "PUT", body: JSON.stringify(settings) });

export const getExecutionAccount = (opts?: Opts) => request("/execution/account", opts);
export const updateExecutionAccount = (account: any) =>
  request("/execution/account", { method: "PUT", body: JSON.stringify(account) });

export const getExecutionStatus = (opts?: Opts) => request("/execution/status", opts);

export const executeDryRun = (params: {
  sourceWallet: string; market: string; side: string;
  size: number; sourcePrice: number; tradeAgeMs?: number;
  sourceTradeId?: string; tokenId?: string; decisionId?: string;
}) => request("/execution/dryrun", { method: "POST", body: JSON.stringify(params) });

export const getDryRunLog = (opts?: Opts) => request("/execution/dryrun-log", opts);

export const activateKillSwitch = (activate = true) =>
  request("/execution/kill-switch", { method: "POST", body: JSON.stringify({ activate }) });

export const emergencyStop = () =>
  request("/execution/emergency-stop", { method: "POST", body: JSON.stringify({}) });