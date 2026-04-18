import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Shield, Zap, AlertTriangle, Radio, Eye, Lock,
  ChevronRight, Activity,
} from "lucide-react";
import { getExecutionStatus } from "../api";

// ═══════════════════════════════════════════════════════════════════════
// SYSTEM STATUS BAR
// ═══════════════════════════════════════════════════════════════════════
//
// Unified execution mode indicator shown across Watchlist and Execution
// pages. Computes a 5-tier execution mode from backend state:
//
//   OFF              — all copy trading disabled
//   PAPER            — paper copy trading active (Stage 1)
//   REAL_DISABLED    — real scaffolding exists, live off (Stage 2)
//   REAL_READY       — all preflight checks pass, awaiting enable
//   REAL_ACTIVE      — live execution enabled (future Stage 3)
//
// Also shows: staged rollout progress, kill switch, data provenance key

export type SystemMode =
  | "OFF"
  | "PAPER"
  | "REAL_DISABLED"
  | "REAL_READY"
  | "REAL_ACTIVE";

const MODE_CONFIG: Record<SystemMode, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; description: string;
}> = {
  OFF: {
    label: "OFF", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20",
    icon: <Lock size={10} />, description: "All copy trading disabled",
  },
  PAPER: {
    label: "PAPER", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
    icon: <Activity size={10} />, description: "Paper copy trading active",
  },
  REAL_DISABLED: {
    label: "REAL (OFF)", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    icon: <Eye size={10} />, description: "Real scaffolding built, live disabled",
  },
  REAL_READY: {
    label: "REAL READY", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    icon: <Shield size={10} />, description: "All preflight checks pass — ready to enable",
  },
  REAL_ACTIVE: {
    label: "LIVE", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20",
    icon: <Zap size={10} />, description: "Live execution ACTIVE",
  },
};

// ─── Staged Rollout ────────────────────────────────────────────────────

interface StageInfo {
  id: number; label: string; status: "complete" | "active" | "future";
}

function computeMode(status: any): SystemMode {
  if (!status) return "OFF";
  if (status.killSwitch) return "OFF";
  if (!status.paperRunning && !status.dryRunReady) return "OFF";
  if (status.mode === "live" && status.liveReady) return "REAL_ACTIVE";
  if (status.liveReady) return "REAL_READY";
  if (status.mode === "dry_run" || status.dryRunReady) return "REAL_DISABLED";
  if (status.paperRunning) return "PAPER";
  return "OFF";
}

function computeStages(mode: SystemMode): StageInfo[] {
  return [
    { id: 1, label: "Paper Copy", status: mode === "OFF" ? "future" : mode === "PAPER" ? "active" : "complete" },
    { id: 2, label: "Real Scaffolding", status: ["OFF", "PAPER"].includes(mode) ? "future" : ["REAL_DISABLED", "REAL_READY"].includes(mode) ? "active" : "complete" },
    { id: 3, label: "Live Execution", status: mode === "REAL_ACTIVE" ? "active" : "future" },
  ];
}

// ─── Data Provenance Key ───────────────────────────────────────────────

function ProvenanceKey({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-cyan-500/10 border border-cyan-500/15 text-cyan-400/60">OBS</span>
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-amber-500/10 border border-amber-500/15 text-amber-400/60">SIM</span>
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-violet-500/10 border border-violet-500/15 text-violet-400/60">INF</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-cyan-500/10 border border-cyan-500/15 text-cyan-400/60">OBS</span>
        <span className="text-[8px] font-mono text-white/20">Observed on-chain / API</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-amber-500/10 border border-amber-500/15 text-amber-400/60">SIM</span>
        <span className="text-[8px] font-mono text-white/20">Simulated paper value</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-violet-500/10 border border-violet-500/15 text-violet-400/60">INF</span>
        <span className="text-[8px] font-mono text-white/20">Inferred / computed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider bg-emerald-500/10 border border-emerald-500/15 text-emerald-400/60">LIVE</span>
        <span className="text-[8px] font-mono text-white/20">Real execution (future)</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

interface SystemStatusBarProps {
  compact?: boolean;      // Compact mode for embedding in other pages
  showStages?: boolean;   // Show staged rollout progress
  showProvenance?: boolean; // Show data provenance key
}

export function SystemStatusBar({ compact = false, showStages = false, showProvenance = false }: SystemStatusBarProps) {
  const [status, setStatus] = useState<any>(null);
  const [mode, setMode] = useState<SystemMode>("OFF");

  useEffect(() => {
    let cancelled = false;
    getExecutionStatus().then((s) => {
      if (cancelled) return;
      setStatus(s);
      setMode(computeMode(s));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const cfg = MODE_CONFIG[mode];
  const stages = computeStages(mode);

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mode badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          {cfg.icon}
          <span>{cfg.label}</span>
        </div>
        {/* Kill switch warning */}
        {status?.killSwitch && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 animate-pulse">
            <AlertTriangle size={8} /> KILL SWITCH
          </span>
        )}
        {/* Provenance key */}
        {showProvenance && <ProvenanceKey compact />}
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-4">
      {/* Top row: mode + kill switch */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {cfg.icon}
            <span className="font-semibold">{cfg.label}</span>
          </div>
          <span className="text-[10px] font-mono text-white/30">{cfg.description}</span>
        </div>
        <div className="flex items-center gap-2">
          {status?.killSwitch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 animate-pulse">
              <AlertTriangle size={10} /> KILL SWITCH ACTIVE
            </span>
          )}
          {status && (
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/20">
              <Radio size={8} className={status.paperRunning ? "text-emerald-400 animate-pulse" : "text-white/15"} />
              {status.paperRunning ? "Paper running" : "Paper off"}
            </div>
          )}
        </div>
      </div>

      {/* Staged rollout */}
      {showStages && (
        <div className="flex items-center gap-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${stage.status === "future" ? "bg-white/5" : "bg-cyan-500/30"}`} />}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider border ${
                stage.status === "complete" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/70" :
                stage.status === "active" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" :
                "bg-white/[0.02] border-white/[0.06] text-white/20"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  stage.status === "complete" ? "bg-emerald-500/20 text-emerald-400" :
                  stage.status === "active" ? "bg-cyan-500/20 text-cyan-400" :
                  "bg-white/5 text-white/20"
                }`}>{stage.id}</span>
                {stage.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provenance key */}
      {showProvenance && (
        <div className="border-t border-white/[0.04] pt-3">
          <div className="text-[8px] font-mono text-white/15 uppercase tracking-widest mb-2">Data Provenance Key</div>
          <ProvenanceKey />
        </div>
      )}
    </div>
  );
}

// Re-export for use in other components
export { computeMode, computeStages, ProvenanceKey, MODE_CONFIG };
export type { StageInfo };