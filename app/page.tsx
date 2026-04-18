"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [current, setCurrent] = useState("");
  const [currentSong, setCurrentSong] =
    useState<Song | null>(null);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [quality, setQuality] =
    useState("Best");

  const [recent, setRecent] = useState<
    string[]
  >([]);

  const [favorites, setFavorites] =
    useState<Song[]>([]);

  const [activeChart, setActiveChart] =
    useState("Top 50");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const r =
      localStorage.getItem(
        "recentSearches"
      );

    const f =
      localStorage.getItem(
        "favorites"
      );

    if (r) setRecent(JSON.parse(r));
    if (f) setFavorites(JSON.parse(f));

    loadChart("Top 50");
  }, []);

  useEffect(() => {
    if (
      "mediaSession" in navigator &&
      currentSong
    ) {
      navigator.mediaSession.metadata =
        new MediaMetadata({
          title: currentSong.title,
          artist: "FlowTune",
          album: "Now Playing",
          artwork: [
            {
              src: currentSong.thumbnail,
              sizes: "512x512",
              type: "image/jpeg",
            },
          ],
        });

      navigator.mediaSession.setActionHandler(
        "play",
        () => {
          audioRef.current?.play();
        }
      );

      navigator.mediaSession.setActionHandler(
        "pause",
        () => {
          audioRef.current?.pause();
        }
      );
    }
  }, [currentSong]);

  function saveRecent(value: string) {
    const updated = [
      value,
      ...recent.filter(
        (x) => x !== value
      ),
    ].slice(0, 8);

    setRecent(updated);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updated)
    );
  }

  function toggleFavorite(song: Song) {
    const exists = favorites.find(
      (x) => x.id === song.id
    );

    const updated = exists
      ? favorites.filter(
          (x) => x.id !== song.id
        )
      : [song, ...favorites];

    setFavorites(updated);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updated)
    );
  }

  async function fetchSongs(
    search: string
  ) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(
          search
        )}`
      );

      const data = await res.json();

      const results =
        data.items
          ?.slice(0, 15)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            thumbnail:
              item.thumbnail,
          })) || [];

      setSongs(results);
    } catch {
      setSongs([]);
    }

    setLoading(false);
  }

  async function playSong(song: Song) {
    setCurrent(song.id);
    setCurrentSong(song);

    const res = await fetch(
      `/api/stream?id=${song.id}`
    );

    const data = await res.json();

    setAudioUrl(data.url);

    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  }

  async function searchSongs(
    value?: string
  ) {
    const q = value || query;

    if (!q.trim()) return;

    saveRecent(q);

    await fetchSongs(q);
  }

  async function loadChart(tag: string) {
    setActiveChart(tag);
    setQuery(tag);

    await fetchSongs(
      chartQueryMap[tag] || tag
    );
  }

  function togglePlayback() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  function closePlayer() {
    audioRef.current?.pause();

    setCurrent("");
    setCurrentSong(null);
    setAudioUrl("");
    setIsPlaying(false);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-52">
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay
        onPlay={() =>
          setIsPlaying(true)
        }
        onPause={() =>
          setIsPlaying(false)
        }
        className="hidden"
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-5xl font-black text-green-500">
          FlowTune
        </h1>

        <p className="text-zinc-400 mt-2">
          Background Play Edition
        </p>

        {/* Search */}
        <div className="flex gap-2 mt-6 sticky top-0 z-40 bg-black/80 backdrop-blur-md py-3">
          <input
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              searchSongs()
            }
            placeholder="Search songs..."
            className="flex-1 h-14 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none"
          />

          <button
            onClick={() =>
              searchSongs()
            }
            className="px-6 rounded-2xl bg-green-500 text-black font-bold"
          >
            Search
          </button>
        </div>

        {/* Charts */}
        <div className="flex gap-2 overflow-x-auto py-4">
          {chartTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                loadChart(tag)
              }
              className={`shrink-0 px-4 py-2 rounded-full text-sm ${
                activeChart === tag
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Songs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {songs.map((song) => {
            const liked =
              favorites.some(
                (x) =>
                  x.id === song.id
              );

            return (
              <div
                key={song.id}
                className={`rounded-3xl overflow-hidden bg-zinc-900 border transition ${
                  current === song.id
                    ? "border-green-500"
                    : "border-zinc-800"
                }`}
              >
                <img
                  src={
                    song.thumbnail
                  }
                  className="w-full aspect-square object-cover"
                />

                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-2 h-10">
                    {song.title}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        playSong(song)
                      }
                      className="flex-1 py-2 rounded-xl bg-green-500 text-black font-bold"
                    >
                      Play
                    </button>

                    <button
                      onClick={() =>
                        toggleFavorite(
                          song
                        )
                      }
                      className={`px-3 rounded-xl ${
                        liked
                          ? "bg-red-500"
                          : "bg-zinc-800"
                      }`}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player */}
      {currentSong && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <div className="max-w-5xl mx-auto rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl p-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  currentSong.thumbnail
                }
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {
                    currentSong.title
                  }
                </div>

                <div className="text-xs text-zinc-400">
                  Quality •{" "}
                  {quality}
                </div>
              </div>

              <button
                onClick={
                  togglePlayback
                }
                className="h-12 w-12 rounded-full bg-green-500 text-black text-lg font-bold"
              >
                {isPlaying
                  ? "❚❚"
                  : "▶"}
              </button>

              <button
                onClick={
                  closePlayer
                }
                className="h-10 w-10 rounded-full bg-zinc-800"
              >
                ✕
              </button>
            </div>

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
                  className={`px-3 py-1 rounded-full text-xs ${
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
      )}
    </main>
  );
}
