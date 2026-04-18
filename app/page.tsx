"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
};

const chartTags = [
  "Top 50",
  "India",
  "Global",
  "Punjabi",
  "Pop",
  "Hip Hop",
  "Love",
  "Workout",
];

const chartQueryMap: Record<string, string> = {
  "Top 50": "top 50 songs",
  India: "india top songs",
  Global: "global top songs",
  Punjabi: "punjabi hits",
  Pop: "pop hits",
  "Hip Hop": "hip hop hits",
  Love: "love songs",
  Workout: "workout songs",
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [activeChart, setActiveChart] = useState("Top 50");
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState("");
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [quality, setQuality] = useState("Best");
  const [isPlaying, setIsPlaying] = useState(true);
  const [miniOpen, setMiniOpen] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("recentSearches");
    const f = localStorage.getItem("favorites");

    if (r) setRecent(JSON.parse(r));
    if (f) setFavorites(JSON.parse(f));

    loadChart("Top 50");
  }, []);

  function saveRecent(value: string) {
    const updated = [value, ...recent.filter((x) => x !== value)].slice(0, 8);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  }

  function toggleFavorite(song: Song) {
    const exists = favorites.find((x) => x.id === song.id);

    const updated = exists
      ? favorites.filter((x) => x.id !== song.id)
      : [song, ...favorites];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  async function fetchSongs(search: string) {
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();

      const results =
        data.items?.slice(0, 20).map((item: any) => ({
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail,
        })) || [];

      setSongs(results);
    } catch {
      setSongs([]);
    }

    setLoading(false);
  }

  async function searchSongs(value?: string) {
    const q = value || query;
    if (!q.trim()) return;

    saveRecent(q);
    await fetchSongs(q);
  }

  async function loadChart(tag: string) {
    setActiveChart(tag);
    setQuery(tag);
    await fetchSongs(chartQueryMap[tag] || tag);
  }

  function playSong(song: Song) {
    setCurrent(song.id);
    setCurrentSong(song);
    setMiniOpen(true);
    setIsPlaying(true);
  }

  function closePlayer() {
    setCurrent("");
    setCurrentSong(null);
    setIsPlaying(false);
  }

  const currentIndex = useMemo(
    () => songs.findIndex((x) => x.id === current),
    [songs, current]
  );

  function nextSong() {
    if (songs.length === 0) return;
    const next = songs[(currentIndex + 1) % songs.length];
    playSong(next);
  }

  function prevSong() {
    if (songs.length === 0) return;
    const prev =
      songs[(currentIndex - 1 + songs.length) % songs.length];
    playSong(prev);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-5xl font-black text-green-500">
              FlowTune
            </h1>
            <p className="text-zinc-400 mt-2">Music Everywhere</p>
          </div>

          <div className="text-xs px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800">
            V4
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && searchSongs()
            }
            placeholder="Search songs, artists, playlists..."
            className="flex-1 h-14 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none"
          />

          <button
            onClick={() => searchSongs()}
            className="px-6 rounded-2xl bg-green-500 text-black font-bold"
          >
            Search
          </button>
        </div>

        {/* Recent */}
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
            <h2 className="text-lg font-bold mb-3">Favorites</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {favorites.slice(0, 4).map((song) => (
                <button
                  key={song.id}
                  onClick={() => playSong(song)}
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

        {/* Hero */}
        <div className="mt-8 rounded-3xl p-5 bg-gradient-to-r from-green-500 to-emerald-700 text-black">
          <div className="text-sm font-bold uppercase">
            Trending Now
          </div>

          <div className="text-3xl font-black mt-2">
            {activeChart}
          </div>

          <div className="text-sm mt-2 opacity-80">
            Tap categories to switch charts
          </div>
        </div>

        {/* Chart Tabs */}
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {chartTags.map((tag) => (
              <button
                key={tag}
                onClick={() => loadChart(tag)}
                disabled={loading}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeChart === tag
                    ? "bg-green-500 text-black scale-105"
                    : "bg-zinc-900 border border-zinc-800 text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="h-1 mt-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className={`h-full bg-green-500 transition-all ${
                loading ? "w-1/2 animate-pulse" : "w-full"
              }`}
            />
          </div>
        </div>

        {/* Songs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mt-5">
          {songs.map((song, index) => {
            const liked = favorites.find((x) => x.id === song.id);

            return (
              <div
                key={song.id}
                className="rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
              >
                <div className="relative">
                  <img
                    src={song.thumbnail}
                    className="w-full aspect-square object-cover"
                  />

                  <div className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/80 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  <button
                    onClick={() => playSong(song)}
                    className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-green-500 text-black font-black"
                  >
                    ▶
                  </button>
                </div>

                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-2 min-h-[40px]">
                    {song.title}
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    #{index + 1} in charts
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => playSong(song)}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Player */}
      {current && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <div className="max-w-5xl mx-auto rounded-3xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 overflow-hidden shadow-2xl">
            {/* Progress */}
            <div className="h-1 bg-zinc-800">
              <div className="h-full w-1/3 bg-green-500 rounded-r-full" />
            </div>

            {/* Top */}
            <div className="p-3 flex items-center gap-3">
              <button
                onClick={() => setMiniOpen(!miniOpen)}
                className="text-zinc-400 text-xs"
              >
                {miniOpen ? "▾" : "▴"}
              </button>

              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                <img
                  src={`https://i.ytimg.com/vi/${current}/mqdefault.jpg`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {currentSong?.title || "Now Playing"}
                </div>

                <div className="text-xs text-zinc-400 truncate">
                  Quality • {quality}
                </div>
              </div>

              <button
                onClick={prevSong}
                className="h-10 w-10 rounded-full bg-zinc-800"
              >
                ⏮
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-12 w-12 rounded-full bg-green-500 text-black font-black"
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <button
                onClick={nextSong}
                className="h-10 w-10 rounded-full bg-zinc-800"
              >
                ⏭
              </button>

              <button
                onClick={closePlayer}
                className="h-10 w-10 rounded-full bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Expanded */}
            {miniOpen && (
              <div className="px-3 pb-3">
                <div className="flex gap-2 overflow-x-auto">
                  {["Data Saver", "Normal", "High", "Best"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        quality === q
                          ? "bg-green-500 text-black"
                          : "bg-zinc-800"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden YouTube Player */}
          {isPlaying && (
            <iframe
              ref={iframeRef}
              width="0"
              height="0"
              allow="autoplay"
              className="hidden"
              src={`https://www.youtube.com/embed/${current}?autoplay=1&playsinline=1`}
            />
          )}
        </div>
      )}
    </main>
  );
    }
