import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, TrendingUp, TrendingDown, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPrices } from "../api";

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 40},${15 - ((d - min) / range) * 15}`).join(" ");
  return (
    <svg width="40" height="15" viewBox="0 0 40 15" fill="none" className="overflow-visible">
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M 0 15 L ${points} L 40 15 Z`} fill={`url(#gradient-${color})`} opacity="0.2" />
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export function PocketTerminal() {
  const topRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const [liveMarkets, setLiveMarkets] = useState<any[]>([]);

  useEffect(() => {
    fetchPrices()
      .then((data) => {
        if (Array.isArray(data)) setLiveMarkets(data);
      })
      .catch((e) => console.error("PocketTerminal fetch error:", e));
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // Use live market data if available, fallback to mock
  const topMovers = liveMarkets.length > 0
    ? liveMarkets.slice(0, 7).map((m, i) => {
        let yesPrice = 0.5;
        try {
          const prices = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          if (Array.isArray(prices)) yesPrice = parseFloat(prices[0]) || 0.5;
        } catch (_) {}
        const pctChange = Math.round((yesPrice - 0.5) * 200 * 10) / 10;
        const up = pctChange >= 0;
        return {
          sym: (m.category || m.slug || "MKT").slice(0, 5).toUpperCase(),
          name: (m.question || "Market").slice(0, 20),
          val: `${up ? "+" : ""}${pctChange.toFixed(1)}%`,
          spark: Array.from({ length: 7 }, (_, j) => Math.round(yesPrice * 100 + (Math.random() - 0.5) * 10 * (j + 1))),
          up,
        };
      })
    : [
        { sym: "NVDA", name: "NVIDIA Corp.", val: "+8.4%", spark: [5, 6, 5, 8, 12, 10, 15], up: true },
        { sym: "USO", name: "US Oil Fund", val: "+5.9%", spark: [2, 3, 4, 7, 8, 10, 12], up: true },
        { sym: "LMT", name: "Lockheed Martin", val: "+4.1%", spark: [4, 5, 4, 6, 7, 9, 11], up: true },
        { sym: "SPY", name: "SPDR S&P 500", val: "-2.4%", spark: [15, 12, 14, 10, 8, 5, 2], up: false },
        { sym: "QQQ", name: "Invesco QQQ", val: "-1.8%", spark: [12, 11, 13, 9, 7, 6, 4], up: false },
        { sym: "META", name: "Meta Platforms", val: "+2.2%", spark: [6, 7, 8, 7, 9, 11, 12], up: true },
        { sym: "MSFT", name: "Microsoft", val: "+1.1%", spark: [4, 5, 6, 5, 7, 8, 9], up: true },
      ];

  const recentMovers = liveMarkets.length > 7
    ? liveMarkets.slice(7, 14).map((m) => {
        let yesPrice = 0.5;
        try {
          const prices = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          if (Array.isArray(prices)) yesPrice = parseFloat(prices[0]) || 0.5;
        } catch (_) {}
        const pctChange = Math.round((yesPrice - 0.5) * 200 * 10) / 10;
        const up = pctChange >= 0;
        return {
          sym: (m.category || m.slug || "MKT").slice(0, 5).toUpperCase(),
          name: (m.question || "Market").slice(0, 20),
          val: `${up ? "+" : ""}${pctChange.toFixed(1)}%`,
          spark: Array.from({ length: 7 }, (_, j) => Math.round(yesPrice * 100 + (Math.random() - 0.5) * 10 * (j + 1))),
          up,
        };
      })
    : [
        { sym: "AAPL", name: "Apple Inc.", val: "-1.2%", spark: [10, 12, 11, 9, 8, 7, 6], up: false },
        { sym: "XLE", name: "Energy Select", val: "+1.7%", spark: [4, 4, 5, 6, 8, 7, 9], up: true },
        { sym: "GLD", name: "SPDR Gold", val: "+2.1%", spark: [5, 6, 7, 7, 8, 10, 11], up: true },
        { sym: "ITA", name: "US Aerospace", val: "+3.4%", spark: [3, 4, 4, 6, 8, 9, 10], up: true },
        { sym: "TSLA", name: "Tesla Inc.", val: "-3.1%", spark: [15, 13, 12, 9, 8, 6, 3], up: false },
        { sym: "AMD", name: "Adv. Micro", val: "+4.5%", spark: [3, 4, 6, 8, 10, 12, 14], up: true },
        { sym: "VIX", name: "Volatility", val: "+12.4%", spark: [2, 3, 5, 8, 12, 15, 20], up: true },
      ];

  return (
    <div className="w-full bg-white/[0.03] backdrop-blur-xl border-b border-white/10 shadow-2xl relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex flex-col gap-3"
      >
        
        {/* Row 1: Top Movers */}
        <div className="flex items-center gap-2 group w-full">
          <div className="flex items-center justify-center md:justify-start gap-2 w-8 md:w-32 shrink-0">
            <TrendingUp size={12} className="text-cyan-400" />
            <span className="hidden md:inline text-[10px] font-mono text-cyan-400/80 tracking-[0.2em] uppercase">Top Movers</span>
          </div>
          <button onClick={() => scroll(topRef, 'left')} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shrink-0">
            <ChevronLeft size={14} />
          </button>
          
          <div 
            className="flex-1 relative overflow-hidden flex"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 32px), transparent)', 
              WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black 16px, black calc(100% - 32px), transparent)' 
            }}
          >
            <div 
              ref={topRef} 
              className="flex-1 flex items-center gap-6 overflow-x-auto scroll-smooth px-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topMovers.map((sig, i) => (
                <div key={i} className="flex items-center gap-3 min-w-max group/item cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-xs font-sans font-bold text-white/90">{sig.sym}</span>
                    <span className="text-[9px] text-white/40 font-mono uppercase">{sig.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className={`text-[11px] font-mono font-medium ${sig.up ? 'text-green-400 shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'text-red-400 shadow-[0_0_8px_rgba(248,113,113,0.2)]'}`}>
                      {sig.val}
                    </span>
                    <Sparkline data={sig.spark} color={sig.up ? '#4ade80' : '#f87171'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={() => scroll(topRef, 'right')} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shrink-0">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Row 2: Recent Movers */}
        <div className="flex items-center gap-2 group w-full">
          <div className="flex items-center justify-center md:justify-start gap-2 w-8 md:w-32 shrink-0">
            <Clock size={12} className="text-purple-400" />
            <span className="hidden md:inline text-[10px] font-mono text-purple-400/80 tracking-[0.2em] uppercase">Recent Movers</span>
          </div>
          <button onClick={() => scroll(recentRef, 'left')} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shrink-0">
            <ChevronLeft size={14} />
          </button>
          
          <div 
            className="flex-1 relative overflow-hidden flex"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 32px), transparent)', 
              WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black 16px, black calc(100% - 32px), transparent)' 
            }}
          >
            <div 
              ref={recentRef} 
              className="flex-1 flex items-center gap-6 overflow-x-auto scroll-smooth px-4 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentMovers.map((sig, i) => (
                <div key={i} className="flex items-center gap-3 min-w-max group/item cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-xs font-sans font-bold text-white/90">{sig.sym}</span>
                    <span className="text-[9px] text-white/40 font-mono uppercase">{sig.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className={`text-[11px] font-mono font-medium ${sig.up ? 'text-green-400 shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'text-red-400 shadow-[0_0_8px_rgba(248,113,113,0.2)]'}`}>
                      {sig.val}
                    </span>
                    <Sparkline data={sig.spark} color={sig.up ? '#4ade80' : '#f87171'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={() => scroll(recentRef, 'right')} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shrink-0">
            <ChevronRight size={14} />
          </button>
        </div>

      </motion.div>
    </div>
  );
}