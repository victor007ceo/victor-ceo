import React from "react";
import { Outlet, Link } from "react-router";
import { Sparkles } from "lucide-react";
import { BackgroundEffect } from "./components/BackgroundEffect";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#010101] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 flex flex-col relative">
      <BackgroundEffect />
      
      {/* Top Navigation / App Title */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <Link to="/" aria-label="VICTOR.CEO exhibition home" className="flex flex-col gap-0.5 group">
             <h1 className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase group-hover:text-cyan-400/80 transition-colors">VICTOR.CEO</h1>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
               <span className="text-white/80 font-mono text-[11px] tracking-widest">THE EXHIBITION</span>
             </div>
          </Link>
          
          <Link to="/exclusive-access" className="px-4 sm:px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 tracking-widest uppercase shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
            <Sparkles size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">Exclusive access</span>
            <span className="sm:hidden">Access</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <Outlet />
    </div>
  );
}
