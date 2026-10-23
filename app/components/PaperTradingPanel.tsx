import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers, Zap, Settings, RotateCcw, Target, Activity,
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight,
  ArrowDownRight, CheckCircle2, XCircle, Shield,
  Clock, X, Loader2, AlertTriangle, Timer,
  Wallet, ChevronRight, BarChart3, Radio,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface CopyConfig {
  enabled: boolean;
  realExecutionEnabled?: boolean;
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

interface WatchedWallet {
  address: string;
  alias: string | null;
  score: number;
  pnl: number;
  avgTrade: number;
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

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function formatUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function shortAddr(a: string) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function timeAgo(ts: string | number) {
  const d = typeof ts === "number" ? ts : new Date(ts).getTime();
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function formatAge(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${Math.round(ms / 3_600_000)}h`;
}

function pctOf(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color, small }: {
  label: string; value: string; sub?: string; color?: string; small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase truncate">{label}</span>
      <span className={`${small ? "text-lg" : "text-2xl"} font-mono tracking-tight leading-none ${color || "text-white/90"}`}>{value}</span>
      {sub && <span className="text-[9px] font-mono text-white/20">{sub}</span>}
    </div>
  );
}

function WinRateBox({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color: string; icon?: React.ReactNode;
}) {
  return (
    <div className={`flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col items-center gap-1`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">{label}</span>
      </div>
      <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
      {sub && <span className="text-[8px] font-mono text-white/20">{sub}</span>}
    </div>
  );
}

// Config modal (simplified)
function CopyConfigModal({ config, onSave, onClose }: {
  config: CopyConfig; onSave: (cfg: CopyConfig) => void; onClose: () => void;
}) {
  const [local, setLocal] = useState<CopyConfig>({ ...config });
  const fields: { key: keyof CopyConfig; label: string; type: "number" | "toggle"; unit?: string; step?: number }[] = [
    { key: "enabled", label: "Copy Enabled", type: "toggle" },
    { key: "minSourceScore", label: "Min Score", type: "number", unit: "pts" },
    { key: "minSourcePnl", label: "Min PnL", type: "number", unit: "$" },
    { key: "minAvgTradeSize", label: "Min Avg Trade", type: "number", unit: "$" },
    { key: "minNotional", label: "Min Notional", type: "number", unit: "$" },
    { key: "maxCopyDelayMs", label: "Max Delay", type: "number", unit: "ms", step: 1000 },
    { key: "maxSlippagePct", label: "Max Slippage", type: "number", unit: "%", step: 0.1 },
    { key: "maxExposurePerMarket", label: "Max / Market", type: "number", unit: "$" },
    { key: "maxExposurePerWallet", label: "Max / Wallet", type: "number", unit: "$" },
    { key: "cooldownMs", label: "Cooldown", type: "number", unit: "ms", step: 1000 },
    { key: "paperBalance", label: "Paper Balance", type: "number", unit: "$" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#08080e]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl" style={{ scrollbarWidth: "none" }}>
        <div className="sticky top-0 z-10 bg-[#08080e]/80 backdrop-blur-2xl border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-cyan-400/60" />
            <h2 className="text-sm font-mono text-white/90 tracking-widest uppercase">Copy Rules</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"><X size={16} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <label className="text-[10px] font-mono text-white/50 tracking-widest uppercase whitespace-nowrap">{f.label}</label>
              {f.type === "toggle" ? (
                <button onClick={() => setLocal({ ...local, [f.key]: !local[f.key] })} className={`px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all ${local[f.key] ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {local[f.key] ? "ON" : "OFF"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {f.unit === "$" && <span className="text-[10px] text-white/20 font-mono">$</span>}
                  <input type="number" value={local[f.key] as number} step={f.step || 1} onChange={(e) => setLocal({ ...local, [f.key]: parseFloat(e.target.value) || 0 })} className="w-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white/80 outline-none focus:border-cyan-500/30 text-right transition-colors" />
                  {f.unit && f.unit !== "$" && <span className="text-[10px] text-white/20 font-mono">{f.unit}</span>}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => { onSave(local); onClose(); }} className="mt-2 px-5 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono text-cyan-400 tracking-widest uppercase hover:bg-cyan-500/20 transition-all self-end">Save Rules</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export interface PaperTradingPanelProps {
  watchedWallets: WatchedWallet[];
  pockets: TradingPocket[];
  copyConfig: CopyConfig | null;
  copySummary: CopySummary | null;
  copyDecisions: any[];
  copyPositions: any[];
  copyOrders: any[];
  evaluating: boolean;
  onEvaluateAll: () => void;
  onSaveCopyConfig: (cfg: CopyConfig) => void;
  onResetPaper: () => void;
  onClosePosition: (posId: string) => void;
  onStaleClose: () => void;
  onRefresh: () => void;
}

export function PaperTradingPanel({
  watchedWallets, pockets, copyConfig, copySummary,
  copyDecisions, copyPositions, copyOrders, evaluating,
  onEvaluateAll, onSaveCopyConfig, onResetPaper,
  onClosePosition, onStaleClose, onRefresh,
}: PaperTradingPanelProps) {
  const [selectedPocketId, setSelectedPocketId] = useState<number | null>(null);
  const [posTab, setPosTab] = useState<"active" | "closed" | "activity">("active");
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "90D" | "1Y" | "ALL">("ALL");
  const [configOpen, setConfigOpen] = useState(false);

  // Derive selected pocket
  const safePockets = pockets || [];
  const selectedPocket = safePockets.find((p) => p.id === selectedPocketId) || null;

  // Filter data by selected pocket's wallets
  const pocketWallets = useMemo(() => {
    if (!selectedPocket) return new Set<string>();
    return new Set(selectedPocket.traders.map((a) => a.toLowerCase()));
  }, [selectedPocket]);

  const filteredDecisions = useMemo(() => {
    if (!selectedPocket) return copyDecisions;
    return copyDecisions.filter((d: any) => pocketWallets.has((d.sourceWallet || "").toLowerCase()));
  }, [copyDecisions, selectedPocket, pocketWallets]);

  const filteredPositions = useMemo(() => {
    if (!selectedPocket) return copyPositions;
    return copyPositions.filter((p: any) => pocketWallets.has((p.sourceWallet || "").toLowerCase()));
  }, [copyPositions, selectedPocket, pocketWallets]);

  const filteredOrders = useMemo(() => {
    if (!selectedPocket) return copyOrders;
    return copyOrders.filter((o: any) => pocketWallets.has((o.sourceWallet || "").toLowerCase()));
  }, [copyOrders, selectedPocket, pocketWallets]);

  const openPositions = filteredPositions.filter((p: any) => p.status === "open");
  const closedPositions = filteredPositions.filter((p: any) => p.status === "closed");

  // Compute pocket-scoped stats
  const stats = useMemo(() => {
    const realized = closedPositions.reduce((s: number, p: any) => s + (p.realizedPnl || 0), 0);
    const unrealized = openPositions.reduce((s: number, p: any) => s + (p.unrealizedPnl || 0), 0);
    const totalPnl = realized + unrealized;
    const totalVolume = filteredOrders.reduce((s: number, o: any) => s + (o.fillNotional || 0), 0);
    const totalTrades = filteredOrders.length;
    const wins = closedPositions.filter((p: any) => (p.realizedPnl || 0) > 0).length;
    const losses = closedPositions.filter((p: any) => (p.realizedPnl || 0) < 0).length;
    const winRate = closedPositions.length > 0 ? (wins / closedPositions.length) * 100 : 0;
    const exposure = openPositions.reduce((s: number, p: any) => s + (p.notional || 0), 0);
    const balance = copySummary?.paperBalance || 10000;
    const roi = balance > 0 ? (totalPnl / balance) * 100 : 0;
    const lastTradeTs = filteredOrders.length > 0 ? Math.max(...filteredOrders.map((o: any) => o.timestamp || 0)) : 0;

    // Win amounts for avg/largest
    const winAmounts = closedPositions.filter((p: any) => (p.realizedPnl || 0) > 0).map((p: any) => p.realizedPnl || 0);
    const lossAmounts = closedPositions.filter((p: any) => (p.realizedPnl || 0) < 0).map((p: any) => p.realizedPnl || 0);
    const largestWin = winAmounts.length > 0 ? Math.max(...winAmounts) : 0;
    const avgWin = winAmounts.length > 0 ? winAmounts.reduce((a: number, b: number) => a + b, 0) / winAmounts.length : 0;
    const avgLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a: number, b: number) => a + b, 0) / lossAmounts.length : 0;

    // Sharpe-like ratio (simplified: mean/stddev of position PnLs)
    const allPnls = closedPositions.map((p: any) => p.realizedPnl || 0);
    const mean = allPnls.length > 0 ? allPnls.reduce((a: number, b: number) => a + b, 0) / allPnls.length : 0;
    const variance = allPnls.length > 1 ? allPnls.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / (allPnls.length - 1) : 0;
    const stddev = Math.sqrt(variance);
    const sharpe = stddev > 0 ? mean / stddev : 0;

    // Profit factor
    const grossProfit = winAmounts.reduce((a: number, b: number) => a + b, 0);
    const grossLoss = Math.abs(lossAmounts.reduce((a: number, b: number) => a + b, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Max drawdown (simple: largest peak-to-trough in cumulative PnL)
    let peak = 0, maxDD = 0, cumPnl = 0;
    const sortedClosed = [...closedPositions].sort((a: any, b: any) => (a.closedAt || 0) - (b.closedAt || 0));
    for (const p of sortedClosed) {
      cumPnl += (p.realizedPnl || 0);
      if (cumPnl > peak) peak = cumPnl;
      const dd = peak - cumPnl;
      if (dd > maxDD) maxDD = dd;
    }
    const maxDDPct = balance > 0 ? (maxDD / balance) * 100 : 0;

    // Unique wallets & markets
    const uniqueWallets = new Set(filteredDecisions.map((d: any) => d.sourceWallet)).size;
    const uniqueMarkets = new Set(filteredDecisions.map((d: any) => d.market)).size;

    // Copy rate
    const copied = filteredDecisions.filter((d: any) => d.action4 === "PAPER_COPY" || d.action === "COPY").length;
    const copyRate = filteredDecisions.length > 0 ? (copied / filteredDecisions.length) * 100 : 0;

    return {
      totalPnl, realized, unrealized, totalVolume, totalTrades,
      wins, losses, winRate, exposure, balance, roi, lastTradeTs,
      largestWin, avgWin, avgLoss, sharpe, profitFactor,
      maxDD, maxDDPct, uniqueWallets, uniqueMarkets, copyRate, copied,
    };
  }, [closedPositions, openPositions, filteredOrders, filteredDecisions, copySummary]);

  // Build PnL chart data from closed positions (cumulative)
  const chartData = useMemo(() => {
    const sorted = [...closedPositions].sort((a: any, b: any) => (a.closedAt || 0) - (b.closedAt || 0));
    if (sorted.length === 0) return [];
    let cumPnl = 0;
    const points = sorted.map((p: any) => {
      cumPnl += (p.realizedPnl || 0);
      return { time: p.closedAt || p.updatedAt || Date.now(), pnl: cumPnl };
    });
    // Prepend zero point
    const first = points[0];
    if (first) points.unshift({ time: (first.time || Date.now()) - 86400000, pnl: 0 });

    // Apply time filter
    const now = Date.now();
    const ranges: Record<string, number> = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };
    if (chartRange !== "ALL" && ranges[chartRange]) {
      const cutoff = now - ranges[chartRange] * 86400000;
      return points.filter((p) => p.time >= cutoff);
    }
    return points;
  }, [closedPositions, chartRange]);

  const formatChartDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleString("en", { month: "short" })} ${d.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* ═══ HEADER ════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-t border-white/[0.06] pt-6">
        <div className="flex items-center gap-3">
          <Layers size={16} className="text-amber-400/60" />
          <h2 className="text-sm font-mono text-white/70 tracking-widest uppercase">Paper Copy Trading</h2>
          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 tracking-widest">SIMULATED</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEvaluateAll} disabled={evaluating} className="px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-2 hover:bg-cyan-500/20 disabled:opacity-40 transition-all">
            {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {evaluating ? "Evaluating…" : "Evaluate All"}
          </button>
          <button onClick={onStaleClose} className="px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[10px] font-mono text-amber-400/40 tracking-widest uppercase flex items-center gap-2 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Close stale positions">
            <Timer size={12} /> Stale Close
          </button>
          <button onClick={() => setConfigOpen(true)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-2 hover:text-white/70 hover:border-white/20 transition-all">
            <Settings size={12} /> Rules
          </button>
          <button onClick={onResetPaper} className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Reset all paper data">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT: POCKETS SIDEBAR + DASHBOARD ═════════════════ */}
      <div className="flex gap-4 min-h-[520px]">

        {/* ─── POCKET SIDEBAR ─────────────────────────────────────────── */}
        <div className="w-[220px] shrink-0 flex flex-col gap-2">
          <GlassCard className="p-3 flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2 px-1">
              <Wallet size={12} className="text-cyan-400/60" />
              <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Connected Pockets</span>
            </div>

            {/* "All" option */}
            <button
              onClick={() => setSelectedPocketId(null)}
              className={`w-full text-left rounded-xl px-3 py-3 border transition-all ${
                selectedPocketId === null
                  ? "bg-cyan-500/10 border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedPocketId === null ? "bg-cyan-500/20" : "bg-white/5"}`}>
                  <Target size={12} className={selectedPocketId === null ? "text-cyan-400" : "text-white/30"} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] font-mono block ${selectedPocketId === null ? "text-cyan-400" : "text-white/50"}`}>All Pockets</span>
                  <span className="text-[9px] font-mono text-white/20">{watchedWallets.length} wallets</span>
                </div>
              </div>
            </button>

            {/* Pocket list */}
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
              {safePockets.map((p) => {
                const isSelected = selectedPocketId === p.id;
                const walletCount = p.traders.length;
                const pocketPnl = copyPositions
                  .filter((pos: any) => p.traders.map((t) => t.toLowerCase()).includes((pos.sourceWallet || "").toLowerCase()))
                  .reduce((s: number, pos: any) => s + (pos.status === "open" ? (pos.unrealizedPnl || 0) : (pos.realizedPnl || 0)), 0);

                return (
                  <motion.button
                    key={p.id}
                    layout
                    onClick={() => setSelectedPocketId(p.id)}
                    className={`w-full text-left rounded-xl px-3 py-3 border transition-all ${
                      isSelected
                        ? "bg-white/[0.06] border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                        <Layers size={10} className="text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-mono truncate ${isSelected ? "text-white/90" : "text-white/50"}`}>{p.name}</span>
                          {isSelected && <ChevronRight size={10} className="text-cyan-400/60 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-white/20">{walletCount}w</span>
                          <span className={`text-[9px] font-mono ${pocketPnl >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                            {pocketPnl >= 0 ? "+" : ""}{formatUSD(pocketPnl)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Status pill */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider ${
                        p.status === "active" ? "bg-emerald-500/10 text-emerald-400/70" :
                        p.status === "paused" ? "bg-amber-500/10 text-amber-400/70" :
                        "bg-white/5 text-white/25"
                      }`}>{p.status.toUpperCase()}</span>
                      {p.categories.slice(0, 1).map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-[7px] font-mono bg-white/5 text-white/20">{c}</span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
              {safePockets.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center gap-2">
                  <Wallet size={20} className="text-white/10" />
                  <span className="text-[10px] font-mono text-white/20">No pockets yet</span>
                  <span className="text-[9px] font-mono text-white/10">Create pockets above to organize wallets</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ─── MAIN DASHBOARD ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* ── TOP STATS ROW ────────────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-3">
            <GlassCard className="p-4">
              <StatBox
                label="Total PnL"
                value={`${stats.totalPnl >= 0 ? "+" : ""}${formatUSD(stats.totalPnl)}`}
                color={stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}
                sub={`R: ${formatUSD(stats.realized)} / U: ${formatUSD(stats.unrealized)}`}
              />
            </GlassCard>
            <GlassCard className="p-4">
              <StatBox label="Volume" value={formatUSD(stats.totalVolume)} sub={`${stats.uniqueMarkets} markets`} />
            </GlassCard>
            <GlassCard className="p-4">
              <StatBox label="Trades" value={stats.totalTrades.toString()} sub={`${stats.copied} copied • ${pctOf(stats.copied, filteredDecisions.length)} rate`} />
            </GlassCard>
            <GlassCard className="p-4">
              <StatBox
                label="Last Trade"
                value={stats.lastTradeTs > 0 ? timeAgo(stats.lastTradeTs) : "—"}
                sub={stats.lastTradeTs > 0 ? new Date(stats.lastTradeTs).toLocaleDateString() : "No trades yet"}
              />
            </GlassCard>
            <GlassCard className="p-4">
              <StatBox
                label="Edge Score"
                value={stats.winRate > 0 ? Math.round(stats.winRate).toString() : "—"}
                color="text-violet-400"
                sub={`${stats.wins}W / ${stats.losses}L`}
              />
            </GlassCard>
          </div>

          {/* ── MIDDLE ROW: Win Rate Analysis + Risk Analysis ─────────── */}
          <div className="grid grid-cols-3 gap-4">
            {/* Identity / Overview */}
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Identity</span>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-mono bg-white/5 border border-white/10 text-white/30">
                    {selectedPocket?.name || "All"}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400/60">
                  <Radio size={8} className="animate-pulse" /> LIVE
                </span>
              </div>

              {/* Performance metrics */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/25 tracking-wider">WIN RATE</span>
                  <span className="text-lg font-mono text-white/80">{stats.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/25 tracking-wider">SHARPE</span>
                  <span className="text-lg font-mono text-white/80">{stats.sharpe.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/25 tracking-wider">PROFIT FACTOR</span>
                  <span className="text-lg font-mono text-white/80">{stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/25 tracking-wider">ROI</span>
                  <span className={`text-lg font-mono ${stats.roi >= 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>{stats.roi.toFixed(2)}%</span>
                </div>
              </div>

              {/* Wallet info */}
              <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/20">{stats.uniqueWallets} wallets tracked</span>
                <span className="text-[9px] font-mono text-white/20">{openPositions.length} open</span>
              </div>
            </GlassCard>

            {/* Win Rate Analysis */}
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Win Rate Analysis</span>
                <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400/60">
                  <Radio size={8} className="animate-pulse" /> LIVE
                </span>
              </div>

              <div className="flex gap-2 mt-1">
                <WinRateBox
                  label="Overall WR"
                  value={`${stats.winRate.toFixed(1)}%`}
                  sub={`${stats.wins}W / ${stats.losses}L`}
                  color={stats.winRate >= 50 ? "text-emerald-400" : "text-red-400"}
                  icon={<BarChart3 size={10} className="text-amber-400/60" />}
                />
                <WinRateBox
                  label="Copy Rate"
                  value={`${stats.copyRate.toFixed(1)}%`}
                  sub={`${stats.copied} of ${filteredDecisions.length}`}
                  color="text-cyan-400"
                  icon={<CheckCircle2 size={10} className="text-emerald-400/60" />}
                />
              </div>

              <div className="mt-2">
                <span className="text-[8px] font-mono text-white/25 tracking-widest uppercase">Performance Metrics</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/30">Sharpe Ratio</span>
                    <span className="text-sm font-mono text-white/70">{stats.sharpe.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/30">Profit Factor</span>
                    <span className="text-sm font-mono text-white/70">{stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/30">ROI</span>
                    <span className={`text-sm font-mono ${stats.roi >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>{stats.roi.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/30">Expectancy</span>
                    <span className="text-sm font-mono text-white/70">{closedPositions.length > 0 ? formatUSD(stats.totalPnl / closedPositions.length) : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono text-white/25 tracking-widest">TOTAL VOLUME</span>
                  <span className="text-sm font-mono text-white/60">{formatUSD(stats.totalVolume)}</span>
                </div>
              </div>
            </GlassCard>

            {/* Risk Analysis */}
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Risk Analysis</span>
                <span className="px-1.5 py-0.5 rounded text-[7px] font-mono bg-amber-500/10 border border-amber-500/15 text-amber-400/60">BETA</span>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                {/* Max Drawdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-red-500/15 border border-red-500/20 text-red-400 tracking-wider">MAX DRAWDOWN</span>
                  </div>
                  <span className="text-lg font-mono text-red-400">{stats.maxDDPct.toFixed(1)}%</span>
                </div>

                {/* Exposure */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/30">Exposure</span>
                  <span className="text-sm font-mono text-white/60">{formatUSD(stats.exposure)}</span>
                </div>

                {/* Utilization */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/30">Utilization</span>
                  <span className="text-sm font-mono text-cyan-400/70">
                    {stats.balance > 0 ? `${Math.round((stats.exposure / stats.balance) * 100)}%` : "—"}
                  </span>
                </div>

                <div className="my-1 border-t border-white/[0.04]" />

                {/* Avg Win/Loss */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/30">Avg Win</span>
                  <span className="text-sm font-mono text-emerald-400/70">{stats.avgWin > 0 ? formatUSD(stats.avgWin) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/30">Avg Loss</span>
                  <span className="text-sm font-mono text-red-400/70">{stats.avgLoss < 0 ? formatUSD(Math.abs(stats.avgLoss)) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/30">Largest Win</span>
                  <span className="text-sm font-mono text-emerald-400/70">{stats.largestWin > 0 ? formatUSD(stats.largestWin) : "—"}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* ═══ PERFORMANCE CHART ════════════════════════════════════════ */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Performance Charts</span>
          <div className="flex items-center gap-1">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg overflow-hidden">
              <button className="px-3 py-1.5 text-[9px] font-mono text-white/60 bg-white/[0.06] border-r border-white/[0.08]">P&L</button>
            </div>
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg overflow-hidden ml-2">
              {(["7D", "30D", "90D", "1Y", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1.5 text-[9px] font-mono transition-all ${
                    chartRange === r
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-white/30 hover:text-white/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[240px]">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatChartDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontFamily: "monospace", fill: "rgba(255,255,255,0.2)" }}
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={(v) => formatUSD(v)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontFamily: "monospace", fill: "rgba(255,255,255,0.2)" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(8,8,14,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                  labelFormatter={(v) => formatChartDate(v as number)}
                  formatter={(v: number) => [formatUSD(v), "PnL"]}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#pnlGradient)"
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/15 text-xs font-mono">
              No closed positions yet — chart will appear after trades are closed
            </div>
          )}
        </div>
      </GlassCard>

      {/* ═══ POSITIONS TABS: ACTIVE / CLOSED / ACTIVITY ════════════════ */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 pt-4 pb-0">
          <div className="flex items-center gap-0">
            {(["active", "closed", "activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPosTab(t)}
                className={`px-4 pb-3 text-[10px] font-mono tracking-widest uppercase border-b-2 transition-all ${
                  posTab === t
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-white/30 hover:text-white/50"
                }`}
              >
                {t === "active" && <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active</span>}
                {t === "closed" && "Closed"}
                {t === "activity" && "Activity"}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-mono text-white/20 pb-3">
            {posTab === "active" ? `${openPositions.length} positions` :
             posTab === "closed" ? `${closedPositions.length} positions` :
             `${filteredDecisions.length} decisions`}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* ACTIVE */}
          {posTab === "active" && (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Market", "Side", "Source", "Entry", "Current", "Size", "Notional", "Unrealized PnL", "Age", ""].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {openPositions.length === 0 ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-white/20">No open positions. Click "Evaluate All" to scan for copy signals.</td></tr>
                    ) : openPositions.map((p: any) => {
                      const posAge = Date.now() - (p.openedAt || Date.now());
                      return (
                        <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                          <td className="px-4 py-3 text-white/60 max-w-[180px] truncate">{p.market}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${p.side === "BUY" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>{p.side}</span>
                          </td>
                          <td className="px-4 py-3 text-white/35 text-[10px]">{p.sourceAlias || shortAddr(p.sourceWallet || "")}</td>
                          <td className="px-4 py-3 text-white/50">{p.avgEntryPrice?.toFixed(4)}</td>
                          <td className="px-4 py-3 text-white/50">{p.currentPrice?.toFixed(4)}</td>
                          <td className="px-4 py-3 text-white/50">{p.amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-white/50">{formatUSD(p.notional || 0)}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 ${(p.unrealizedPnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {(p.unrealizedPnl || 0) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {(p.unrealizedPnl || 0) >= 0 ? "+" : ""}{formatUSD(p.unrealizedPnl || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/20 text-[10px]">
                            {formatAge(posAge)}
                            {posAge > 24 * 60 * 60 * 1000 && <AlertTriangle size={9} className="inline ml-1 text-amber-400/40" />}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => onClosePosition(p.id)} className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/5 text-[9px] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">Close</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* CLOSED */}
          {posTab === "closed" && (
            <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Market", "Side", "Source", "Entry", "Exit", "Realized PnL", "Close Reason", "Closed"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {closedPositions.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-white/20">No closed positions yet.</td></tr>
                    ) : closedPositions.map((p: any) => (
                      <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3 text-white/50 max-w-[180px] truncate">{p.market}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] border ${p.side === "BUY" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/50" : "bg-red-500/10 border-red-500/20 text-red-400/50"}`}>{p.side}</span>
                        </td>
                        <td className="px-4 py-3 text-white/25 text-[10px]">{p.sourceAlias || shortAddr(p.sourceWallet || "")}</td>
                        <td className="px-4 py-3 text-white/35">{p.avgEntryPrice?.toFixed(4)}</td>
                        <td className="px-4 py-3 text-white/35">{p.currentPrice?.toFixed(4)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${(p.realizedPnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {(p.realizedPnl || 0) >= 0 ? "+" : ""}{formatUSD(p.realizedPnl || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${
                            p.closeReason === "source_exit_mirror" ? "bg-violet-500/10 text-violet-400/60 border border-violet-500/15"
                              : p.closeReason === "stale_auto_close" ? "bg-amber-500/10 text-amber-400/60 border border-amber-500/15"
                                : "bg-white/5 text-white/25 border border-white/10"
                          }`}>
                            {p.closeReason === "source_exit_mirror" ? "SRC EXIT" : p.closeReason === "stale_auto_close" ? "STALE" : "MANUAL"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/15 text-[10px]">{p.closedAt ? timeAgo(p.closedAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ACTIVITY (Decisions) */}
          {posTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Action", "Market", "Side", "Source", "Price", "Notional", "Age", "Time"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDecisions.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-white/20">No activity yet.</td></tr>
                    ) : filteredDecisions.slice(0, 50).map((d: any) => {
                      const action = d.action4 || (d.action === "COPY" ? "PAPER_COPY" : "BLOCKED_BY_RULE");
                      const actionStyle: Record<string, { label: string; color: string; bg: string; border: string }> = {
                        PAPER_COPY: { label: "COPIED", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                        REAL_ELIGIBLE_DISABLED: { label: "ELIGIBLE", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                        BLOCKED_BY_RULE: { label: "BLOCKED", color: "text-red-400/60", bg: "bg-red-500/5", border: "border-red-500/15" },
                        IGNORE: { label: "IGNORED", color: "text-white/30", bg: "bg-white/[0.03]", border: "border-white/10" },
                      };
                      const s = actionStyle[action] || actionStyle.IGNORE;
                      return (
                        <tr key={d.id} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider border ${s.bg} ${s.border} ${s.color}`}>
                              {action === "PAPER_COPY" ? <CheckCircle2 size={9} /> : action === "BLOCKED_BY_RULE" ? <XCircle size={9} /> : null}
                              {s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/60 max-w-[180px] truncate">{d.market}</td>
                          <td className="px-4 py-3"><span className={d.side === "BUY" ? "text-emerald-400/50" : "text-red-400/50"}>{d.side}</span></td>
                          <td className="px-4 py-3 text-white/35 text-[10px]">{d.sourceAlias || shortAddr(d.sourceWallet || "")}</td>
                          <td className="px-4 py-3 text-white/40">{d.sourcePrice?.toFixed(4)}</td>
                          <td className="px-4 py-3 text-white/40">{formatUSD(d.sourceNotional || 0)}</td>
                          <td className="px-4 py-3 text-white/25 text-[10px]">{formatAge(d.tradeAgeMs || 0)}</td>
                          <td className="px-4 py-3 text-white/20 text-[10px] whitespace-nowrap">{timeAgo(d.timestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ═══ CONFIG MODAL ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {configOpen && copyConfig && (
          <CopyConfigModal config={copyConfig} onSave={onSaveCopyConfig} onClose={() => setConfigOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}