import { NextRequest, NextResponse } from "next/server";

const STORY_API_URLS = [
  "https://api.story.foundation",
  "https://aeneid-api.story.foundation",
  "http://172.192.41.96:1317",
  "https://story-aeneid-api.itrocket.net",
];

async function fetchWithFallback(path: string, search: string) {
  for (const base of STORY_API_URLS) {
    try {
      const res = await fetch(`${base}/${path}${search}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return res;
    } catch {
      continue;
    }
  }
  throw new Error("All Story API endpoints failed");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const tail = path.join("/");
  const search = req.nextUrl.search ?? "";

  const res = await fetchWithFallback(tail, search);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
