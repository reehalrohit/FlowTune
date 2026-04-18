import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  // Demo audio source
  // Replace later with real extractor logic
  return NextResponse.json({
    success: true,
    id,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  });
}
