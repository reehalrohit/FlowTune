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

  async function searchSongs() {
    if (!query.trim()) return;

    const res = await fetch(
      `https://piped.video/api/search?q=${encodeURIComponent(query)}&filter=videos`
    );

    const data = await res.json();

    const results = data.items?.slice(0, 12).map((item: any) => ({
      id: item.url.split("v=")[1] || item.id,
      title: item.title,
      thumbnail: item.thumbnail,
    })) || [];

    setSongs(results);
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-28">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-green-500">
          FlowTune
        </h1>

        <div className="flex gap-2 mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs..."
            className="flex-1 h-14 px-4 rounded-2xl bg-zinc-900 border border-zinc-800"
          />

          <button
            onClick={searchSongs}
            className="px-6 rounded-2xl bg-green-500 text-black font-bold"
          >
            Search
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => setCurrent(song.id)}
              className="text-left rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-4 font-semibold line-clamp-2">
                {song.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4">
          <div className="max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="200"
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
