import { NextRequest, NextResponse } from "next/server";

const STORY_API_BASE = "http://172.192.41.96:1317";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const tail = params.path.join("/");
  const search = req.nextUrl.search ?? "";
  const target = `${STORY_API_BASE}/${tail}${search}`;

  const res = await fetch(target, {
    headers: { Accept: "application/json" },
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
