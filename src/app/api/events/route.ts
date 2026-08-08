import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildings } from "@/data/buildings";
import { categoryKeywords, FoodCategory } from "@/data/foodCategories";
import { getLocalDateKey } from "@/lib/dateUtils";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_POSTS_PER_HOUR = 5;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function detectFoodCategory(food: string): FoodCategory {
  const text = food.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => text.includes(k))) return category as FoodCategory;
  }
  return "meal";
}

type ModerationResult = {
  isPlausibleFoodEvent: boolean;
  isAbusive: boolean;
  reason: string;
};

// Returns null if the check couldn't run. Callers should treat null as "allow" —
// a moderation outage shouldn't take the whole submission flow down with it.
async function moderateSubmission(fields: {
  eventName: string;
  food: string;
  description: string;
  host: string;
}): Promise<ModerationResult | null> {
  try {
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `
You are moderating submissions to Timbi, a free food event finder for
university students at Western University.

Someone submitted this event:

Event name: ${fields.eventName}
Food: ${fields.food}
Host: ${fields.host}
Description: ${fields.description}

Return ONLY valid JSON, no markdown fences:

{
  "isPlausibleFoodEvent": boolean,
  "isAbusive": boolean,
  "reason": string
}

isPlausibleFoodEvent:
- false if this is gibberish, keyboard mashing, a test post, spam, an
  advertisement for a paid product, or clearly not a food event
- true otherwise. Be lenient: real student posts are often short, informal,
  and vague. "pizza" as the food field is fine.

isAbusive:
- true if it contains slurs, harassment, sexual content, threats, or
  targets a specific named person
- false otherwise

reason:
- a short explanation, ONLY if either flag fires
- empty string if the submission is fine
- do not quote or repeat the user's submitted text
`,
    });

    const parsed = JSON.parse(
      response.output_text.replace(/```json|```/g, "").trim()
    );

    if (
      typeof parsed?.isPlausibleFoodEvent !== "boolean" ||
      typeof parsed?.isAbusive !== "boolean"
    ) {
      return null;
    }

    return parsed as ModerationResult;
  } catch (err) {
    console.error("Moderation check failed, allowing submission:", err);
    return null;
  }
}

const ALLOWED_HOSTS = [
  "instagram.com",
  "facebook.com",
  "linktr.ee",
  "eventbrite.ca",
  "eventbrite.com",
  "uwo.ca",
  "westernusc.ca",
  "discord.gg",
  "docs.google.com",
  "forms.gle",
];

function isAllowedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
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

  // --- Moderation layer 1: date sanity (free) ---

  const today = getLocalDateKey();

  if (endDate < today) {
    return NextResponse.json(
      { error: "That event has already ended" },
      { status: 400 }
    );
  }

  const sixMonthsOut = new Date();
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);

  if (startDate > getLocalDateKey(sixMonthsOut)) {
    return NextResponse.json(
      { error: "That's too far in the future to post yet" },
      { status: 400 }
    );
  }

let sourceUrl: string | null = null;
const raw = String(body.sourceUrl ?? "").trim();

if (raw) {
  let url: URL;

  try {
    const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
    url = new URL(withProtocol);
  } catch {
    return NextResponse.json({ error: "Invalid source URL" }, { status: 400 });
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return NextResponse.json({ error: "Invalid source URL" }, { status: 400 });
  }

  if (!isAllowedHost(url.hostname)) {
    return NextResponse.json(
      {
        error:
          "Source links must be from Instagram, Facebook, Eventbrite, Discord, or a uwo.ca page",
      },
      { status: 400 }
    );
  }

  sourceUrl = url.toString();
}

  // --- Moderation layer 2: rate limit (one cheap query) ---

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("food_events")
    .select("*", { count: "exact", head: true })
    .eq("reporter", userId)
    .gte("created_at", hourAgo);

  if (countError) {
    console.error("Rate limit check failed:", countError);
  } else if ((count ?? 0) >= MAX_POSTS_PER_HOUR) {
    return NextResponse.json(
      { error: "You've posted a lot recently — try again in a bit" },
      { status: 429 }
    );
  }

// --- Moderation layer 3: gibberish check (free) ---

const looksFake = (s: string) => {
  const text = s.toLowerCase();
  return !/[aeiou]/.test(text) || /([a-z])\1{4,}/.test(text);
};

if (looksFake(eventName) || looksFake(food)) {
  return NextResponse.json(
    { error: "Please enter a real event name and food" },
    { status: 400 }
  );
}

  // --- Moderation layer 4: AI content check (costs an API call) ---

  const check = await moderateSubmission({ eventName, food, description, host });

  if (check && check.isAbusive) {
    return NextResponse.json(
      { error: "That submission can't be posted" },
      { status: 400 }
    );
  }

  if (check && !check.isPlausibleFoodEvent) {
    return NextResponse.json(
      { error: "That doesn't look like a free food event" },
      { status: 400 }
    );
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