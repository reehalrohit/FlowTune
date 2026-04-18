import { NextResponse } from "next/server";

const SOURCES = [
  "https://pipedapi.kavin.rocks",
  "https://piped.video",
  "https://piped.adminforge.de",
  "https://piped.projectsegfau.lt"
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ items: [] });
  }

  for (const base of SOURCES) {
    try {
      const url =
        `${base}/api/search?q=${encodeURIComponent(q)}&filter=videos`;

      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });

      if (!res.ok) continue;

      const data = await res.json();

      if (data?.items?.length) {
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json({
    items: [],
    error: "All sources failed"
  });
}
