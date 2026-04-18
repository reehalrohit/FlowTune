import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const res = await fetch(
      `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const data = await res.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [] });
  }
}
