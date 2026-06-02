import { NextRequest, NextResponse } from "next/server";

const STORY_API_BASE = "http://172.192.41.96:1317";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const tail = path.join("/");
  const search = req.nextUrl.search ?? "";

  const res = await fetch(`${STORY_API_BASE}/${tail}${search}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
