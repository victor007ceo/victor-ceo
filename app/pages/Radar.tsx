import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InDevelopment } from "../components/InDevelopment";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Copy,
  ExternalLink,
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Loader2,
  Scan,
  CheckCircle2,
  BarChart3,
  RotateCcw,
  Users,
  Target,
  Hash,
  Star,
  Trophy,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Shield,
  Filter,
} from "lucide-react";
import {
  loadScannedWallets,
  scanTopWallets,
  toggleScanWatch,
  lookupWallet,
  trackWallet,
  fetchScanWalletDetail,
  debugLeaderboard,
} from "../api";
import type { ScanSettings } from "../api";

// ─── Types ─────────────────────────────────────────────────────────────

interface WalletData {
  id: number;
  address: string;
  alias: string | null;
  profileImage: string | null;
  xUsername: string | null;
  verifiedBadge: boolean;
  status: "recommended" | "watch" | "scored";
  periodsSeen: string[];
  pnl: number;
  pnlPct: number;
  totalNotional: number;
  totalTrades: number;
  marketsTraded: number;
  avgTrade: number;
  score: number;
  watched: boolean;
  lastTraded: string | null;
  rank: number;
  bestPeriod: string;
  avatar: string;
  scannedAt?: number;
  detailLoaded: boolean;
  _source?: string;
  _enriched?: boolean;
}

interface ScanState {
  scanCount: number;
  lastScanAt: number;
  totalCandidates: number;
  totalLeaderboardFetches: number;
  totalWalletsIngested: number;
  periodsCompleted: string[];
  currentPeriod: string;
  currentOrderBy: string;
  currentOffset: number;
  apiCalls: number;
  apiCallsThisScan: number;
  recommendedCount: number;
  watchCount: number;
  filteredCount: number;
}

interface ScanDiagnostics {
  sourceCallsAttempted: number;
  sourceCallsSucceeded: number;
  walletsIngested: number;
  newThisScan: number;
  repeatedThisScan: number;
  periodsQueried: string[];
  errors: string[];
}

interface WalletDetail {
  address: string;
  profileName: string | null;
  profileImage: string | null;
  bio: string | null;
  recentTrades: any[];
  tradeCount: number;
  recentBuyVolume: number;
  recentSellVolume: number;
  avgOrder: number;
  medianOrder: number;
  maxOrder: number;
  realizedPnl: number;
  closedPositionCount: number;
  uniqueMarkets: number;
  lookupTimeMs: number;
  _tradeSource?: string;
  _closedPositionSource?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const PERIOD_LABELS: Record<string, string> = {
  all: "All-Time",
  monthly: "Monthly",
  weekly: "Weekly",
  daily: "Daily",
};

function statusConfig(status: string) {
  if (status === "recommended")
    return { label: "REC", bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-400", icon: <Star size={8} /> };
  if (status === "watch")
    return { label: "WATCH", bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", icon: <Eye size={8} /> };
  return { label: "SCORED", bg: "bg-white/5", border: "border-white/10", text: "text-white/40", icon: <Hash size={8} /> };
}

function formatRelativeDate(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  if (isNaN(ms) || ms < 0) return d;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatUSD(n: number) {
  if (n === undefined || n === null || isNaN(n)) return "$0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function PeriodBadges({ periods }: { periods: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {periods.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono border text-cyan-400/70 bg-cyan-500/8 border-cyan-500/15"
        >
          <Calendar size={7} />
          {PERIOD_LABELS[p] || p}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 min-w-[130px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-[10px] font-mono tracking-widest uppercase">{label}</span>
      </div>
      <span className="text-xl font-mono text-white/90 tracking-tight">{value}</span>
      {sub && <span className="text-[10px] font-mono text-white/30">{sub}</span>}
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────

interface FilterState {
  minPnl: string;
  maxPnl: string;
  minVolume: string;
  minAvgOrder: string;
  minTradeCount: string;
  timePeriod: string;
  category: string;
  onlyVerified: boolean;
}

const defaultFilters: FilterState = {
  minPnl: "",
  maxPnl: "",
  minVolume: "",
  minAvgOrder: "",
  minTradeCount: "",
  timePeriod: "",
  category: "",
  onlyVerified: false,
};

function FilterPanel({
  filters,
  onChange,
  onApply,
  onReset,
  scanning,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  scanning: boolean;
}) {
  const set = (key: keyof FilterState, val: any) => onChange({ ...filters, [key]: val });

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-cyan-400/60" />
          <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
            Scanner Filters
          </span>
          <span className="text-[8px] font-mono text-white/25 ml-2">
            Applied server-side before results are returned
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Min PNL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Min PNL ($)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={filters.minPnl}
              onChange={(e) => set("minPnl", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
          </div>
          {/* Max PNL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Max PNL ($)</label>
            <input
              type="number"
              placeholder="optional"
              value={filters.maxPnl}
              onChange={(e) => set("maxPnl", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
          </div>
          {/* Min Volume */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Min Volume ($)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={filters.minVolume}
              onChange={(e) => set("minVolume", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
          </div>
          {/* Min Avg Order */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Min Avg Order ($)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={filters.minAvgOrder}
              onChange={(e) => set("minAvgOrder", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
            <span className="text-[7px] font-mono text-white/15">vol / numTrades (direct)</span>
          </div>
          {/* Min Trade Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Min Trades</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={filters.minTradeCount}
              onChange={(e) => set("minTradeCount", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
          </div>
          {/* Time Period */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Time Period</label>
            <select
              value={filters.timePeriod}
              onChange={(e) => set("timePeriod", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 outline-none focus:border-cyan-500/30"
            >
              <option value="">Auto-cycle</option>
              <option value="all">All-Time</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Category</label>
            <input
              type="text"
              placeholder="e.g. politics"
              value={filters.category}
              onChange={(e) => set("category", e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-white/80 placeholder:text-white/20 outline-none focus:border-cyan-500/30"
            />
          </div>
          {/* Verified Only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Verified Only</label>
            <button
              onClick={() => set("onlyVerified", !filters.onlyVerified)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono transition-all ${
                filters.onlyVerified
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                  : "bg-white/[0.04] border-white/10 text-white/40"
              }`}
            >
              <Shield size={12} />
              {filters.onlyVerified ? "Yes" : "No"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onApply}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-widest uppercase hover:from-cyan-500/25 hover:to-cyan-500/10 transition-all disabled:opacity-30"
          >
            {scanning ? <Loader2 size={12} className="animate-spin" /> : <Scan size={12} />}
            Scan with Filters
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-mono text-white/30 hover:text-white/60 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Scan Engine Panel ─────────────────────────────────────────────────

function ScanEnginePanel({
  state,
  scanPhase,
  scanProgress,
  onScan,
  onReset,
  diagnostics,
  onToggleFilters,
  showFilters,
}: {
  state: ScanState | null;
  scanPhase: "idle" | "scanning" | "complete" | "error";
  scanProgress: number;
  onScan: () => void;
  onReset: () => void;
  diagnostics: ScanDiagnostics | null;
  onToggleFilters: () => void;
  showFilters: boolean;
}) {
  const [showDebug, setShowDebug] = useState(false);
  const allPeriods = ["all", "monthly", "weekly", "daily"];

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Trophy size={16} className="text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-white/80 tracking-widest uppercase">
              PNL Leaderboard Scanner
            </span>
            <span className="text-[10px] font-mono text-white/30">
              {state ? `${state.scanCount} scans · ${state.totalCandidates} wallets discovered` : "No scans yet"}{" "}
              {state?.lastScanAt ? `· Last: ${timeAgo(state.lastScanAt)}` : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase transition-all ${
              showFilters
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "border-white/10 bg-white/[0.03] text-white/30 hover:text-white/50"
            }`}
          >
            <SlidersHorizontal size={11} />
            Filters
          </button>
          <button
            onClick={onScan}
            disabled={scanPhase === "scanning"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase transition-all ${
              scanPhase === "scanning"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 cursor-wait"
                : "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-cyan-500/10 hover:shadow-[0_0_24px_rgba(6,182,212,0.3)]"
            }`}
          >
            {scanPhase === "scanning" ? <Loader2 size={12} className="animate-spin" /> : <Scan size={12} />}
            {scanPhase === "scanning" ? "Scanning..." : "Scan Leaderboard"}
          </button>

          <button
            onClick={onReset}
            disabled={scanPhase === "scanning"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-mono text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-30"
            title="Reset all scan data"
          >
            <RotateCcw size={11} />
          </button>

          {diagnostics && (
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono transition-all ${
                showDebug
                  ? "bg-white/[0.06] border-white/20 text-white/50"
                  : "border-white/10 bg-white/[0.03] text-white/25 hover:text-white/40"
              }`}
            >
              <Activity size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {scanPhase === "scanning" && (
        <div className="flex flex-col gap-2">
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              initial={{ width: "0%" }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[9px] font-mono text-white/25 tracking-widest uppercase">
            {scanProgress < 30 ? "Fetching /v1/leaderboard..." : scanProgress < 70 ? "Ingesting PNL + VOL data..." : "Scoring & persisting..."}
          </span>
        </div>
      )}

      {/* Period coverage */}
      {state && state.scanCount > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] font-mono text-white/25 tracking-widest uppercase">Coverage:</span>
          {allPeriods.map((p) => {
            const donePnl = (state.periodsCompleted || []).includes(`${p}/PNL`);
            const doneVol = (state.periodsCompleted || []).includes(`${p}/VOL`);
            const isCurrent = state.currentPeriod === p;
            const done = donePnl && doneVol;
            return (
              <div
                key={p}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                  done
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : isCurrent
                      ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      : "bg-white/[0.02] border-white/[0.06] text-white/20"
                }`}
              >
                {done ? <CheckCircle2 size={9} /> : isCurrent ? <Loader2 size={9} className={scanPhase === "scanning" ? "animate-spin" : ""} /> : <Clock size={9} />}
                {PERIOD_LABELS[p] || p}
                <span className="text-[7px] text-white/15">
                  {donePnl ? "P" : ""}{doneVol ? "V" : ""}
                </span>
              </div>
            );
          })}
          <span className="text-[9px] font-mono text-white/15">
            · {state.totalLeaderboardFetches} fetches · {state.currentOrderBy}
          </span>
        </div>
      )}

      {/* Debug panel */}
      <AnimatePresence>
        {showDebug && diagnostics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "API Calls", value: diagnostics.sourceCallsAttempted },
                  { label: "Succeeded", value: diagnostics.sourceCallsSucceeded },
                  { label: "Wallets Ingested", value: diagnostics.walletsIngested },
                  { label: "New", value: diagnostics.newThisScan },
                  { label: "Repeated", value: diagnostics.repeatedThisScan },
                  { label: "Periods Queried", value: diagnostics.periodsQueried.join(", ") || "none" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-lg border bg-white/[0.02] border-white/[0.06]">
                    <span className="text-[9px] font-mono text-white/35">{r.label}</span>
                    <span className="text-[11px] font-mono text-white/60">{r.value}</span>
                  </div>
                ))}
              </div>
              {diagnostics.errors.length > 0 && (
                <div className="flex flex-col gap-1">
                  {diagnostics.errors.slice(0, 3).map((err, i) => (
                    <div key={i} className="text-[9px] font-mono text-red-400/60 bg-red-500/5 rounded px-2 py-1 break-all">{err}</div>
                  ))}
                </div>
              )}
              <div className="text-[8px] font-mono text-white/15">
                Endpoint: data-api.polymarket.com/v1/leaderboard · Fields: proxyWallet, pnl, vol, userName, profileImage, xUsername, verifiedBadge
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inspect Modal ─────────────────────────────────────────────────────

function InspectModal({
  wallet,
  onClose,
  isWatched,
  onToggleWatch,
}: {
  wallet: WalletData;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatch: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [detail, setDetail] = useState<WalletDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await fetchScanWalletDetail(wallet.address);
      setDetail(data);
    } catch (e: any) {
      setDetailError(e.message || "Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  }, [wallet.address]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#08080e]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_32px_128px_rgba(0,0,0,0.8),0_0_1px_rgba(255,255,255,0.1)_inset]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#08080e]/80 backdrop-blur-2xl border-b border-white/[0.06] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-mono font-bold text-white/90 shadow-lg ring-2 ring-white/5"
              style={{ background: wallet.avatar }}
            >
              {wallet.address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-mono text-white/90">
                  {wallet.alias || `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`}
                </span>
                {wallet.verifiedBadge && (
                  <Shield size={12} className="text-cyan-400" />
                )}
                {wallet.rank > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    #{wallet.rank} {PERIOD_LABELS[wallet.bestPeriod] || wallet.bestPeriod}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-[10px] font-mono text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.address);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {wallet.address} {copied ? <Check size={10} /> : <Copy size={10} />}
                </button>
                {wallet.xUsername && (
                  <a
                    href={`https://x.com/${wallet.xUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono text-cyan-400/40 hover:text-cyan-400 transition-colors"
                  >
                    @{wallet.xUsername}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleWatch}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 transition-all ${
                isWatched
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                  : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {isWatched ? <Check size={11} /> : <Plus size={11} />}
              {isWatched ? "Watching" : "Watch"}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* PNL Hero */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-white/25 tracking-widest uppercase">PNL</span>
              <span className={`text-3xl font-mono font-bold ${wallet.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {wallet.pnl >= 0 ? "+" : ""}{formatUSD(wallet.pnl)}
              </span>
              {wallet.pnlPct !== 0 && (
                <span className={`text-xs font-mono ${wallet.pnlPct >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                  {wallet.pnlPct >= 0 ? "+" : ""}{wallet.pnlPct.toFixed(1)}% ROI
                </span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <DollarSign size={12} />, label: "Volume", value: formatUSD(wallet.totalNotional) },
                { icon: <Activity size={12} />, label: "Trades", value: wallet.totalTrades.toLocaleString() },
                { icon: <BarChart3 size={12} />, label: "Avg Order", value: formatUSD(wallet.avgTrade), note: "vol/trades" },
                { icon: <Clock size={12} />, label: "Last Trade", value: wallet.lastTraded ? formatRelativeDate(wallet.lastTraded) : "---" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/30">
                    {s.icon}
                    <span className="text-[9px] font-mono tracking-widest uppercase">{s.label}</span>
                  </div>
                  <span className="text-base font-mono text-white/80">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Periods + provenance */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono text-white/25 tracking-widest uppercase">Seen on:</span>
            <PeriodBadges periods={wallet.periodsSeen} />
            {wallet._source && (
              <span className="text-[7px] font-mono text-white/15 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                src: {wallet._source}
              </span>
            )}
          </div>

          {/* View More */}
          {!detail && !detailLoading && (
            <button
              onClick={loadDetail}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-mono text-white/50 hover:text-cyan-400 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all"
            >
              <ArrowUpRight size={14} />
              View More — Load Trades, Closed Positions & Profile
            </button>
          )}

          {detailLoading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-cyan-400" />
              <span className="text-[10px] font-mono text-white/40">Loading trades + closed positions...</span>
            </div>
          )}

          {detailError && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 text-[10px] font-mono text-red-400/70">
              {detailError}
              <button onClick={loadDetail} className="ml-2 text-red-400 underline">Retry</button>
            </div>
          )}

          {/* Detail */}
          {detail && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {(detail.profileName || detail.bio) && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2">
                  {detail.profileName && <span className="text-sm font-mono text-white/80">{detail.profileName}</span>}
                  {detail.bio && <span className="text-[11px] font-mono text-white/40 leading-relaxed">{detail.bio}</span>}
                </div>
              )}

              {/* Enrichment stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Recent Trades", value: detail.tradeCount, src: detail._tradeSource },
                  { label: "Avg Order", value: formatUSD(detail.avgOrder), src: "computed" },
                  { label: "Median Order", value: formatUSD(detail.medianOrder), src: "computed" },
                  { label: "Max Order", value: formatUSD(detail.maxOrder), src: "computed" },
                  { label: "Buy Volume", value: formatUSD(detail.recentBuyVolume), src: "activity-api" },
                  { label: "Sell Volume", value: formatUSD(detail.recentSellVolume), src: "activity-api" },
                  { label: "Realized PNL", value: formatUSD(detail.realizedPnl), src: detail._closedPositionSource },
                  { label: "Closed Positions", value: detail.closedPositionCount, src: detail._closedPositionSource },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
                    <span className="text-[8px] font-mono text-white/25 tracking-widest uppercase block">{s.label}</span>
                    <span className="text-sm font-mono text-white/70">{s.value}</span>
                    {s.src && s.src !== "none" && (
                      <span className="text-[6px] font-mono text-white/10 block mt-0.5">{s.src}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Trade list */}
              {detail.recentTrades.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-white/25 tracking-widest uppercase">Recent Activity</span>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <table className="w-full text-[10px] font-mono">
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          <th className="text-left px-3 py-2 text-white/25 font-normal">Market</th>
                          <th className="text-center px-2 py-2 text-white/25 font-normal">Side</th>
                          <th className="text-right px-2 py-2 text-white/25 font-normal">Amount</th>
                          <th className="text-right px-3 py-2 text-white/25 font-normal">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.recentTrades.slice(0, 15).map((t: any) => (
                          <tr key={t.id} className="border-b border-white/[0.02]">
                            <td className="px-3 py-2 text-white/50 max-w-[200px] truncate">{t.market}</td>
                            <td className="px-2 py-2 text-center">
                              <span className={t.side === "BUY" ? "text-emerald-400/70" : "text-red-400/70"}>
                                {t.side}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-right text-white/50">{t.amount.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right text-white/40">{t.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <span className="text-[8px] font-mono text-white/15 text-center">
                    Loaded in {detail.lookupTimeMs}ms
                  </span>
                </div>
              )}

              {detail.recentTrades.length === 0 && (
                <div className="text-center text-[10px] font-mono text-white/25 py-4">
                  No recent activity data available from Polymarket API
                </div>
              )}
            </motion.div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
            <span className="text-[9px] font-mono text-white/20 tracking-widest">
              VICTOR.CEO · PNL data from /v1/leaderboard (direct)
            </span>
            <a
              href={`https://polymarket.com/profile/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-cyan-400/50 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              View on Polymarket <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export function Radar() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [diagnostics, setDiagnostics] = useState<ScanDiagnostics | null>(null);
  const [scanPhase, setScanPhase] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("pnl");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const statusFilter = "all";
  const [page, setPage] = useState(0);
  const [inspectWallet, setInspectWallet] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Wallet lookup state
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupTracked, setLookupTracked] = useState(false);
  const lookupTimeoutRef = useRef<any>(null);

  // Debug state
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Build settings from filters
  const buildSettings = useCallback((): ScanSettings => {
    const s: ScanSettings = {};
    if (filters.minPnl) s.minPnl = parseFloat(filters.minPnl);
    if (filters.maxPnl) s.maxPnl = parseFloat(filters.maxPnl);
    if (filters.minVolume) s.minVolume = parseFloat(filters.minVolume);
    if (filters.minAvgOrder) s.minAvgOrder = parseFloat(filters.minAvgOrder);
    if (filters.minTradeCount) s.minTradeCount = parseInt(filters.minTradeCount);
    if (filters.onlyVerified) s.onlyVerified = true;
    if (filters.timePeriod) s.timePeriod = filters.timePeriod;
    if (filters.category) s.category = filters.category;
    return s;
  }, [filters]);

  // Load on mount
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    loadScannedWallets({ signal: ac.signal })
      .then((data) => {
        if (ac.signal.aborted) return;
        if (data && typeof data === "object") {
          let rawWallets: any[] = [];
          if (Array.isArray(data)) {
            rawWallets = data;
          } else {
            if (Array.isArray(data.wallets)) rawWallets = data.wallets;
            if (data.state) setScanState(data.state);
          }
          setWallets(rawWallets.map(normalizeWallet));
        }
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        console.error("Failed to load scan data:", e);
      })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  // Scan handler
  const handleScan = useCallback(
    async (mode: "scan" | "reset" = "scan") => {
      setScanPhase("scanning");
      setScanProgress(0);
      setScanError(null);

      const interval = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 90) { clearInterval(interval); return 90; }
          return p + Math.random() * 12;
        });
      }, 500);

      try {
        const settings = mode === "reset" ? {} : buildSettings();
        const result = await scanTopWallets(mode, settings);
        clearInterval(interval);
        setScanProgress(100);

        if (result?.wallets) setWallets(result.wallets.map(normalizeWallet));
        if (result?.state) setScanState(result.state);
        if (result?.diagnostics) setDiagnostics(result.diagnostics);

        setScanPhase("complete");
        setTimeout(() => setScanPhase("idle"), 4000);
      } catch (e: any) {
        clearInterval(interval);
        console.error("Scan failed:", e);
        setScanError(e?.message || "Scan failed.");
        setScanPhase("error");
        setScanProgress(0);
        setTimeout(() => setScanPhase("idle"), 6000);
      }
    },
    [buildSettings]
  );

  // Toggle watch
  const toggleWatch = useCallback((address: string) => {
    setWallets((prev) => {
      const updated = prev.map((w) =>
        w.address === address ? { ...w, watched: !w.watched } : w
      );
      const wallet = updated.find((w) => w.address === address);
      if (wallet) toggleScanWatch(address, wallet.watched).catch(console.error);
      return updated;
    });
  }, []);

  // Wallet lookup
  useEffect(() => {
    if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
    setLookupResult(null);
    setLookupTracked(false);

    const s = search.trim().toLowerCase();
    if (s.startsWith("0x") && s.length >= 10) {
      setLookupLoading(true);
      lookupTimeoutRef.current = setTimeout(() => {
        lookupWallet(s)
          .then((data) => { setLookupResult(data); setLookupLoading(false); })
          .catch(() => { setLookupLoading(false); });
      }, 400);
    } else {
      setLookupLoading(false);
    }
  }, [search]);

  const handleTrackLookup = useCallback(async () => {
    if (!lookupResult) return;
    try {
      await trackWallet(lookupResult.address, lookupResult.profileName || undefined);
      setLookupTracked(true);
    } catch (e) {
      console.error("Failed to track wallet:", e);
    }
  }, [lookupResult]);

  // Debug probe
  const handleDebugProbe = useCallback(async () => {
    setDebugLoading(true);
    try {
      const data = await debugLeaderboard("all", 3);
      setDebugData(data);
      console.log("Debug leaderboard probe:", data);
    } catch (e: any) {
      setDebugData({ error: e.message });
      console.error("Debug probe failed:", e);
    } finally {
      setDebugLoading(false);
    }
  }, []);

  // Filtering & sorting
  const filtered = wallets
    .filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (s.startsWith("0x")) return true;
        if (!w.address.toLowerCase().includes(s) && !(w.alias && w.alias.toLowerCase().includes(s))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "pnl") {
        const av = Math.abs(a.pnl);
        const bv = Math.abs(b.pnl);
        return sortDir === "desc" ? bv - av : av - bv;
      }
      const key = sortBy as keyof WalletData;
      const av = (a[key] as number) || 0;
      const bv = (b[key] as number) || 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search, sortBy, sortDir]);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  // Aggregates
  const topPnl = wallets.length > 0 ? Math.max(...wallets.map((w) => w.pnl)) : 0;
  const totalProfit = wallets.filter((w) => w.pnl > 0).reduce((s, w) => s + w.pnl, 0);
  const recCount = wallets.filter((w) => w.status === "recommended").length;
  const watchCount = wallets.filter((w) => w.status === "watch").length;

  const columns = [
    { key: "rank", label: "#", className: "text-center w-12" },
    { key: "score", label: "Score", className: "text-center w-16" },
    { key: "address", label: "Wallet", className: "text-left min-w-[160px]" },
    { key: "pnl", label: "PNL", className: "text-right min-w-[100px]" },
    { key: "pnlPct", label: "ROI%", className: "text-right hidden md:table-cell" },
    { key: "totalNotional", label: "Volume", className: "text-right hidden md:table-cell" },
    { key: "avgTrade", label: "Avg Order", className: "text-right hidden lg:table-cell" },
    { key: "totalTrades", label: "Trades", className: "text-right hidden lg:table-cell" },
    { key: "lastTraded", label: "Last Trade", className: "text-right hidden xl:table-cell" },
    { key: "action", label: "", className: "text-center w-24" },
  ];

  const sortableKeys = new Set(["pnl", "pnlPct", "score", "totalTrades", "totalNotional", "avgTrade", "lastTraded"]);

  return (
    <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-8 pb-16 pt-6 flex flex-col gap-5">
      <InDevelopment />
      {/* Metric Cards */}
      <div className="flex flex-wrap gap-3">
        <MetricCard
          icon={<TrendingUp size={14} />}
          label="Top PNL"
          value={topPnl > 0 ? `+${formatUSD(topPnl)}` : "\u2014"}
          sub="Highest earner in pool"
        />
        <MetricCard
          icon={<DollarSign size={14} />}
          label="Total Profits"
          value={totalProfit > 0 ? formatUSD(totalProfit) : "\u2014"}
          sub="Sum of profitable wallets"
        />
        <MetricCard
          icon={<Star size={14} />}
          label="Recommended"
          value={recCount.toString()}
          sub="Multi-period top performers"
        />
        <MetricCard
          icon={<Users size={14} />}
          label="Pool Size"
          value={scanState?.totalCandidates?.toLocaleString() || wallets.length.toLocaleString()}
          sub="Unique wallets discovered"
        />
      </div>

      {/* Scan Engine Panel */}
      <ScanEnginePanel
        state={scanState}
        scanPhase={scanPhase}
        scanProgress={scanProgress}
        onScan={() => handleScan("scan")}
        onReset={() => handleScan("reset")}
        diagnostics={diagnostics}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onApply={() => handleScan("scan")}
            onReset={() => setFilters(defaultFilters)}
            scanning={scanPhase === "scanning"}
          />
        )}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {scanPhase === "error" && scanError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/[0.08] backdrop-blur-xl border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <X size={16} className="text-red-400 shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-xs font-mono text-red-400 tracking-widest uppercase">Scan Failed</span>
              <span className="text-[10px] font-mono text-white/40 mt-0.5">{scanError}</span>
            </div>
            <button
              onClick={() => { setScanPhase("idle"); setScanError(null); }}
              className="text-[10px] font-mono text-white/30 hover:text-white transition-colors px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {scanPhase === "complete" && diagnostics && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-500/[0.06] backdrop-blur-xl border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">Scan Complete</span>
              <span className="text-[10px] font-mono text-white/40 mt-0.5">
                +{diagnostics.newThisScan} new · {diagnostics.repeatedThisScan} updated ·
                {" "}Periods: {diagnostics.periodsQueried.join(", ") || "none"} ·
                {" "}Pool: {scanState?.totalCandidates || 0} · Filtered: {scanState?.filteredCount || wallets.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && wallets.length === 0 && scanPhase !== "scanning" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl"
            />
            <div className="relative w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <Trophy size={32} className="text-cyan-400/40" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-sm font-mono text-white/60 tracking-widest uppercase">
              PNL Leaderboard Scanner
            </h3>
            <p className="text-[11px] font-mono text-white/30 max-w-lg text-center leading-relaxed">
              Scans Polymarket's <span className="text-cyan-400/60">/v1/leaderboard</span> API to discover top PNL wallets across all-time, monthly, weekly, and daily periods.
              Each scan fetches the next page ranked by PNL or VOL. Click <span className="text-cyan-400/60">View More</span> on any wallet to load trades + closed-positions enrichment.
            </p>
          </div>

          <div className="w-full max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Paste a 0x address to look up any trader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-500/30 backdrop-blur-xl transition-colors"
            />
            <LookupDropdown
              search={search}
              lookupLoading={lookupLoading}
              lookupResult={lookupResult}
              lookupTracked={lookupTracked}
              onTrack={handleTrackLookup}
              onInspect={(addr) => setInspectWallet(addr)}
            />
          </div>

          <button
            onClick={() => handleScan("scan")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase hover:from-cyan-500/25 hover:to-cyan-500/10 hover:shadow-[0_0_32px_rgba(6,182,212,0.3)] transition-all"
          >
            <Scan size={16} />
            Scan Top PNL Wallets
          </button>

          {/* Debug probe */}
          <div className="flex flex-col items-center gap-3 w-full max-w-2xl">
            <button
              onClick={handleDebugProbe}
              disabled={debugLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-mono text-white/30 hover:text-amber-400 hover:border-amber-500/20 transition-all disabled:opacity-30"
            >
              {debugLoading ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
              Debug: Probe /v1/leaderboard
            </button>
            {debugData && (
              <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 overflow-x-auto">
                <pre className="text-[9px] font-mono text-white/50 whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && wallets.length === 0 && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={18} className="animate-spin text-cyan-400/40" />
          <span className="text-xs font-mono text-white/30">Loading scan data...</span>
        </div>
      )}

      {/* Table */}
      {wallets.length > 0 && (
        <>
          {/* Search + filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search address or alias... (paste 0x to lookup)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white/80 placeholder:text-white/25 outline-none focus:border-cyan-500/30 backdrop-blur-xl transition-colors"
              />
              <LookupDropdown
                search={search}
                lookupLoading={lookupLoading}
                lookupResult={lookupResult}
                lookupTracked={lookupTracked}
                onTrack={handleTrackLookup}
                onInspect={(addr) => setInspectWallet(addr)}
              />
            </div>
            
            <span className="text-[10px] font-mono text-white/25 tracking-widest">
              {filtered.length} results
            </span>
          </div>

          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => sortableKeys.has(col.key) ? handleSort(col.key) : undefined}
                        className={`px-4 py-3 text-[9px] tracking-widest uppercase text-white/30 font-normal ${col.className || ""} ${
                          sortableKeys.has(col.key) ? "cursor-pointer hover:text-white/50 select-none" : ""
                        }`}
                      >
                        <span className="flex items-center gap-1 justify-inherit">
                          {col.label}
                          {sortBy === col.key && (
                            <ChevronDown size={10} className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((w, idx) => (
                    <tr
                      key={w.address}
                      className="border-b border-white/[0.03] hover:bg-white/[0.04] cursor-pointer transition-colors group"
                      onClick={() => setInspectWallet(w.address)}
                    >
                      <td className="px-4 py-3 text-center text-white/25">
                        {w.rank > 0 ? `#${w.rank}` : page * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] ${
                          w.score >= 60 ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                            : w.score >= 40 ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                              : "bg-white/5 border-white/10 text-white/40"
                        } border`}>
                          {w.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white/90 shrink-0"
                            style={{ background: w.avatar }}
                          >
                            {w.address.slice(2, 4).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white/70 group-hover:text-white/90 transition-colors truncate">
                                {w.alias || `${w.address.slice(0, 6)}...${w.address.slice(-4)}`}
                              </span>
                              {w.verifiedBadge && <Shield size={10} className="text-cyan-400/60 shrink-0" />}
                            </div>
                            <span className="text-[8px] text-white/15 truncate">{w.address}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(w.address);
                              setCopiedAddr(w.address);
                              setTimeout(() => setCopiedAddr(null), 1500);
                            }}
                            className="p-1 rounded border border-transparent text-white/15 hover:text-cyan-400 hover:border-cyan-500/20 transition-all shrink-0"
                            title="Copy address"
                          >
                            {copiedAddr === w.address ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`flex items-center justify-end gap-1 font-semibold ${w.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {w.pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {w.pnl >= 0 ? "+" : ""}{formatUSD(w.pnl)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={`${w.pnlPct >= 0 ? "text-emerald-400/60" : "text-red-400/60"}`}>
                          {w.pnlPct >= 0 ? "+" : ""}{w.pnlPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white/50 hidden md:table-cell">
                        {formatUSD(w.totalNotional)}
                      </td>
                      <td className="px-4 py-3 text-right text-white/50 hidden lg:table-cell">
                        {w.avgTrade > 0 ? formatUSD(w.avgTrade) : <span className="text-white/15">---</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-white/50 hidden lg:table-cell">
                        {w.totalTrades > 0 ? w.totalTrades.toLocaleString() : <span className="text-white/15">---</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-white/40 hidden xl:table-cell text-xs">
                        {w.lastTraded ? formatRelativeDate(w.lastTraded) : <span className="text-white/15">---</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setInspectWallet(w.address); }}
                            className="p-1.5 rounded-full border bg-white/[0.02] border-white/10 text-white/20 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                            title="View More"
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWatch(w.address); }}
                            className={`p-1.5 rounded-full border transition-all ${
                              w.watched
                                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                                : "bg-white/[0.02] border-white/10 text-white/20 hover:text-white/50 hover:border-white/20"
                            }`}
                            title={w.watched ? "Remove from watchlist" : "Add to watchlist"}
                          >
                            {w.watched ? <Check size={11} /> : <Plus size={11} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageData.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center text-white/20 text-sm">
                        {wallets.length > 0
                          ? "No wallets match your current filters."
                          : "No wallets discovered yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 7) {
                  if (i < 3) pageNum = i;
                  else if (i === 3) pageNum = Math.max(3, Math.min(page, totalPages - 4));
                  else pageNum = totalPages - (7 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-mono transition-all border ${
                      page === pageNum
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                        : "border-white/5 text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Inspect Modal */}
      <AnimatePresence>
        {inspectWallet !== null &&
          wallets.find((w) => w.address === inspectWallet) && (
            <InspectModal
              wallet={wallets.find((w) => w.address === inspectWallet)!}
              onClose={() => setInspectWallet(null)}
              isWatched={wallets.find((w) => w.address === inspectWallet)!.watched}
              onToggleWatch={() => toggleWatch(inspectWallet)}
            />
          )}
      </AnimatePresence>
    </main>
  );
}

// ─── Lookup Dropdown ───────────────────────────────────────────────────

function LookupDropdown({
  search,
  lookupLoading,
  lookupResult,
  lookupTracked,
  onTrack,
  onInspect,
}: {
  search: string;
  lookupLoading: boolean;
  lookupResult: any;
  lookupTracked: boolean;
  onTrack: () => void;
  onInspect: (addr: string) => void;
}) {
  const s = search.trim().toLowerCase();
  if (!s.startsWith("0x") || s.length < 10) return null;
  if (!lookupLoading && !lookupResult) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
      >
        {lookupLoading ? (
          <div className="flex items-center gap-2 px-4 py-3">
            <Loader2 size={12} className="animate-spin text-cyan-400" />
            <span className="text-[10px] font-mono text-white/40">Looking up wallet...</span>
          </div>
        ) : lookupResult ? (
          <div className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white/90 shrink-0"
              style={{ background: lookupResult.avatar }}
            >
              {lookupResult.address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-white/80 truncate">
                  {lookupResult.profileName || `${lookupResult.address.slice(0, 8)}...${lookupResult.address.slice(-6)}`}
                </span>
                {lookupResult.verified && <Shield size={10} className="text-cyan-400" />}
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/35">
                {lookupResult.pnl !== 0 && (
                  <span className={lookupResult.pnl > 0 ? "text-emerald-400/70" : "text-red-400/70"}>
                    PNL: {formatUSD(lookupResult.pnl)}
                  </span>
                )}
                {lookupResult.volume > 0 && <span>Vol: {formatUSD(lookupResult.volume)}</span>}
                <span>Score: {lookupResult.score}</span>
                {lookupResult.onLeaderboard && (
                  <span className="text-cyan-400/70 flex items-center gap-0.5">
                    <Trophy size={8} /> On LB
                  </span>
                )}
                {lookupResult.isActive && (
                  <span className="text-emerald-400/70 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onInspect(lookupResult.address); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[9px] font-mono text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
              >
                <Eye size={11} />
                Inspect
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onTrack(); }}
                disabled={lookupTracked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-mono transition-all ${
                  lookupTracked
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                }`}
              >
                {lookupTracked ? <Check size={11} /> : <Plus size={11} />}
                {lookupTracked ? "Added" : "Track"}
              </button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Normalize Wallet ──────────────────────────────────────────────────

function normalizeWallet(wallet: any): WalletData {
  return {
    id: wallet.id || 0,
    address: wallet.address || "",
    alias: wallet.alias || null,
    profileImage: wallet.profileImage || null,
    xUsername: wallet.xUsername || null,
    verifiedBadge: wallet.verifiedBadge || false,
    status: wallet.status || "scored",
    // Support both v4 (windowsSeen) and v5 (periodsSeen) field names
    periodsSeen: wallet.periodsSeen || wallet.windowsSeen || [],
    pnl: wallet.pnl || 0,
    pnlPct: wallet.pnlPct || 0,
    totalNotional: wallet.totalNotional || 0,
    totalTrades: wallet.totalTrades || 0,
    marketsTraded: wallet.marketsTraded || 0,
    avgTrade: wallet.avgTrade || 0,
    score: wallet.score || 0,
    watched: wallet.watched || false,
    rank: wallet.rank || 0,
    bestPeriod: wallet.bestPeriod || wallet.bestWindow || "all",
    avatar: wallet.avatar || "",
    scannedAt: wallet.scannedAt || undefined,
    detailLoaded: wallet.detailLoaded || false,
    _source: wallet._source || undefined,
    _enriched: wallet._enriched || false,
  };
}
