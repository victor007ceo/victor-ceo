import { motion } from "motion/react";
import { Construction, Cpu, Terminal } from "lucide-react";

export function InDevelopment() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 top-[73px] z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
    >
      {/* Glass Panel */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-xl p-8 md:p-12 rounded-2xl border border-white/20 bg-white/[0.02] backdrop-blur-xl shadow-2xl max-h-full overflow-y-auto"
      >
        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-400/40" />
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-400/40" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-400/40" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-400/40" />

        {/* Animated icon */}
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <Construction size={56} className="text-cyan-400/80" strokeWidth={1.5} />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"
            />
          </div>
        </motion.div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />
          <span className="text-[9px] font-mono text-cyan-400/60 tracking-[0.2em] uppercase">
            System Status
          </span>
        </div>

        {/* Main heading */}
        <h2 className="text-3xl font-mono text-white/90 text-center mb-3 tracking-wider">
          IN DEVELOPMENT
        </h2>

        {/* Subheading */}
        <p className="text-sm font-mono text-white/50 text-center mb-8 tracking-wide leading-relaxed">
          This feature is currently being built.<br />
          Please stand by while we complete final preparations.
        </p>

        {/* Technical details */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-xs font-mono text-white/40">
            <Cpu size={14} className="text-cyan-400/60 shrink-0" />
            <span className="tracking-wider">Neural networks downloading Kung Fu trading skills</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-white/40">
            <Terminal size={14} className="text-cyan-400/60 shrink-0" />
            <span className="tracking-wider">APIs are loading in the Construct</span>
          </div>
        </div>

        {/* Progress bar effect */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          />
        </div>

        {/* Bottom text */}
        <p className="text-[10px] font-mono text-white/30 text-center mt-6 tracking-widest uppercase">
          Expected deployment: Q2 2026
        </p>
      </motion.div>
    </motion.div>
  );
}
