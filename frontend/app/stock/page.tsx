"use client";

import Cardstock from "../components/Cardstock";

export default function StockPage() {
  return (
    <div className="min-h-screen bg-zinc-50/30 flex flex-col font-sans">
      <main className="flex-1 flex flex-col py-10">
        <Cardstock />
      </main>
    </div>
  );
}
