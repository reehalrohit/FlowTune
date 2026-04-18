"use client";

import { useState } from "react";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [quality, setQuality] = useState("Normal");

  async function searchSongs() {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://piped.video/api/search?q=${encodeURIComponent(
          query
        )}&filter=videos`
      );

      const data = await res.json();

      const results =
        data.items?.slice(0, 12).map((item: any) => ({
          id: item.url?.split("v=")[1] || item.id,
          title: item.title,
          thumbnail: item.thumbnail,
        })) || [];

      setSongs(results);
    } catch {
      setSongs([]);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-44">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-5xl font-black text-green-500">
          FlowTune
        </h1>

        <p className="text-zinc-400 mt-2">
          Audio Streaming Experience
        </p>

        {/* Search */}
        <div className="flex gap-2 mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchSongs()}
            placeholder="Search songs, artists..."
            className="flex-1 h-14 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none"
          />

          <button
            onClick={searchSongs}
            className="px-6 rounded-2xl bg-green-500 text-black font-bold"
          >
            Search
          </button>
        </div>

        {/* Quality Selector */}
        <div className="flex gap-2 flex-wrap mt-6">
          {["Data Saver", "Normal", "High", "Best"].map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`px-4 h-10 rounded-full text-sm font-semibold transition ${
                quality === q
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 border border-zinc-800 text-white"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => setCurrent(song.id)}
              className="text-left rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <div className="font-semibold line-clamp-2 min-h-[48px]">
                  {song.title}
                </div>

                <div className="mt-4">
                  <span className="inline-block px-4 py-2 rounded-full bg-green-500 text-black font-bold">
                    Play Audio
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {songs.length === 0 && (
          <div className="text-zinc-500 mt-10 text-center">
            Search for songs to begin
          </div>
        )}
      </div>

      {/* Bottom Audio Player */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div>
                <div className="font-semibold text-white">
                  Now Playing
                </div>
                <div className="text-sm text-zinc-400">
                  Quality: {quality}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 h-10 rounded-full bg-zinc-800">
                  ⏮
                </button>
                <button className="px-6 h-10 rounded-full bg-green-500 text-black font-bold">
                  ▶
                </button>
                <button className="px-4 h-10 rounded-full bg-zinc-800">
                  ⏭
                </button>
              </div>
            </div>

            <iframe
              width="100%"
              height="120"
              src={`https://www.youtube.com/embed/${current}?autoplay=1`}
              allow="autoplay"
              className="rounded-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}
