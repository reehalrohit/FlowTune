
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  // TODO: Replace with real extractor result for this video id
  const streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return NextResponse.json({
    id,
    url: streamUrl,
  });
}
