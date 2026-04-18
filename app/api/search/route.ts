import { NextResponse } from "next/server";

type Item = {
  id: string;
  title: string;
  thumbnail: string;
};

function extractVideoId(url: string) {
  const match =
    url.match(/watch\?v=([a-zA-Z0-9_-]{11})/) ||
    url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);

  return match?.[1] || "";
}

function parseHtml(html: string): Item[] {
  const out: Item[] = [];
  const ids = new Set<string>();

  const regex =
    /"videoId":"([a-zA-Z0-9_-]{11})".+?"title":\{"runs":\[\{"text":"(.*?)"/g;

  let match;

  while ((match = regex.exec(html)) !== null && out.length < 20) {
    const id = match[1];
    const title = match[2]
      .replace(/\\u0026/g, "&")
      .replace(/\\"/g, '"');

    if (!ids.has(id)) {
      ids.add(id);

      out.push({
        id,
        title,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
  }

  return out;
}

async function fromHtml(query: string): Promise<Item[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  const html = await res.text();
  return parseHtml(html);
}

async function fromInvidious(query: string): Promise<Item[]> {
  const instances = [
    "https://yewtu.be",
    "https://vid.puffyan.us",
    "https://inv.nadeko.net",
  ];

  for (const base of instances) {
    try {
      const res = await fetch(
        `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        {
          headers: { "User-Agent": "Mozilla/5.0" },
          cache: "no-store",
        }
      );

      if (!res.ok) continue;

      const data = await res.json();

      const items = data.slice(0, 20).map((x: any) => ({
        id: x.videoId,
        title: x.title,
        thumbnail:
          x.videoThumbnails?.pop()?.url ||
          `https://i.ytimg.com/vi/${x.videoId}/hqdefault.jpg`,
      }));

      if (items.length) return items;
    } catch {}
  }

  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  try {
    let items = await fromInvidious(q);

    if (!items.length) {
      items = await fromHtml(q);
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
