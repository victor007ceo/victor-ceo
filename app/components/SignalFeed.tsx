import { motion, AnimatePresence } from "motion/react";
import { TickerNode } from "./TickerNode";
import { Activity, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSignals } from "../api";

export function SignalFeed() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [liveMarkets, setLiveMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveMarkets(data.slice(0, 6));
        }
      })
      .catch((e) => console.error("SignalFeed fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  // Map live markets to asset-like display
  const assets = liveMarkets.length > 0
    ? liveMarkets.slice(0, 2).map((m) => ({
        symbol: (m.category || "MKT").slice(0, 4).toUpperCase(),
        name: m.question?.slice(0, 40) || "Market",
        thesis: m.description?.slice(0, 120) || `Volume: $${Math.round(m.volume || 0).toLocaleString()}. Liquidity: $${Math.round(m.liquidity || 0).toLocaleString()}.`,
        signal: m.yesPrice > 0.5 ? "UP" : "DOWN",
        strength: m.strength || "Medium",
        type: m.category || "General",
        metrics: {
          m15: Math.round((m.yesPrice - 0.5) * 200 * 10) / 10,
          h1: Math.round((m.yesPrice - 0.5) * 100 * 10) / 10,
          h24: Math.round((m.yesPrice - 0.5) * 300 * 10) / 10,
        },
      }))
    : [
      { 
        symbol: "USO", 
        name: "United States Oil Fund",
        thesis: "Oil-risk premium usually rises when Middle East supply risk intensifies.",
        signal: "UP",
        strength: "Medium-High",
        type: "Secondary",
        metrics: { m15: -0.3, h1: 0.4, h24: 5.9 }
      },
      { 
        symbol: "XLE", 
        name: "Energy Select Sector SPDR",
        thesis: "Energy equities often benefit when crude and geopolitical risk move higher.",
        signal: "UP",
        strength: "Medium-High",
        type: "Secondary",
        metrics: { m15: 0.1, h1: -0.0, h24: 1.7 }
      }
    ];

  // Derive headline from top live market
  const headline = liveMarkets[0]?.question || "cbsnews.com: Jim Himes Trump Lying Iran Negotiations";
  const source = liveMarkets[0]?.category || "cbsnews.com";
  const severity = liveMarkets[0]?.strength === "Critical" ? "CRITICAL" : liveMarkets[0]?.strength === "High" ? "HIGH" : "MEDIUM";
  const severityColor = severity === "CRITICAL" ? "red" : severity === "HIGH" ? "cyan" : "amber";

  return (
    <div className="flex-1 w-full max-w-none lg:max-w-[800px] xl:max-w-[900px]">
      <motion.div
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="hover"
        variants={{
          hidden: { opacity: 0, x: -20, scale: 1 },
          visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.1 } },
          hover: { scale: 1.015, transition: { duration: 1.7, ease: "easeInOut" } }
        }}
        className="relative rounded-[3rem] z-10 cursor-pointer"
      >
        {/* Animated Hover Border Effect (Circling light blue once with S-curve) */}
        <div 
          className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none z-20"
          style={{ padding: '1.5px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'destination-out' }}
        >
           <motion.div 
             variants={{
               hidden: { rotate: 0, opacity: 0 },
               visible: { rotate: 0, opacity: 0 },
               hover: { 
                 rotate: [0, 360],
                 opacity: [0, 1, 1, 0],
                 transition: { 
                   duration: 1.7, 
                   ease: "easeInOut",
                   times: [0, 0.1, 0.9, 1]
                 }
               }
             }}
             className="absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2" 
             style={{ backgroundImage: "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(34, 211, 238, 1) 360deg)" }}
           />
        </div>

        {/* Main Inner Card - Glassmorphism */}
        <div className={`relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 overflow-hidden ${isExpanded ? 'h-full rounded-[3rem] p-8 lg:p-10' : 'h-auto rounded-[3rem] p-4 px-6 lg:p-6 lg:px-8'}`}>
          
          {/* Fills up with tint after the border spin */}
          <motion.div
             variants={{
               hidden: { opacity: 0 },
               visible: { opacity: 0 },
               hover: { opacity: 1, transition: { delay: 0.6, duration: 0.4, ease: "easeOut" } }
             }}
             className="absolute inset-0 bg-cyan-500/[0.04] pointer-events-none rounded-[3rem]"
          />

          {/* Subtle glowing edge */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent pointer-events-none" />
          
          <div className={`flex justify-between items-center transition-all duration-300 ${isExpanded ? 'mb-6' : 'mb-0'}`}>
            <div className="flex items-center gap-3">
              <span className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] line-clamp-1">{source}</span>
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              <span className="text-white/30 font-mono text-[10px] uppercase shrink-0">{loading ? "Loading..." : "Live"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-widest uppercase hidden sm:block ${
                severity === "CRITICAL" ? "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]" :
                severity === "HIGH" ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" :
                "border-amber-500/40 bg-amber-500/10 text-amber-400"
              }`}>
                {severity}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center bg-transparent shrink-0"
              >
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown size={16} />
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: { height: "auto", opacity: 1, transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3, delay: 0.1 } } },
                  hidden: { height: 0, opacity: 0, transition: { height: { duration: 0.4, ease: "easeInOut" }, opacity: { duration: 0.2 } } }
                }}
                className="overflow-hidden"
              >
                <h1 className="text-3xl lg:text-4xl font-light text-white mb-8 leading-tight tracking-tight drop-shadow-md">
                  {headline}
                </h1>

                <div className="space-y-8 text-lg text-white/80 font-light leading-relaxed">
                  <div className="inline-block">
                    Geopolitical tensions around the Strait of Hormuz are intensifying as Iran maintains leverage over global energy supplies following failed negotiations. Most direct read-through: 
                    <TickerNode symbol="USO" dir="UP" title="United States Oil Fund" data15m={-0.3} data1h={0.4} data24h={5.9} /> ,
                    <TickerNode symbol="XLE" dir="UP" title="Energy Select Sector SPDR" data15m={0.1} data1h={-0.0} data24h={1.7} /> ,
                    <TickerNode symbol="GLD" dir="UP" title="SPDR Gold Trust" data15m={0.2} data1h={0.5} data24h={2.1} /> ,
                    <TickerNode symbol="ITA" dir="UP" title="iShares U.S. Aerospace & Defense ETF" data15m={0.5} data1h={1.1} data24h={3.4} /> and
                    <TickerNode symbol="SPY" dir="DOWN" title="SPDR S&P 500 ETF Trust" data15m={-0.5} data1h={-1.2} data24h={-2.4} />.
                  </div>

                  <div className="border-t border-white/5 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">AI Generated Summary</span>
                       <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors">
                         SHOW LESS
                       </button>
                    </div>
                    
                    <div className="font-sans text-[15px] font-medium text-white/90 leading-relaxed tracking-wide drop-shadow-sm">
                      "Critical Political Development: 1 source converging on the development around this event. The latest coverage came at 2026-03-29T20:00:00Z. Market transmission looks clearest through Energy and Defense sectors as conflict risk premium escalates."
                    </div>
                  </div>
                </div>

                {/* Affected Assets Horizon */}
                <div className="mt-14 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Activity size={14} className="text-cyan-500/80" />
                       Top Affected Assets
                    </span>
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Updated 3m ago</span>
                  </div>

                  <div className="space-y-2">
                    {assets.map((asset, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="group relative flex flex-col md:flex-row gap-2 md:gap-4 md:items-center py-6 px-2 md:px-5 md:-mx-5 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-white/10"
                      >
                         <div className="w-full md:w-48 shrink-0 mb-3 md:mb-0">
                           <h4 className="text-white text-xl font-semibold tracking-wide mb-1.5">{asset.symbol}</h4>
                           <p className="text-white/40 text-[13px] font-medium tracking-wide">{asset.name}</p>
                         </div>
                         
                         <div className="flex-1 hidden md:block">
                           <p className="text-white/60 text-sm font-light leading-snug pr-8">{asset.thesis}</p>
                         </div>
                         
                         <div className="flex items-end justify-between md:justify-start gap-4 md:gap-12 w-full md:w-auto mt-4 md:mt-0">
                           <div className="flex flex-col gap-2.5 min-w-[100px]">
                             <span className={`inline-flex px-2.5 py-1.5 rounded-[4px] text-[10px] font-mono font-medium self-start tracking-wide ${asset.signal === 'UP' ? 'bg-[#0f291e]/80 text-[#22c55e] border border-[#1b4332]' : 'bg-[#2a1215]/80 text-[#ef4444] border border-[#451a1e]'}`}>
                               {asset.signal} <span className={`mx-1.5 ${asset.signal === 'UP' ? 'text-[#22c55e]/50' : 'text-[#ef4444]/50'}`}>•</span> {asset.strength}
                             </span>
                             <span className="text-[9px] text-white/30 uppercase tracking-[0.15em] font-sans font-bold">{asset.type}</span>
                           </div>

                           {/* Fluid timeline numbers instead of grid */}
                           <div className="flex items-center gap-6 sm:gap-8 pb-1">
                             <AssetMetric label="15M" value={asset.metrics.m15} />
                             <AssetMetric label="1H" value={asset.metrics.h1} />
                             <AssetMetric label="24H" value={asset.metrics.h24} />
                           </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function AssetMetric({ label, value }: { label: string, value: number }) {
  const isPos = value >= 0;
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-[10px] text-white/40 font-mono tracking-[0.1em] font-medium mb-1.5">{label}</span>
      <span className={`text-[13px] font-mono tracking-tight font-medium drop-shadow-md ${isPos ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {isPos ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
}