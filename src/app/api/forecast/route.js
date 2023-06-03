import { NextResponse } from "next/server";

export async function GET(request) {
  const encodedCity = request.nextUrl.searchParams.get("encodedCity");
  const res = await fetch(
    `${process.env.FORECAST_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}&lang=ja`
  );

  const data = await res.json();

  return NextResponse.json(data);
}
