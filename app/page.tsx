"use client";

import { useEffect, useMemo, useState } from "react";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [quality, setQuality] = useState("Best");
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    const f = localStorage.getItem("favorites");
    if (f) setFavorites(JSON.parse(f));
  }, []);

  function toggleFavorite(song: Song) {
    const exists = favorites.find((x) => x.id === song.id);

    const updated = exists
      ? favorites.filter((x) => x.id !== song.id)
      : [song, ...favorites];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  async function searchSongs() {
    if (!query.trim()) return;

    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    const results =
      data.items?.slice(0, 20).map((item: any) => ({
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
      data.items?.slice(0, 20).map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
      })) || [];

    setSongs(results);
  }

  useEffect(() => {
    loadTrending();
  }, []);

  function playSong(song: Song) {
    setCurrentSong(song);
    setPlaying(true);
  }

  const currentIndex = useMemo(() => {
    if (!currentSong) return -1;
    return songs.findIndex((x) => x.id === currentSong.id);
  }, [songs, currentSong]);

  function nextSong() {
    if (!songs.length || currentIndex < 0) return;
    const next = songs[(currentIndex + 1) % songs.length];
    playSong(next);
  }

  function prevSong() {
    if (!songs.length || currentIndex < 0) return;
    const prev =
      songs[(currentIndex - 1 + songs.length) % songs.length];
    playSong(prev);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-44">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-green-500">
              FlowTune
            </h1>
            <p className="text-zinc-400 mt-2">
              Spotify Style YouTube Player
            </p>
          </div>

          <div className="px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            V5
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

        {/* Quality */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {["Data Saver", "Normal", "High", "Best"].map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`px-4 py-2 rounded-full text-sm ${
                quality === q
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3">
              Favorites
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mt-8">
          {songs.map((song) => {
            const liked = favorites.find(
              (x) => x.id === song.id
            );

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

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => playSong(song)}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-black font-bold"
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

      {/* Spotify Mini Player */}
      {currentSong && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <div className="max-w-5xl mx-auto rounded-3xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden">
            {/* Progress */}
            <div className="h-1 bg-zinc-800">
              <div className="h-full w-1/3 bg-green-500 rounded-r-full" />
            </div>

            <div className="p-3">
              <div className="flex items-center gap-3">
                {/* Cover */}
                <img
                  src={currentSong.thumbnail}
                  className="h-14 w-14 rounded-xl object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {currentSong.title}
                  </div>

                  <div className="text-xs text-zinc-400">
                    Quality • {quality}
                  </div>
                </div>

                {/* Controls */}
                <button
                  onClick={prevSong}
                  className="h-10 w-10 rounded-full bg-zinc-800"
                >
                  ⏮
                </button>

                <button
                  onClick={() =>
                    setPlaying(!playing)
                  }
                  className="h-12 w-12 rounded-full bg-green-500 text-black font-black"
                >
                  {playing ? "❚❚" : "▶"}
                </button>

                <button
                  onClick={nextSong}
                  className="h-10 w-10 rounded-full bg-zinc-800"
                >
                  ⏭
                </button>

                <button
                  onClick={() =>
                    setCurrentSong(null)
                  }
                  className="h-10 w-10 rounded-full bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              {/* Quality Row */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {[
                  "Data Saver",
                  "Normal",
                  "High",
                  "Best",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() =>
                      setQuality(q)
                    }
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
          </div>

          {/* Hidden YouTube Player */}
          {playing && (
            <iframe
              width="0"
              height="0"
              allow="autoplay"
              className="hidden"
              src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1&playsinline=1`}
            />
          )}
        </div>
      )}
    </main>
  );
        }
