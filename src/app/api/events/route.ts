import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildings } from "@/data/buildings";
import { categoryKeywords, FoodCategory } from "@/data/foodCategories";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function detectFoodCategory(food: string): FoodCategory {
  const text = food.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => text.includes(k))) return category as FoodCategory;
  }
  return "meal";
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to post" }, { status: 401 });
  }

  const body = await request.json();

  const eventName = String(body.eventName ?? "").trim().slice(0, 120);
  const food = String(body.food ?? "").trim().slice(0, 120);
  const host = String(body.host ?? "").trim().slice(0, 80);
  const description = String(body.description ?? "").trim().slice(0, 300);
  const building = String(body.building ?? "");
  const { startDate, endDate, startTime, endTime } = body;

  if (!eventName || !food || !host) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Object.keys(buildings).includes(building)) {
    return NextResponse.json({ error: "Unknown building" }, { status: 400 });
  }

  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate) || endDate < startDate) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return NextResponse.json({ error: "Invalid times" }, { status: 400 });
  }

  if (startDate === endDate && endTime <= startTime) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  let sourceUrl: string;
  try {
    const raw = String(body.sourceUrl ?? "");
    const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    sourceUrl = url.toString();
  } catch {
    return NextResponse.json({ error: "Invalid source URL" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("food_events").insert({
    event_name: eventName,
    food,
    category: detectFoodCategory(food),
    building,
    start_date: startDate,
    end_date: endDate,
    start_time: startTime,
    end_time: endTime,
    host,
    description,
    source_url: sourceUrl,
    reporter: userId,
    is_verified: false,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That event has already been posted" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not save event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}