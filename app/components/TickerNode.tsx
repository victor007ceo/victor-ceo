import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type TickerNodeProps = {
  symbol: string;
  dir: "UP" | "DOWN";
  title: string;
  data15m: number;
  data1h: number;
  data24h: number;
};

// Mock chart data
const generateData = (isUp: boolean) => 
  Array.from({ length: 20 }, (_, i) => ({
    time: i,
    val: isUp ? Math.random() * 5 + i * 0.5 : Math.random() * 5 - i * 0.5,
  }));

export function TickerNode({ symbol, dir, title, data15m, data1h, data24h }: TickerNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUp = dir === "UP";
  
  const baseColorClass = isUp 
    ? "border-green-400/50 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" 
    : "border-red-500/50 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    
  const chartData = generateData(isUp);
  const themeColor = isUp ? "#4ade80" : "#ef4444";

  return (
    <span 
      className="relative inline-flex items-center justify-center cursor-pointer mx-1.5 align-middle z-20 top-[-2px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span 
        initial={false}
        animate={{
          backgroundColor: isHovered 
            ? (isUp ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)') 
            : (isUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
          color: isHovered ? '#ffffff' : (isUp ? '#4ade80' : '#ef4444')
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium shadow-sm ${baseColorClass}`}
      >
        {symbol} {dir}
      </motion.span>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[280px] z-50 pointer-events-none"
          >
            {/* Holographic Projection Tooltip */}
            <div className="relative bg-[#06080d]/80 backdrop-blur-2xl border border-white/20 rounded-xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.05)]">
              {/* Glow border effect */}
              <div className={`absolute inset-0 rounded-xl border ${isUp ? 'border-green-400/20 shadow-[inset_0_0_15px_rgba(74,222,128,0.1)]' : 'border-red-400/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]'} pointer-events-none`} />
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-mono font-medium tracking-widest text-sm">{symbol}</h4>
                  <p className="text-white/50 text-xs mt-0.5">{title}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isUp ? 'text-green-300 border-green-400/30 bg-green-500/10' : 'text-red-300 border-red-400/30 bg-red-500/10'}`}>
                  {dir}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <Metric label="15M" val={data15m} />
                <Metric label="1H" val={data1h} />
                <Metric label="24H" val={data24h} />
              </div>

              <div className="h-12 w-full mt-2 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke={themeColor} fillOpacity={1} fill={`url(#grad-${symbol})`} strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Connector line */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-3 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function Metric({ label, val }: { label: string, val: number }) {
  const isPos = val >= 0;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-white/40 font-mono mb-0.5">{label}</span>
      <span className={`text-xs font-mono ${isPos ? 'text-green-400' : 'text-red-400'}`}>
        {isPos ? '+' : ''}{val.toFixed(1)}%
      </span>
    </div>
  );
}
