"use client";

import { useEffect, useRef, useState } from "react";

type Song = {
  id: string;
  title: string;
  thumbnail: string;
};

export default function Page() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] =
    useState<Song | null>(null);

  const [quality, setQuality] =
    useState("Best");

  const [playing, setPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

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

  async function playSong(song: Song) {
    setLoading(true);
    setCurrentSong(song);

    try {
      const res = await fetch(
        `/api/stream?id=${song.id}&quality=${quality}`
      );

      const data = await res.json();

      if (audioRef.current) {
        audioRef.current.src = data.url;
        await audioRef.current.play();
        setPlaying(true);
      }

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata =
          new MediaMetadata({
            title: song.title,
            artwork: [
              {
                src: song.thumbnail,
                sizes: "512x512",
                type: "image/jpeg",
              },
            ],
          });
      }
    } catch {}

    setLoading(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function downloadSong() {
    if (!audioRef.current?.src) return;
    const a = document.createElement("a");
    a.href = audioRef.current.src;
    a.download = `${currentSong?.title || "song"}.mp3`;
    a.click();
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = () =>
      setProgress(audio.currentTime);

    const meta = () =>
      setDuration(audio.duration || 0);

    const ended = () =>
      setPlaying(false);

    audio.addEventListener(
      "timeupdate",
      time
    );

    audio.addEventListener(
      "loadedmetadata",
      meta
    );

    audio.addEventListener(
      "ended",
      ended
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        time
      );

      audio.removeEventListener(
        "loadedmetadata",
        meta
      );

      audio.removeEventListener(
        "ended",
        ended
      );
    };
  }, []);

  function seek(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = Number(e.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime =
        value;
      setProgress(value);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <audio ref={audioRef} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-5xl font-black text-green-500">
          FlowTune
        </h1>

        <p className="text-zinc-400 mt-2">
          V5 Real Audio Player
        </p>

        {/* Search */}
        <div className="flex gap-2 mt-6">
          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              searchSongs()
            }
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

        {/* Quality */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
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

        {/* Songs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mt-6">
          {songs.map((song) => (
            <div
              key={song.id}
              className="rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <img
                src={song.thumbnail}
                className="w-full aspect-square object-cover"
              />

              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2 min-h-[42px]">
                  {song.title}
                </div>

                <button
                  onClick={() =>
                    playSong(song)
                  }
                  className="mt-3 w-full py-2 rounded-xl bg-green-500 text-black font-bold"
                >
                  {loading &&
                  currentSong?.id ===
                    song.id
                    ? "Loading..."
                    : "Play"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Player */}
      {currentSong && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <div className="max-w-5xl mx-auto rounded-3xl bg-zinc-900/95 border border-zinc-800 p-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <img
                src={currentSong.thumbnail}
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {currentSong.title}
                </div>

                <div className="text-xs text-zinc-400">
                  {quality}
                </div>
              </div>

              <button
                onClick={togglePlay}
                className="h-11 w-11 rounded-full bg-green-500 text-black font-black"
              >
                {playing
                  ? "❚❚"
                  : "▶"}
              </button>

              <button
                onClick={downloadSong}
                className="px-3 h-11 rounded-xl bg-zinc-800 text-sm"
              >
                ⬇
              </button>
            </div>

            <div className="mt-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={seek}
                className="w-full accent-green-500"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
        }
