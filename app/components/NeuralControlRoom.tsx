import { motion, AnimatePresence } from "motion/react";
import { Terminal, Cpu, Play, Pause, Archive, ChevronLeft, ChevronRight, Settings, ChevronRightSquare, ChevronLeftSquare, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSignals } from "../api";

interface Signal {
  id: string;
  question: string;
  slug: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  strength: string;
  image: string;
  endDate: string;
  description: string;
}

export function NeuralControlRoom() {
  const [activeTopicPage, setActiveTopicPage] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sources, setSources] = useState([
    { name: "Newswire", active: true },
    { name: "GDELT", active: true },
    { name: "NewsAPI", active: true },
    { name: "X/Twitter", active: true },
    { name: "Polymarket", active: false },
    { name: "Kalshi", active: false },
  ]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSignals()
      .then((data) => {
        setSignals(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error("NeuralControlRoom fetch error:", e);
        setError("Failed to load signals");
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive the active topic from the top signal
  const activeSignal = signals[0] || null;
  const activeTitle = activeSignal?.question?.slice(0, 50) || "Initializing...";
  const activeChance = activeSignal ? `${Math.round(activeSignal.yesPrice * 100)}%` : "—";

  const toggleSource = (index: number) => {
    setSources(prev => prev.map((src, i) => i === index ? { ...src, active: !src.active } : src));
  };

  // topicPages removed — now using live signals

  const nextTopicPage = () => setActiveTopicPage(prev => (prev + 1) % Math.max(1, Math.ceil(signals.length / 4)));
  const prevTopicPage = () => setActiveTopicPage(prev => (prev - 1 + Math.max(1, Math.ceil(signals.length / 4))) % Math.max(1, Math.ceil(signals.length / 4)));

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto">
      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-white/[0.03] backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 overflow-hidden ${isExpanded ? 'rounded-[3rem] p-8 lg:p-10' : 'rounded-[3rem] p-4 px-6 lg:p-6 lg:px-8'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-[3rem]" />

        <div className="flex flex-col relative z-10">
          
          <div className="flex-1 w-full">
            <div className={`flex items-center justify-between transition-all duration-300 ${isExpanded ? 'mb-3' : 'mb-0'}`}>
              <h1 className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2 shrink-0">
                <Terminal size={14} />
                Active Topic
              </h1>
              
              <div className="relative flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center bg-transparent"
                >
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full border transition-all flex items-center justify-center ${
                      showSettings ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-transparent border-white/10 text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Settings size={16} className={`${showSettings ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[#050505] border border-white/10 shadow-2xl rounded-2xl p-4 z-50 flex flex-col gap-4"
                      >
                        <span className="text-white/50 text-[10px] font-mono tracking-widest uppercase mb-1">Active Nodes</span>
                        {sources.map((src, i) => (
                          <div 
                            key={i} 
                            onClick={() => toggleSource(i)}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            <span className={`text-xs font-mono tracking-wider transition-colors ${
                              src.active ? 'text-cyan-100' : 'text-white/30 group-hover:text-white/50'
                            }`}>
                              {src.name}
                            </span>
                            <div className={`w-8 h-4 rounded-full border transition-all flex items-center p-0.5 ${
                              src.active 
                              ? 'bg-cyan-400/20 border-cyan-400/50 justify-end' 
                              : 'bg-white/5 border-white/10 justify-start'
                            }`}>
                              <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                                src.active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-white/30'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: { height: "auto", opacity: 1, marginTop: 12, transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3, delay: 0.1 } } },
                    hidden: { height: 0, opacity: 0, marginTop: 0, transition: { height: { duration: 0.4, ease: "easeInOut" }, opacity: { duration: 0.2 } } }
                  }}
                  className="overflow-hidden"
                >
                  <h2 className="text-2xl font-light text-white mb-2">{loading ? "Loading signals..." : activeTitle}</h2>
                  {activeSignal && (
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border ${
                        activeSignal.strength === "Critical" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                        activeSignal.strength === "High" ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" :
                        activeSignal.strength === "Medium" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
                        "bg-white/5 border-white/10 text-white/40"
                      }`}>{activeSignal.strength}</span>
                      <span className="text-white/40 text-xs font-mono">YES {activeChance}</span>
                      <span className="text-white/30 text-[10px] font-mono">Vol ${Math.round((activeSignal.volume || 0)).toLocaleString()}</span>
                    </div>
                  )}
                  {error && <p className="text-red-400/60 text-xs font-mono mb-2">{error}</p>}
                  
                  <div className="relative mt-6 group flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type natural-language command to track new phenomena..."
                        className="w-full bg-black/20 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all font-light placeholder:text-white/30"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        />
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-base font-medium hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-3 whitespace-nowrap">
                      <Cpu size={20} />
                      Initialize Topic
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TelemetryData({ label, value, sub, warning }: { label: string, value: string, sub: string, warning?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="text-[10px] text-white/40 font-mono tracking-[0.2em]">{label}</div>
      <div className="flex items-baseline gap-2 text-right">
        <div className={`text-xl font-light font-mono tracking-tight ${warning ? 'text-red-400/80 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-cyan-100/90 drop-shadow-[0_0_10px_rgba(207,250,254,0.3)]'} transition-all`}>
          {value}
        </div>
        <div className={`text-[10px] uppercase font-mono w-6 text-left ${warning ? 'text-red-500/60' : 'text-white/30'}`}>{sub}</div>
      </div>
    </div>
  );
}