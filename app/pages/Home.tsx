import React from "react";
import { NeuralControlRoom } from "../components/NeuralControlRoom";
import { SignalFeed } from "../components/SignalFeed";
import { ChronologicalSpine } from "../components/ChronologicalSpine";
import { PocketTerminal } from "../components/PocketTerminal";
import { InDevelopment } from "../components/InDevelopment";

export function Home() {
  return (
    <>
      <InDevelopment />
      {/* Pocket Terminal moved below the top bar */}
      <div className="relative z-30 w-full">
        <PocketTerminal />
      </div>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-8 pb-32 pt-8 flex flex-col gap-6 lg:gap-12">
        <NeuralControlRoom />
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start w-full">
          <SignalFeed />
          <ChronologicalSpine />
        </div>
      </main>
    </>
  );
}
