"use client";

import { useEffect, useState } from "react";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState("");
  const [quality, setQuality] = useState("Normal");

  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    const r = localStorage.getItem("recentSearches");
    const f = localStorage.getItem("favorites");

    if (r) setRecent(JSON.parse(r));
    if (f) setFavorites(JSON.parse(f));
  }, []);

  function saveRecent(value: string) {
    const updated = [
      value,
      ...recent.filter((x) => x !== value),
    ].slice(0, 8);

    setRecent(updated);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updated)
    );
  }

  function toggleFavorite(song: Song) {
    const exists = favorites.find((x) => x.id === song.id);

    let updated = [];

    if (exists) {
      updated = favorites.filter((x) => x.id !== song.id);
    } else {
      updated = [song, ...favorites];
    }

    setFavorites(updated);
    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  }

  async function searchSongs(value?: string) {
    const q = value || query;

    if (!q.trim()) return;

    saveRecent(q);

    const res = await fetch(
      `/api/search?q=${encodeURIComponent(q)}`
    );

    const data = await res.json();

    const results =
      data.items?.slice(0, 12).map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
      })) || [];

    setSongs(results);
  }

  async function loadTrending() {
    const res = await fetch(`/api/search?q=top songs`);
    const data = await res.json();

    const results =
      data.items?.slice(0, 12).map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
      })) || [];

    setSongs(results);
  }

  useEffect(() => {
    loadTrending();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-5xl font-black text-green-500">
          FlowTune
        </h1>

        <p className="text-zinc-400 mt-2">
          Music Everywhere
        </p>

        {/* Search */}
        <div className="flex gap-2 mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && searchSongs()
            }
            placeholder="Search songs..."
            className="flex-1 h-14 px-4 rounded-2xl bg-zinc-900 border border-zinc-800"
          />

          <button
            onClick={() => searchSongs()}
            className="px-6 rounded-2xl bg-green-500 text-black font-bold"
          >
            Search
          </button>
        </div>

        {/* Recent Searches */}
        {recent.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">
              Recent Searches
            </h2>

            <div className="flex gap-2 flex-wrap">
              {recent.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    searchSongs(item);
                  }}
                  className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">
              Favorites
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {favorites.slice(0, 4).map((song) => (
                <button
                  key={song.id}
                  onClick={() => setCurrent(song.id)}
                  className="rounded-2xl overflow-hidden bg-zinc-900"
                >
                  <img
                    src={song.thumbnail}
                    className="w-full aspect-square object-cover"
                  />

                  <div className="p-2 text-sm line-clamp-2">
                    {song.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3">
            Trending Now
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {songs.map((song) => {
              const liked = favorites.find(
                (x) => x.id === song.id
              );

              return (
                <div
                  key={song.id}
                  className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
                >
                  <button
                    onClick={() => setCurrent(song.id)}
                    className="w-full text-left"
                  >
                    <img
                      src={song.thumbnail}
                      className="w-full aspect-square object-cover"
                    />

                    <div className="p-3 text-sm font-semibold line-clamp-2 min-h-[44px]">
                      {song.title}
                    </div>
                  </button>

                  <div className="px-3 pb-3 flex gap-2">
                    <button
                      onClick={() => setCurrent(song.id)}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-black text-sm font-bold"
                    >
                      Play
                    </button>

                    <button
                      onClick={() => toggleFavorite(song)}
                      className="px-3 rounded-xl bg-zinc-800"
                    >
                      {liked ? "♥" : "♡"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mini Player */}
      {current && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-zinc-400">
                Now Playing • {quality}
              </div>

              <button
                onClick={() => setCurrent("")}
                className="text-sm px-3 py-1 rounded-lg bg-zinc-800"
              >
                Close
              </button>
            </div>

            <iframe
              width="100%"
              height="90"
              src={`https://www.youtube.com/embed/${current}?autoplay=1`}
              allow="autoplay"
              className="rounded-xl"
            />
          </div>
        </div>
      )}
    </main>
  );
            }
