"use client";

import { useState } from "react";

export default function Page() {
  const [query, setQuery] = useState("");

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-5xl font-black text-green-500">
        FlowTune
      </h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search music..."
        className="w-full h-14 mt-6 px-4 rounded-2xl bg-zinc-900 border border-zinc-800"
      />

      <div className="grid gap-4 mt-8">
        <div className="rounded-3xl p-4 bg-zinc-900">
          <div className="font-bold">Blinding Lights</div>
          <div className="text-zinc-400">The Weeknd</div>
        </div>

        <div className="rounded-3xl p-4 bg-zinc-900">
          <div className="font-bold">Shape of You</div>
          <div className="text-zinc-400">Ed Sheeran</div>
        </div>
      </div>
    </main>
  );
}
