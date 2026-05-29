"use client";

import Cardproduct from "./components/Cardproduct";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50/30 flex flex-col font-sans">
      <main className="flex-1 flex flex-col py-10">
        <Cardproduct />
      </main>
      
      {/* <footer className="py-6 border-t border-zinc-100 bg-white text-center text-xs text-zinc-400 font-medium">
      </footer> */}
    </div>
  );
}
