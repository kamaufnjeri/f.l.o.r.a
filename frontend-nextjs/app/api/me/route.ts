import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";

  const res = await fetch("http://127.0.0.1:8000/api/auth/me/", {
    method: "GET",
    headers: {
      cookie: cookieHeader, // 🔥 THIS IS THE KEY
    },
  });

  const data = await res.json();

  return NextResponse.json({
    cookies: cookieHeader,
    backendResponse: data,
  });
}