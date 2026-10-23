import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, Activity, Cpu, FileText, ChevronDown } from "lucide-react";
import { fetchEvents } from "../api";

export function ChronologicalSpine() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents(12)
      .then((data) => {
        if (Array.isArray(data)) setLiveEvents(data);
      })
      .catch((e) => console.error("ChronologicalSpine fetch error:", e));
  }, []);

  // Build briefings from live events or fallback to mock
  const briefings = liveEvents.length > 0
    ? liveEvents.slice(0, 4).map((ev, i) => {
        const colors = [
          { colorClass: "from-purple-900/40 to-indigo-900/40 border-purple-500/30", accent: "text-purple-400" },
          { colorClass: "from-blue-900/40 to-cyan-900/40 border-blue-500/30", accent: "text-blue-400" },
          { colorClass: "from-sky-900/40 to-cyan-900/40 border-sky-500/30", accent: "text-sky-400" },
          { colorClass: "from-amber-900/40 to-yellow-900/40 border-amber-500/30", accent: "text-amber-400" },
        ];
        const vol = parseFloat(ev.volume || "0");
        return {
          title: (ev.title || ev.question || "Market Event").slice(0, 60),
          date: ev.endDate ? new Date(ev.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Live",
          type: vol > 1000000 ? "CRITICAL" : vol > 100000 ? "HIGH" : "MEDIUM",
          description: ev.description || ev.title || ev.question || "No description available.",
          stats: `$${Math.round(vol).toLocaleString()} volume • Polymarket`,
          ...colors[i % colors.length],
        };
      })
    : [
      {
        title: "Night Briefing",
        date: "Mar 29, 2026",
        type: "CRITICAL",
        description: "Critical political development: Rep. Jim Himes (D-Intel) accused President Trump of misrepresenting Iran negotiations amid ongoing war and market volatility, with Strait of Hormuz implications.",
        stats: "1 clustered stories • 13m ago",
        colorClass: "from-purple-900/40 to-indigo-900/40 border-purple-500/30",
        accent: "text-purple-400"
      },
      {
        title: "Evening Briefing",
        date: "Mar 29, 2026",
        type: "MEDIUM",
        description: "Evening Briefing: US-Israeli strikes have caused a large-scale Tehran blackout and prompted Iran-backed Houthis to fire missiles at Israel while threatening to close the Red Sea shipping lane...",
        stats: "18 clustered stories • 51m ago",
        colorClass: "from-blue-900/40 to-cyan-900/40 border-blue-500/30",
        accent: "text-blue-400"
      },
      {
        title: "Afternoon Briefing",
        date: "Mar 29, 2026",
        type: "CRITICAL",
        description: "Pope Leo XIV rejects claims that God justifies war in Palm Sunday Mass message. Diplomatic channels open back up via Swiss intermediaries.",
        stats: "3 clustered stories • 7h ago",
        colorClass: "from-sky-900/40 to-cyan-900/40 border-sky-500/30",
        accent: "text-sky-400"
      },
      {
        title: "Morning Briefing",
        date: "Mar 29, 2026",
        type: "CRITICAL",
        description: "Rising tensions as diplomatic talks stall over oil transit routes. Preliminary naval maneuvers detected near key chokepoints.",
        stats: "12 clustered stories • 11h ago",
        colorClass: "from-amber-900/40 to-yellow-900/40 border-amber-500/30",
        accent: "text-amber-400"
      }
    ];

  // Build watchItems from live events or fallback
  const watchItems = liveEvents.length > 4
    ? liveEvents.slice(4, 7).map((ev, i) => {
        const vol = parseFloat(ev.volume || "0");
        const changeLevel = vol > 1000000 ? "CRITICAL" : vol > 100000 ? "ELEVATED" : "MONITOR";
        const colorMap = ["amber", "blue", "red"];
        const color = colorMap[i % colorMap.length];
        const sevColors: Record<string, string> = {
          amber: "text-amber-400 border-amber-500/40 bg-amber-500/10",
          blue: "text-blue-400 border-blue-500/40 bg-blue-500/10",
          red: "text-red-400 border-red-500/40 bg-red-500/10",
        };
        let yesPrice = 0.5;
        try {
          const markets = ev.markets || [];
          if (markets[0]?.outcomePrices) {
            const p = typeof markets[0].outcomePrices === "string" ? JSON.parse(markets[0].outcomePrices) : markets[0].outcomePrices;
            yesPrice = parseFloat(p[0]) || 0.5;
          }
        } catch (_) {}
        return {
          label: (ev.title || ev.question || "Event").slice(0, 40),
          change: changeLevel,
          trend: yesPrice > 0.5 ? "up" : "neutral",
          summary: (ev.description || "Monitoring market activity.").slice(0, 150),
          severity: changeLevel,
          sevColor: sevColors[color],
          signals: Math.round(vol / 10000),
          chance: `${Math.round(yesPrice * 100)}%`,
          color,
          articles: [
            { source: "POLYMARKET", time: "LIVE" },
          ],
        };
      })
    : [
      { 
        label: "Naval Movements in SCS", 
        change: "ELEVATED", 
        trend: "up", 
        summary: "Increased destroyer presence near artificial islands indicating potential blockade testing.", 
        severity: "DEFCON 3", 
        sevColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        signals: 42,
        chance: "72%",
        color: "amber",
        articles: [
          { source: "REUTERS", time: "2H AGO" },
          { source: "SCMP", time: "5H AGO" }
        ]
      },
      { 
        label: "Pipeline Sabotage Analysis", 
        change: "MONITOR", 
        trend: "neutral", 
        summary: "Seismic anomalies detected near underwater infrastructure segments. Assessing risk.", 
        severity: "MODERATE", 
        sevColor: "text-blue-400 border-blue-500/40 bg-blue-500/10",
        signals: 18,
        chance: "45%",
        color: "blue",
        articles: [
          { source: "BLOOMBERG", time: "1H AGO" },
          { source: "FT", time: "3H AGO" }
        ]
      },
      { 
        label: "OPEC+ Emergency Meet", 
        change: "CRITICAL", 
        trend: "up", 
        summary: "Unscheduled convention highly likely to result in immediate and severe supply cuts.", 
        severity: "CRITICAL", 
        sevColor: "text-red-400 border-red-500/40 bg-red-500/10",
        signals: 84,
        chance: "89%",
        color: "red",
        articles: [
          { source: "WSJ", time: "15M AGO" },
          { source: "AL JAZEERA", time: "45M AGO" }
        ]
      },
    ];

  // Build rawFeed from live events or fallback
  const rawFeed = liveEvents.length > 7
    ? liveEvents.slice(7, 11).map((ev) => ({
        source: "POLYMARKET",
        title: (ev.title || ev.question || "Market").slice(0, 80),
        time: "LIVE",
        url: ev.slug ? `https://polymarket.com/event/${ev.slug}` : "#",
      }))
    : [
      { source: "BLOOMBERG.COM", title: "The Strait of Hormuz Energy Shock Is About to Head to the West", time: "6H AGO", url: "#" },
      { source: "THE WASHINGTON POST", title: "Pentagon prepares for weeks of ground operations in Iran", time: "5H AGO", url: "#" },
      { source: "AL JAZEERA", title: "'We can insure the ship, but we cannot insure a human life.'", time: "5H AGO", url: "#" },
      { source: "WSJ", title: "How Pakistan Wooed Trump and Styled Itself as a Peace Broker in Iran Conflict", time: "20H AGO", url: "#" },
    ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % briefings.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + briefings.length) % briefings.length);

  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0">
      <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 overflow-hidden flex flex-col ${isExpanded ? 'rounded-[3rem] p-8 gap-10' : 'rounded-[3rem] p-4 px-6 lg:p-6 lg:px-8 gap-0'}`}>
        
        {/* Main Header / Top Pill Part */}
        <div className={`flex items-center justify-between transition-all duration-300 ${isExpanded ? 'mb-0 pb-0 border-b-transparent' : 'mb-0 pb-0 border-b-transparent'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span className="text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase line-clamp-1">Global Escalation Watchlist</span>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center bg-transparent shrink-0"
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={16} />
            </motion.div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { height: "auto", opacity: 1, marginTop: 24, transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3, delay: 0.1 } } },
                hidden: { height: 0, opacity: 0, marginTop: 0, transition: { height: { duration: 0.4, ease: "easeInOut" }, opacity: { duration: 0.2 } } }
              }}
              className="flex flex-col gap-10 overflow-hidden"
            >
              {/* Escalation Watchlist Content */}
              <div className="flex flex-col">
                <div className="space-y-4">
                  {watchItems.map((item, idx) => (
            <div key={idx} className="flex flex-col group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[15px] text-white/90 group-hover:text-white font-medium tracking-tight pr-4 leading-snug">{item.label}</span>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase border ${item.sevColor}`}>
                    {item.change}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider">Signals</span>
                    <span className="text-[9px] font-mono text-cyan-400">{item.signals}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[8px] text-white/40 font-mono uppercase tracking-wider">Escalation Probability</span>
                     <span className={`text-[9px] font-mono font-medium ${
                       item.color === 'red' ? 'text-red-400' :
                       item.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                     }`}>{item.chance}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
                     <div className={`h-full rounded-full transition-all duration-1000 ${
                       item.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                       item.color === 'blue' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 
                       'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                     }`} style={{ width: item.chance }} />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-white/40 font-mono uppercase tracking-[0.2em]">Situation Summary</span>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all">
                    <Cpu size={10} />
                    <span className="text-[8px] font-mono tracking-widest uppercase">Generate Brief</span>
                  </button>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {item.summary}
                </p>
                
                <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                  <span className="text-[8px] text-white/30 font-mono uppercase tracking-widest flex items-center gap-1">
                    <FileText size={8} /> Sourced Articles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.articles?.map((art, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <span className="text-[9px] text-white/60 font-mono">{art.source}</span>
                        <span className="text-[8px] text-white/30 font-mono">{art.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="flex flex-col gap-5 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/60" />
            <span className="text-white/40 font-mono text-[10px] tracking-[0.2em] uppercase">Chronological Briefings</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-white/5 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-white/5 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="relative h-[280px] w-full overflow-hidden rounded-2xl perspective-[1000px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, rotateY: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, rotateY: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`absolute inset-0 bg-gradient-to-br ${briefings[currentIndex].colorClass} backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className={`font-medium text-xl tracking-tight drop-shadow-md ${briefings[currentIndex].accent}`}>
                        {briefings[currentIndex].title}
                      </h3>
                      <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest mt-1.5">
                        {briefings[currentIndex].date}
                      </p>
                    </div>
                    
                    {briefings[currentIndex].type && (
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border ${
                        briefings[currentIndex].type === 'CRITICAL' 
                          ? 'text-red-300 border-red-400/30 bg-red-950/40' 
                          : 'text-amber-300 border-amber-400/30 bg-amber-950/40'
                      }`}>
                        {briefings[currentIndex].type}
                      </span>
                    )}
                  </div>

                  <p className="text-[14px] leading-relaxed text-white/90 font-light line-clamp-4">
                    {briefings[currentIndex].description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-[10px] font-mono text-white/50 tracking-wider">
                  {briefings[currentIndex].stats}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {briefings.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>
      </div>

      {/* Raw Intelligence Feed Section */}
      <div className="flex flex-col pt-4">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
          <Activity size={14} className="text-cyan-400" />
          <span className="text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase">Raw Feed</span>
        </div>
        
        <div className="space-y-4 perspective-[1200px]">
          {rawFeed.map((news, idx) => (
            <motion.div 
              key={idx}
              initial={{ rotateY: -360, opacity: 0, scale: 0.9 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              transition={{
                duration: 1.6,
                ease: [0.65, 0, 0.35, 1], // Custom S-curve easing (slow start, fast spin, gentle stop)
                delay: idx * 0.15
              }}
              className="group relative p-5 rounded-2xl bg-black/40 border border-white/5 transition-all duration-300 overflow-hidden cursor-pointer hover:border-white/20"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Ethereal light-blue fill state */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  delay: (idx * 0.15) + 1.1 // Triggers right as the 3D spin decelerates to a stop
                }}
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] to-cyan-500/[0.02] pointer-events-none"
              />
              
              <div className="relative z-10 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{news.source}</span>
                <h4 className="text-white/90 text-[15px] font-medium leading-snug group-hover:text-white transition-colors">{news.title}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono text-white/40">{news.time}</span>
                  <span className="text-[10px] font-mono text-white/30 group-hover:text-cyan-400 transition-colors">SOURCE ↗</span>
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
    </div>
  );
}