import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  });
}
