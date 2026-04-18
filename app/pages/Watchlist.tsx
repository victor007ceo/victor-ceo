import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InDevelopment } from "../components/InDevelopment";
import {
  Trash2,
  Copy,
  Check,
  X,
  Activity,
  Wallet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Plus,
  Pencil,
  CreditCard,
  Layers,
  Target,
  Users,
  Radio,
  Circle,
  Loader2,
  DollarSign,
  Shield,
} from "lucide-react";
import {
  fetchPockets,
  savePocket as savePocketApi,
  deletePocket as deletePocketApi,
  loadScannedWallets,
  fetchWatchedWalletTrades,
  getCopyAll,
  closeCopyPosition,
  resetCopyTrading,
  evaluateCopyTrade,
  updateCopyConfig,
  toggleScanWatch,
  staleClosePaperPositions,
} from "../api";
import { PaperTradingPanel } from "../components/PaperTradingPanel";
import { SystemStatusBar } from "../components/SystemStatusBar";

// ═══════════════════════════════════════════════════════════════════════
// ─── TYPES ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

interface WatchedWallet {
  address: string;
  alias: string | null;
  score: number;
  pnl: number;
  pnlPct: number;
  totalNotional: number;
  totalTrades: number;
  avgTrade: number;
  profileImage: string | null;
  xUsername: string | null;
  watched: boolean;
}

interface RealTrade {
  id: string;
  walletAddress: string;
  walletAlias: string | null;
  walletScore: number;
  market: string;
  side: "YES" | "NO";
  type: "OPEN" | "CLOSE";
  amount: number;
  price: number;
  timestamp: string;
  status: string;
}

interface TradingPocket {
  id: number;
  name: string;
  color: string;
  categories: string[];
  traders: string[];
  strategy: string;
  allocation: number;
  pnl: number;
  pnlPct: number;
  openPositions: number;
  totalTrades: number;
  status: "active" | "paused" | "drafting";
  createdAt: string;
}

interface CopyConfig {
  enabled: boolean;
  minSourceScore: number;
  minSourcePnl: number;
  minAvgTradeSize: number;
  minNotional: number;
  maxCopyDelayMs: number;
  maxSlippagePct: number;
  maxExposurePerMarket: number;
  maxExposurePerWallet: number;
  cooldownMs: number;
  paperBalance: number;
}

interface CopySummary {
  enabled: boolean;
  realExecutionEnabled?: boolean;
  paperBalance: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
  totalExposure: number;
  openPositionCount: number;
  closedPositionCount: number;
  totalDecisions: number;
  copyCount: number;
  skipCount: number;
  copyRate: number;
  totalOrders: number;
  uniqueWallets: number;
  uniqueMarkets: number;
  paperCopyCount?: number;
  realEligibleCount?: number;
  blockedCount?: number;
  ignoreCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════
// ─── CONSTANTS ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

const POCKET_COLORS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
];

const POCKET_COLOR_SOLIDS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b",
  "#f43f5e", "#6366f1", "#84cc16", "#d946ef",
];

const ALL_CATEGORIES = [
  "Politics", "Crypto", "Economics", "Technology", "Sports",
  "Climate", "Science", "Geopolitics", "Entertainment", "Finance",
];

const STRATEGY_TEMPLATES = [
  "Mirror top traders with >70 score on high-conviction plays",
  "Contrarian positions on overpriced YES markets",
  "Event-driven catalyst trades within 24h of resolution",
  "Momentum following across correlated political markets",
  "Mean reversion on large price swings (>15% moves)",
  "Custom strategy",
];

// ═══════════════════════════════════════════════════════════════════════
// ─── HELPERS ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function formatUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function shortAddr(a: string) {
  if (!a) return "\u2014";
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function timeAgo(ts: string | number) {
  const d = typeof ts === "number" ? ts : new Date(ts).getTime();
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function statusStyle(s: TradingPocket["status"]) {
  if (s === "active") return { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (s === "paused") return { label: "Paused", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { label: "Draft", color: "text-white/40", bg: "bg-white/5", border: "border-white/10" };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── SUB-COMPONENTS ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function MetricCard({ icon, label, value, sub, color, onClick }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={`flex-1 min-w-[130px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2 ${onClick ? "cursor-pointer hover:bg-white/[0.05] hover:border-white/15 transition-all" : ""}`}>
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-[10px] font-mono tracking-widest uppercase">{label}</span>
      </div>
      <span className={`text-xl font-mono tracking-tight ${color || "text-white/90"}`}>{value}</span>
      {sub && <span className="text-[10px] font-mono text-white/30">{sub}</span>}
    </div>
  );
}

// ─── Pocket Editor Modal ─────────────────────────────────────────────

function PocketEditorModal({ pockets, watchedWallets, onSave, onClose }: {
  pockets: TradingPocket[];
  watchedWallets: WatchedWallet[];
  onSave: (pockets: TradingPocket[]) => void;
  onClose: () => void;
}) {
  const [localPockets, setLocalPockets] = useState<TradingPocket[]>(pockets);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TradingPocket>>({});

  const startEdit = (pocket: TradingPocket) => { setEditingId(pocket.id); setEditForm({ ...pocket }); };
  const startNew = () => {
    const newId = Math.max(0, ...localPockets.map((p) => p.id)) + 1;
    const newPocket: TradingPocket = {
      id: newId, name: "", color: POCKET_COLORS[newId % POCKET_COLORS.length],
      categories: [], traders: [], strategy: STRATEGY_TEMPLATES[0],
      allocation: 5000, pnl: 0, pnlPct: 0, openPositions: 0, totalTrades: 0,
      status: "drafting", createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
    };
    setLocalPockets((prev) => [...prev, newPocket]);
    setEditingId(newId);
    setEditForm({ ...newPocket });
  };
  const saveEdit = () => {
    if (!editForm.name?.trim()) return;
    setLocalPockets((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...editForm } as TradingPocket : p)));
    setEditingId(null); setEditForm({});
  };
  const deletePocket = (id: number) => {
    setLocalPockets((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) { setEditingId(null); setEditForm({}); }
  };
  const toggleCategory = (cat: string) => {
    const cats = editForm.categories || [];
    setEditForm({ ...editForm, categories: cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat] });
  };
  const toggleTrader = (addr: string) => {
    const traders = editForm.traders || [];
    setEditForm({ ...editForm, traders: traders.includes(addr) ? traders.filter((x) => x !== addr) : [...traders, addr] });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#08080e]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_32px_128px_rgba(0,0,0,0.8)]" style={{ scrollbarWidth: "none" }}>
        <div className="sticky top-0 z-10 bg-[#08080e]/80 backdrop-blur-2xl border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-cyan-400/60" />
            <div>
              <h2 className="text-sm font-mono text-white/90 tracking-widest uppercase">Trading Pockets</h2>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">Assign watched wallets to strategy pockets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startNew} className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-1.5 hover:bg-cyan-500/20 transition-all"><Plus size={12} /> New Pocket</button>
            <button onClick={() => { onSave(localPockets); onClose(); }} className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400 tracking-widest uppercase hover:bg-emerald-500/20 transition-all">Save All</button>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"><X size={16} /></button>
          </div>
        </div>
        <div className="p-6 flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[320px] shrink-0 flex flex-col gap-3">
            <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Your Pockets</span>
            <div className="flex flex-col gap-2">
              {localPockets.map((p) => {
                const st = statusStyle(p.status);
                const isSelected = editingId === p.id;
                return (
                  <motion.div key={p.id} layout className={`relative rounded-2xl border p-4 flex flex-col gap-2 cursor-pointer transition-all ${isSelected ? "bg-white/[0.06] border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"}`} onClick={() => startEdit(p)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${p.color} shadow-md flex items-center justify-center`}><Layers size={12} className="text-white/80" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-white/80 truncate">{p.name || "Untitled"}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono border ${st.bg} ${st.border} ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[9px] font-mono text-white/30">{p.traders.length} wallets</span>
                          <span className={`text-[9px] font-mono ${p.pnl >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>{p.pnl >= 0 ? "+" : ""}{formatUSD(p.pnl)}</span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deletePocket(p.id); }} className="p-1 rounded-full text-white/15 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                    </div>
                  </motion.div>
                );
              })}
              {localPockets.length === 0 && (<div className="py-8 text-center text-white/20 text-xs font-mono">No pockets yet.</div>)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {editingId !== null && editForm ? (
                <motion.div key={editingId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
                  <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Edit Pocket</span>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Name</label>
                    <input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="e.g. Alpha Momentum" className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {POCKET_COLORS.map((c) => (<button key={c} onClick={() => setEditForm({ ...editForm, color: c })} className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c} transition-all ${editForm.color === c ? "ring-2 ring-white/40 scale-110" : "opacity-60 hover:opacity-90"}`} />))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Assign Watched Wallets ({watchedWallets.length} available)</label>
                    {watchedWallets.length === 0 ? (
                      <div className="text-[10px] font-mono text-white/20 px-3 py-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">No watched wallets. Go to Radar and watch some wallets first.</div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        {watchedWallets.map((w) => {
                          const selected = (editForm.traders || []).includes(w.address);
                          return (<button key={w.address} onClick={() => toggleTrader(w.address)} className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1.5 ${selected ? "bg-violet-500/15 border-violet-500/30 text-violet-400" : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"}`}><Wallet size={9} /><span>{w.alias || shortAddr(w.address)}</span><span className="text-[8px] text-white/20">S:{w.score}</span></button>);
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Categories</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {ALL_CATEGORIES.map((cat) => {
                        const selected = (editForm.categories || []).includes(cat);
                        return (<button key={cat} onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all ${selected ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"}`}>{cat}</button>);
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Strategy</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {STRATEGY_TEMPLATES.map((s) => (<button key={s} onClick={() => setEditForm({ ...editForm, strategy: s })} className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all text-left ${editForm.strategy === s ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"}`}>{s}</button>))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Allocation (USD)</label>
                    <input type="number" value={editForm.allocation || 0} onChange={(e) => setEditForm({ ...editForm, allocation: +e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white/80 outline-none focus:border-cyan-500/30 w-48 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Status</label>
                    <div className="flex gap-2">
                      {(["active", "paused", "drafting"] as const).map((s) => {
                        const st = statusStyle(s);
                        return (<button key={s} onClick={() => setEditForm({ ...editForm, status: s })} className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all ${editForm.status === s ? `${st.bg} ${st.border} ${st.color}` : "bg-white/[0.02] border-white/[0.06] text-white/30"}`}>{st.label}</button>);
                      })}
                    </div>
                  </div>
                  <button onClick={saveEdit} disabled={!editForm.name?.trim()} className="self-start px-5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono text-cyan-400 tracking-widest uppercase hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Apply Changes</button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-white/15 text-xs font-mono gap-3">
                  <Layers size={32} className="text-white/10" />
                  Select a pocket to edit or create a new one
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export function Watchlist() {
  const [watchedWallets, setWatchedWallets] = useState<WatchedWallet[]>([]);
  const [realTrades, setRealTrades] = useState<RealTrade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [tradesError, setTradesError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [pockets, setPockets] = useState<TradingPocket[]>([]);
  const [pocketsModalOpen, setPocketsModalOpen] = useState(false);
  const [copyConfig, setCopyConfig] = useState<CopyConfig | null>(null);
  const [copySummary, setCopySummary] = useState<CopySummary | null>(null);
  const [copyDecisions, setCopyDecisions] = useState<any[]>([]);
  const [copyPositions, setCopyPositions] = useState<any[]>([]);
  const [copyOrders, setCopyOrders] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);

  const loadWalletsAndTrades = useCallback(async (signal?: AbortSignal) => {
    setTradesLoading(true); setTradesError(null);
    try {
      const data = await fetchWatchedWalletTrades({ signal });
      setWatchedWallets(data?.wallets || []); setRealTrades(data?.trades || []); setLastRefresh(Date.now());
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("Failed to load watched wallet trades:", e); setTradesError(e.message);
      try {
        const scanData = await loadScannedWallets({ signal });
        const allWallets = scanData?.wallets || [];
        const watched = allWallets.filter((w: any) => w.watched).map((w: any) => ({
          address: (w.address || "").toLowerCase(), alias: w.alias || w.userName || null, score: w.score || 0, pnl: w.pnl || 0, pnlPct: w.pnlPct || 0, totalNotional: w.totalNotional || 0, totalTrades: w.totalTrades || 0, avgTrade: w.avgTrade || 0, profileImage: w.profileImage || null, xUsername: w.xUsername || null, watched: true,
        }));
        setWatchedWallets(watched);
      } catch {}
    }
    setTradesLoading(false);
  }, []);

  const loadPockets = useCallback(async (signal?: AbortSignal) => {
    try { const data = await fetchPockets({ signal }); if (Array.isArray(data) && data.length > 0) setPockets(data); } catch (e: any) { if (e.name === "AbortError") return; console.error("Failed to load pockets:", e); }
  }, []);

  const loadPaperData = useCallback(async (signal?: AbortSignal) => {
    try {
      const all = await getCopyAll({ signal });
      if (signal?.aborted) return;
      if (all?.config) setCopyConfig(all.config);
      if (all?.summary) setCopySummary(all.summary);
      setCopyDecisions(Array.isArray(all?.decisions) ? all.decisions : []);
      setCopyPositions(Array.isArray(all?.positions) ? all.positions : []);
      setCopyOrders(Array.isArray(all?.orders) ? all.orders : []);
    } catch (e: any) { if (e.name === "AbortError") return; console.error("Failed to load paper trading:", e); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([loadWalletsAndTrades(ac.signal), loadPockets(ac.signal), loadPaperData(ac.signal)]).catch(() => {});
    return () => ac.abort();
  }, [loadWalletsAndTrades, loadPockets, loadPaperData]);

  const handleSavePockets = useCallback((newPockets: TradingPocket[]) => {
    setPockets(newPockets);
    newPockets.forEach((p) => { savePocketApi(p).catch((e) => console.error(`Failed to save pocket ${p.id}:`, e)); });
  }, []);

  const handleRemoveWallet = useCallback(async (address: string) => {
    try { await toggleScanWatch(address, false); setWatchedWallets((prev) => prev.filter((w) => w.address !== address)); } catch (e) { console.error("Failed to unwatch:", e); }
  }, []);

  const handleEvaluateAll = useCallback(async () => {
    setEvaluating(true);
    try {
      if (watchedWallets.length === 0) { setEvaluating(false); return; }
      const batch = watchedWallets.slice(0, 5);
      for (const w of batch) { try { await evaluateCopyTrade(w.address, w.score, w.pnl, w.avgTrade, w.alias); } catch (e) { console.error(`Eval failed for ${w.address}:`, e); } }
      await loadPaperData();
    } catch (e) { console.error("Evaluation failed:", e); }
    setEvaluating(false);
  }, [watchedWallets, loadPaperData]);

  const handleStaleClose = useCallback(async () => {
    try { await staleClosePaperPositions(); await loadPaperData(); } catch (e) { console.error("Stale close failed:", e); }
  }, [loadPaperData]);

  const handleResetPaper = useCallback(async () => {
    if (!confirm("Reset all paper trading data?")) return;
    try { await resetCopyTrading(); await loadPaperData(); } catch {}
  }, [loadPaperData]);

  const handleClosePosition = useCallback(async (posId: string) => {
    try { await closeCopyPosition(posId); await loadPaperData(); } catch (e) { console.error("Close failed:", e); }
  }, [loadPaperData]);

  const handleSaveCopyConfig = useCallback(async (cfg: CopyConfig) => {
    try { const saved = await updateCopyConfig(cfg); setCopyConfig(saved); } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    await loadWalletsAndTrades(undefined); await loadPaperData(undefined);
  }, [loadWalletsAndTrades, loadPaperData]);

  const totalPnl = watchedWallets.reduce((s, w) => s + w.pnl, 0);
  const totalVol = watchedWallets.reduce((s, w) => s + w.totalNotional, 0);
  const avgScore = watchedWallets.length > 0 ? Math.round(watchedWallets.reduce((s, w) => s + w.score, 0) / watchedWallets.length) : 0;
  const activePockets = pockets.filter((p) => p.status === "active");

  const walletPocketMap = new Map<string, TradingPocket>();
  for (const p of pockets) { for (const addr of p.traders) { walletPocketMap.set(addr.toLowerCase(), p); } }

  return (
    <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-8 pb-16 pt-6 flex flex-col gap-5">
      <InDevelopment />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bookmark size={16} className="text-cyan-400/60" />
          <h2 className="text-sm font-mono text-white/70 tracking-widest uppercase">Watchlist</h2>
          <span className="text-[10px] font-mono text-white/25">{watchedWallets.length} wallets &middot; {pockets.length} pockets</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshAll} className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/70 transition-all" title="Refresh all"><RefreshCw size={12} /></button>
          {lastRefresh > 0 && <span className="text-[9px] font-mono text-white/15">{timeAgo(lastRefresh)}</span>}
        </div>
      </div>

      {/* System Status Bar — compact mode */}
      <SystemStatusBar compact showProvenance />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={<Wallet size={14} />} label="Tracked Wallets" value={watchedWallets.length.toString()} sub="From Radar scanner" />
        <MetricCard icon={<Activity size={14} />} label="Live Trades" value={realTrades.length.toString()} sub="Recent activity" />
        <MetricCard icon={totalPnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} label="Combined PnL" value={`${totalPnl >= 0 ? "+" : ""}${formatUSD(totalPnl)}`} color={totalPnl >= 0 ? "text-emerald-400" : "text-red-400"} sub="All watched wallets" />
        <MetricCard icon={<DollarSign size={14} />} label="Total Volume" value={formatUSD(totalVol)} sub="All-time" />
        <MetricCard icon={<Target size={14} />} label="Avg Score" value={avgScore.toString()} sub="Across wallets" />
        <MetricCard icon={<CreditCard size={14} />} label="Pockets" value={`${activePockets.length}/${pockets.length}`} sub="Tap to manage" onClick={() => setPocketsModalOpen(true)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-2"><Shield size={12} className="text-cyan-400/60" /> Watched Wallets</h3>
          <button onClick={() => setPocketsModalOpen(true)} className="text-[10px] font-mono text-cyan-400/50 hover:text-cyan-400 flex items-center gap-1 transition-colors"><Plus size={10} /> Manage Pockets</button>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead><tr className="border-b border-white/5">{["Wallet", "Score", "PnL", "Volume", "Avg Trade", "Trades", "Pocket", ""].map((h, i) => (<th key={i} className="px-3 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>))}</tr></thead>
              <tbody>
                {tradesLoading && watchedWallets.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-white/20"><div className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading watched wallets...</div></td></tr>
                ) : watchedWallets.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-white/20">No watched wallets yet. Go to <span className="text-cyan-400/60">Radar</span> to discover and watch wallets.</td></tr>
                ) : (
                  watchedWallets.map((w) => {
                    const pocket = walletPocketMap.get(w.address.toLowerCase());
                    return (
                      <tr key={w.address} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors group">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {w.profileImage ? <img src={w.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center"><Wallet size={10} className="text-white/40" /></div>}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-white/70 group-hover:text-white transition-colors">{w.alias || shortAddr(w.address)}</span>
                                <button onClick={() => { navigator.clipboard.writeText(w.address); setCopiedAddr(w.address); setTimeout(() => setCopiedAddr(null), 1500); }} className="text-white/15 hover:text-cyan-400 transition-colors" title="Copy address">{copiedAddr === w.address ? <Check size={10} /> : <Copy size={10} />}</button>
                              </div>
                              {w.xUsername && <span className="text-[9px] text-white/20">@{w.xUsername}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] border ${w.score >= 70 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : w.score >= 40 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-white/40"}`}>{w.score}</span></td>
                        <td className="px-3 py-2.5"><span className={`flex items-center gap-1 ${w.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{w.pnl >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{formatUSD(Math.abs(w.pnl))}</span></td>
                        <td className="px-3 py-2.5 text-white/50">{formatUSD(w.totalNotional)}</td>
                        <td className="px-3 py-2.5 text-white/40">{w.avgTrade > 0 ? formatUSD(w.avgTrade) : "---"}</td>
                        <td className="px-3 py-2.5 text-white/40">{w.totalTrades || "---"}</td>
                        <td className="px-3 py-2.5">
                          {pocket ? (<div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded bg-gradient-to-br ${pocket.color}`} /><span className="text-[10px] text-white/40 truncate max-w-[80px]">{pocket.name}</span></div>) : (<button onClick={() => setPocketsModalOpen(true)} className="text-[9px] text-white/15 hover:text-cyan-400/50 transition-colors">+ assign</button>)}
                        </td>
                        <td className="px-3 py-2.5"><button onClick={() => handleRemoveWallet(w.address)} className="p-1.5 rounded-full border bg-white/[0.02] border-white/10 text-white/15 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all" title="Unwatch"><Trash2 size={11} /></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pockets.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-2"><Layers size={12} className="text-cyan-400/60" /> Trading Pockets</h3>
            <button onClick={() => setPocketsModalOpen(true)} className="text-[10px] font-mono text-cyan-400/50 hover:text-cyan-400 flex items-center gap-1 transition-colors"><Pencil size={10} /> Edit</button>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead><tr className="border-b border-white/5">{["Pocket", "Status", "Strategy", "Wallets", "Categories", "Allocation", "PnL", ""].map((h, i) => (<th key={i} className="px-4 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>))}</tr></thead>
                <tbody>
                  {pockets.sort((a, b) => b.pnl - a.pnl).map((p) => {
                    const st = statusStyle(p.status);
                    const assignedWallets = watchedWallets.filter((w) => p.traders.includes(w.address));
                    return (
                      <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors group">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${p.color} shadow-md flex items-center justify-center shrink-0`}><Layers size={11} className="text-white/80" /></div><div className="flex flex-col"><span className="text-[11px] text-white/80 group-hover:text-white transition-colors">{p.name}</span><span className="text-[9px] text-white/20">{p.createdAt}</span></div></div></td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-[9px] border ${st.bg} ${st.border} ${st.color}`}>{st.label}</span></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><span className="text-white/35 text-[10px] line-clamp-1">{p.strategy}</span></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Users size={9} className="text-white/25" /><span className="text-white/50">{assignedWallets.length}</span>{assignedWallets.length > 0 && <span className="text-[8px] text-white/15">({p.traders.length})</span>}</div></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="flex gap-1 flex-wrap">{p.categories.slice(0, 2).map((c) => (<span key={c} className="px-1.5 py-0.5 rounded text-[8px] bg-white/5 border border-white/[0.06] text-white/30">{c}</span>))}{p.categories.length > 2 && <span className="text-[8px] text-white/20">+{p.categories.length - 2}</span>}</div></td>
                        <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{formatUSD(p.allocation)}</td>
                        <td className="px-4 py-3"><div className="flex flex-col items-end"><span className={`flex items-center gap-1 ${p.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p.pnl >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{formatUSD(Math.abs(p.pnl))}</span><span className={`text-[9px] ${p.pnlPct >= 0 ? "text-emerald-400/50" : "text-red-400/50"}`}>{p.pnlPct > 0 ? "+" : ""}{p.pnlPct}%</span></div></td>
                        <td className="px-4 py-3"><div className="flex items-center justify-center gap-1.5"><button onClick={() => setPocketsModalOpen(true)} className="p-1.5 rounded-full border bg-white/[0.02] border-white/10 text-white/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all" title="Edit"><Pencil size={11} /></button><button onClick={() => { deletePocketApi(p.id).catch(console.error); setPockets((prev) => prev.filter((x) => x.id !== p.id)); }} className="p-1.5 rounded-full border bg-white/[0.02] border-white/10 text-white/20 hover:text-red-400 hover:border-red-500/30 transition-all" title="Delete"><Trash2 size={11} /></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-2"><Radio size={12} className="text-emerald-400 animate-pulse" /> Live Trades Feed</h3>
          <span className="text-[9px] font-mono text-white/20">{realTrades.length} trades from {watchedWallets.length} wallets</span>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead><tr className="border-b border-white/5">{["Status", "Wallet", "Market", "Side", "Type", "Amount", "Price", "Pocket", "Time"].map((h, i) => (<th key={i} className="px-3 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>))}</tr></thead>
              <tbody>
                {tradesLoading && realTrades.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-white/20"><div className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading live trades...</div></td></tr>
                ) : realTrades.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-white/20">{watchedWallets.length === 0 ? "No watched wallets. Add wallets from Radar to see their trades." : "No recent trades found for watched wallets."}</td></tr>
                ) : (
                  realTrades.slice(0, 30).map((t, idx) => {
                    const pocket = walletPocketMap.get(t.walletAddress);
                    const pocketIdx = pocket ? pockets.indexOf(pocket) : -1;
                    return (
                      <tr key={`${t.id}-${idx}`} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                        <td className="px-3 py-2.5 text-center"><Circle size={7} className="text-emerald-400 fill-emerald-400" /></td>
                        <td className="px-3 py-2.5"><div className="flex items-center gap-1.5"><span className="text-white/50 text-[10px]">{t.walletAlias || shortAddr(t.walletAddress)}</span>{t.walletScore > 0 && <span className="text-[8px] text-white/15">S:{t.walletScore}</span>}</div></td>
                        <td className="px-3 py-2.5 text-white/60 truncate max-w-[200px]">{t.market}</td>
                        <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[9px] border ${t.side === "YES" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>{t.side}</span></td>
                        <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[9px] border ${t.type === "OPEN" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-violet-500/10 border-violet-500/20 text-violet-400"}`}>{t.type}</span></td>
                        <td className="px-3 py-2.5 text-white/60">{t.amount > 0 ? formatUSD(t.amount * t.price) : "---"}</td>
                        <td className="px-3 py-2.5 text-white/40">{t.price > 0 ? t.price.toFixed(2) : "---"}</td>
                        <td className="px-3 py-2.5">
                          {pocket ? (<div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: POCKET_COLOR_SOLIDS[pocketIdx % POCKET_COLOR_SOLIDS.length] }} /><span className="text-white/30 text-[10px] truncate max-w-[70px]">{pocket.name}</span></div>) : (<span className="text-white/10 text-[9px]">&mdash;</span>)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-white/30 whitespace-nowrap text-[10px]">{timeAgo(t.timestamp)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaperTradingPanel
        watchedWallets={watchedWallets}
        pockets={pockets}
        copyConfig={copyConfig}
        copySummary={copySummary}
        copyDecisions={copyDecisions}
        copyPositions={copyPositions}
        copyOrders={copyOrders}
        evaluating={evaluating}
        onEvaluateAll={handleEvaluateAll}
        onSaveCopyConfig={handleSaveCopyConfig}
        onResetPaper={handleResetPaper}
        onClosePosition={handleClosePosition}
        onStaleClose={handleStaleClose}
        onRefresh={refreshAll}
      />

      <AnimatePresence>
        {pocketsModalOpen && (
          <PocketEditorModal pockets={pockets} watchedWallets={watchedWallets} onSave={handleSavePockets} onClose={() => setPocketsModalOpen(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}