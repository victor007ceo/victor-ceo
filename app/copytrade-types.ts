// ═══════════════════════════════════════════════════════════════════════
// COPY TRADING DOMAIN — FOUNDATION TYPES
// ═══════════════════════════════════════════════════════════════════════
//
// This file defines the canonical type system for the copy trading domain.
// It cleanly separates: source trades, copy decisions, paper trades,
// and future real trades.
//
// Decision tiers:
//   IGNORE               — trade seen but not actionable (e.g. not watched)
//   PAPER_COPY           — copied into the paper trading sandbox
//   REAL_ELIGIBLE_DISABLED — passed all rules, but real execution is off
//   BLOCKED_BY_RULE      — failed one or more risk rules
//
// Provenance: every decision links back to the source trade via
// sourceTradeId, sourceWallet, sourceTradeTimestamp, and the full
// rationale with individual rule hits.

// ─── Decision Actions ──────────────────────────────────────────────────

export type CopyDecisionAction =
  | "IGNORE"
  | "PAPER_COPY"
  | "REAL_ELIGIBLE_DISABLED"
  | "BLOCKED_BY_RULE";

// Legacy compat — the existing engine uses COPY/SKIP
export type LegacyCopyAction = "COPY" | "SKIP";

export function toLegacyAction(action: CopyDecisionAction): LegacyCopyAction {
  return action === "PAPER_COPY" || action === "REAL_ELIGIBLE_DISABLED"
    ? "COPY"
    : "SKIP";
}

export function fromLegacyAction(
  legacyAction: LegacyCopyAction,
  reasons: string[]
): CopyDecisionAction {
  if (legacyAction === "COPY") return "PAPER_COPY";
  // If SKIP had risk-rule reasons, it's BLOCKED_BY_RULE; otherwise IGNORE
  return reasons.length > 0 ? "BLOCKED_BY_RULE" : "IGNORE";
}

// ─── Risk Rule ─────────────────────────────────────────────────────────

export interface RiskRuleHit {
  ruleId: string;         // e.g. "MIN_SCORE", "MAX_EXPOSURE_MARKET"
  ruleName: string;       // human-readable
  threshold: number | string;
  actual: number | string;
  passed: boolean;
  message: string;        // e.g. "Score 25 < min 30"
}

export const RISK_RULE_IDS = [
  "ENABLED",
  "MIN_SCORE",
  "MIN_PNL",
  "MIN_AVG_TRADE",
  "MIN_NOTIONAL",
  "MAX_COPY_DELAY",
  "MAX_EXPOSURE_MARKET",
  "MAX_EXPOSURE_WALLET",
  "COOLDOWN",
] as const;

export type RiskRuleId = (typeof RISK_RULE_IDS)[number];

// ─── Source Trade (provenance) ─────────────────────────────────────────

export interface SourceTrade {
  id: string;                    // unique id for this source trade observation
  sourceWallet: string;          // 0x address
  sourceAlias: string | null;
  sourceScore: number;
  sourcePnl: number;
  market: string;
  side: string;                  // BUY / SELL
  amount: number;
  price: number;
  notional: number;
  timestamp: number;             // epoch ms of original trade
  observedAt: number;            // epoch ms when we saw it
  _apiSource: string;            // e.g. "polymarket_activity"
}

// ─── Copy Decision ─────────────────────────────────────────────────────

export interface CopyDecision {
  id: string;
  timestamp: number;

  // Provenance — links back to the source trade
  sourceTradeId: string;         // SourceTrade.id
  sourceWallet: string;
  sourceAlias: string | null;
  sourceScore: number;
  sourcePnl: number;
  sourceTradeTimestamp: number;

  // Trade details
  market: string;
  side: string;
  sourcePrice: number;
  sourceAmount: number;
  sourceNotional: number;

  // Decision result
  action: CopyDecisionAction;
  legacyAction: LegacyCopyAction; // backward compat with existing UI/data

  // Rationale
  reasons: string[];             // human-readable reason strings
  ruleHits: RiskRuleHit[];       // structured rule evaluation results
  tradeAgeMs: number;

  // Execution mode
  executionMode: "paper" | "real" | "none";
  realExecutionEnabled: boolean; // global flag at decision time

  // Linked paper order (if any)
  paperOrderId: string | null;
}

// ─── Paper Order ───────────────────────────────────────────────────────

export interface PaperOrder {
  id: string;
  decisionId: string;            // links to CopyDecision
  sourceTradeId: string;         // links to SourceTrade
  timestamp: number;
  sourceWallet: string;
  sourceAlias: string | null;
  sourceTradeTimestamp: number;
  market: string;
  side: string;
  amount: number;
  limitPrice: number;
  fillPrice: number;
  fillNotional: number;
  slippageApplied: number;
  fillModel: string;
  status: "filled" | "cancelled" | "pending";
  _simulated: true;
}

// ─── Paper Position ────────────────────────────────────────────────────

export interface PaperPosition {
  id: string;
  posKey: string;                // composite key: wallet:market:side
  sourceWallet: string;
  sourceAlias: string | null;
  market: string;
  side: string;
  amount: number;
  avgEntryPrice: number;
  notional: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  status: "open" | "closed";
  tradeCount: number;
  firstOrderId: string;
  lastOrderId: string;
  openedAt: number;
  updatedAt: number;
  closedAt?: number;
  _simulated: true;
}

// ─── Copy Config ───────────────────────────────────────────────────────

export interface CopyConfig {
  enabled: boolean;
  realExecutionEnabled: boolean; // new: controls REAL_ELIGIBLE_DISABLED
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

// ─── Copy Summary ──────────────────────────────────────────────────────

export interface CopySummary {
  enabled: boolean;
  realExecutionEnabled: boolean;
  paperBalance: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
  totalExposure: number;
  openPositionCount: number;
  closedPositionCount: number;
  totalDecisions: number;
  paperCopyCount: number;
  realEligibleCount: number;
  blockedCount: number;
  ignoreCount: number;
  copyRate: number;
  totalOrders: number;
  uniqueWallets: number;
  uniqueMarkets: number;
}

// ─── Source Trade Link (provenance index) ──────────────────────────────

export interface SourceTradeLink {
  sourceTradeId: string;
  decisionId: string;
  paperOrderId: string | null;
  positionId: string | null;
  action: CopyDecisionAction;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════
// REAL EXECUTION DOMAIN — FOUNDATION TYPES
// ═══════════════════════════════════════════════════════════════════════

// ─── Execution Mode ────────────────────────────────────────────────────

export type ExecutionMode = "disabled" | "dry_run" | "live";
export type ExecutionModel = "model_a_managed" | "model_b_builder"; // Model A now, B future

// ─── System Mode (5-tier state machine) ────────────────────────────────
//   OFF              — all copy trading disabled
//   PAPER            — paper copy trading active (Stage 1)
//   REAL_DISABLED    — real scaffolding exists, live off (Stage 2)
//   REAL_READY       — all preflight checks pass, awaiting enable
//   REAL_ACTIVE      — live execution enabled (future Stage 3)
export type SystemMode =
  | "OFF"
  | "PAPER"
  | "REAL_DISABLED"
  | "REAL_READY"
  | "REAL_ACTIVE";

// ─── Order Types (Polymarket CLOB) ─────────────────────────────────────
// All Polymarket orders are limit orders. "Market orders" are marketable
// limits that cross the spread. Time-in-force options:
//   GTC  — Good Til Cancelled (default)
//   GTD  — Good Til Date (with expiration)
//   FOK  — Fill Or Kill (immediate full fill or cancel)
//   FAK  — Fill And Kill (partial fill OK, cancel remainder)

export type OrderTimeInForce = "GTC" | "GTD" | "FOK" | "FAK";
export type OrderSide = "BUY" | "SELL";

export interface OrderPayload {
  id: string;
  market: string;
  tokenId: string;           // CLOB token ID
  side: OrderSide;
  size: number;              // shares
  price: number;             // limit price (0-1 for binary)
  timeInForce: OrderTimeInForce;
  expiration?: number;       // epoch seconds (for GTD)
  isMarketable: boolean;     // true = crosses spread (marketable limit)
  slippageBps: number;       // basis points applied to best price
  sourceTradeId: string;     // provenance
  sourceWallet: string;
  decisionId: string;
  builtAt: number;           // epoch ms
}

// ─── Preflight Check ───────────────────────────────────────────────────

export interface PreflightCheck {
  checkId: string;
  checkName: string;
  passed: boolean;
  message: string;
  severity: "info" | "warn" | "block";
}

export const PREFLIGHT_CHECK_IDS = [
  "KILL_SWITCH",
  "LIVE_ENABLED",
  "ACCOUNT_CONFIGURED",
  "SECRET_AVAILABLE",
  "BALANCE_SUFFICIENT",
  "MAX_ORDER_SIZE",
  "MAX_DAILY_NOTIONAL",
  "MAX_MARKET_EXPOSURE",
  "MAX_WALLET_EXPOSURE",
  "MAX_SLIPPAGE",
  "MAX_TRADE_AGE",
  "ALLOWLIST",
  "DENYLIST",
] as const;

export type PreflightCheckId = (typeof PREFLIGHT_CHECK_IDS)[number];

// ─── Dry-Run Event ─────────────────────────────────────────────────────

export interface DryRunEvent {
  id: string;
  timestamp: number;
  sourceTradeId: string;
  sourceWallet: string;
  market: string;
  side: OrderSide;
  orderPayload: OrderPayload;
  preflightResults: PreflightCheck[];
  allPassed: boolean;
  wouldExecute: boolean;      // true if all checks pass and mode=live
  blockedReasons: string[];
  executionMode: ExecutionMode;
  latencyMs: number;
}

// ─── Execution Account (Model A: managed single account) ───────────────

export interface ExecutionAccount {
  id: string;
  model: ExecutionModel;
  label: string;
  walletAddress: string | null;  // public address only — no secrets client-side
  isConfigured: boolean;
  hasSecret: boolean;            // backend reports if secret is set, never the value
  createdAt: number;
  updatedAt: number;
}

// ─── Execution Settings ────────────────────────────────────────────────

export interface ExecutionSettings {
  // Master controls
  executionMode: ExecutionMode;     // disabled | dry_run | live
  killSwitch: boolean;              // true = emergency halt, overrides everything
  emergencyStopAt: number | null;   // timestamp of last emergency stop

  // Copy system toggles
  globalCopyEnabled: boolean;       // master on/off for all copy trading
  paperEnabled: boolean;            // paper trading on/off
  liveEnabled: boolean;             // real execution on/off (always false by default)

  // Risk limits
  maxTradeAgeMs: number;            // max source trade age to copy
  maxSlippageBps: number;           // max slippage in basis points
  maxOrderSizeUsd: number;          // max single order notional
  maxPerWalletExposureUsd: number;  // max exposure per source wallet
  maxPerMarketExposureUsd: number;  // max exposure per market
  maxDailyCopiedNotionalUsd: number;// daily notional cap

  // Access control
  walletAllowlist: string[];        // if non-empty, only these wallets copied
  walletDenylist: string[];         // always blocked
  marketDenylist: string[];         // markets to never trade

  // Order defaults
  defaultTimeInForce: OrderTimeInForce;
  defaultSlippageBps: number;

  // Metadata
  updatedAt: number;
}

// ─── Execution Status (readiness report) ───────────────────────────────

export interface ExecutionStatus {
  mode: ExecutionMode;
  killSwitch: boolean;
  accountConfigured: boolean;
  secretAvailable: boolean;
  liveReady: boolean;              // all prerequisites met for live
  dryRunReady: boolean;            // can run dry-run simulations
  paperRunning: boolean;
  blockers: string[];              // human-readable list of what's missing
  lastDryRunAt: number | null;
  lastEmergencyStopAt: number | null;
  dryRunCount: number;
  todayNotionalUsd: number;
}