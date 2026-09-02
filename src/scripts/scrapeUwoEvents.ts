import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getLocalDateKey } from "@/lib/dateUtils";
import { buildings } from "@/data/buildings";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FEED_URL = "https://www.uwo.ca/events/_data/current-live.json";

const VALID_BUILDING_IDS = Object.keys(buildings);

const foodKeywords = [
  "food", "pizza", "snack", "coffee", "donut", "refreshment",
  "lunch", "dinner", "breakfast", "cookie", "boba", "pancake",
  "tea", "bagel", "dessert", "treat", "samosa", "candy",
  "popcorn", "catered", "provided", "bbq", "reception", "barbecue",
];

const STUDENT_AUDIENCES = [
  "Undergraduate Students",
  "Graduate Students",
  "Professional Students",
  "General Public",
];

type PostOutcome =
  | "no_caption"
  | "no_keyword"
  | "parse_failed"
  | "invalid_building"
  | "rejected"
  | "saved";

const TERMINAL_OUTCOMES: PostOutcome[] = ["no_keyword", "rejected", "saved"];
const MAX_RETRIES = 3;

type RunCounters = {
  postsVisited: number;
  captionsExtracted: number;
  aiCalls: number;
  eventsSaved: number;
  errors: number;
};

// ---------------------------------------------------------------------------
// Feed types
// ---------------------------------------------------------------------------

type AdditionDetail = {
  icon?: string;
  text?: string;
  link?: string;
};

type FeedEvent = {
  id: string;
  title: string;
  url: string;
  startDate: string;
  endDate: string;
  description?: string;
  allDay?: string;
  additionDetails?: AdditionDetail[];
  contactDetails?: { name?: string; phone?: string; email?: string };
  filter1?: string[];
  filter4?: string[];
  filter5?: string[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// The feed is full of HTML entities (&#8220; &apos; &#8211; &amp;).
// Storing them raw means cards render literal "&apos;".
function decodeEntities(input: string): string {
  if (!input) return "";

  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function getDetail(event: FeedEvent, iconFragment: string): string {
  const match = event.additionDetails?.find((d) =>
    d.icon?.includes(iconFragment)
  );
  return decodeEntities(match?.text ?? "");
}

function getLocationText(event: FeedEvent) {
  return getDetail(event, "map-marker-alt");
}

function getCostText(event: FeedEvent) {
  return [getDetail(event, "dollar-sign"), getDetail(event, "ticket-alt")]
    .filter(Boolean)
    .join(" | ");
}

function isOnlineOnly(locationText: string) {
  const text = locationText.toLowerCase();
  if (!text) return false;
  if (text.includes("in-person") || text.includes("in person")) return false;
  return (
    text.includes("zoom") ||
    text.includes("online") ||
    text.includes("virtual") ||
    text.includes("teams")
  );
}

function isForStudents(event: FeedEvent) {
  if (!event.filter4?.length) return true; // no audience listed: don't exclude
  return event.filter4.some((a) => STUDENT_AUDIENCES.includes(a));
}

// "2026-09-04T18:00-0400" -> { date: "2026-09-04", time: "18:00" }
// Split the string directly rather than using Date(), so the university's
// own local time is preserved regardless of where this runs.
function splitFeedTimestamp(value: string) {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return null;
  return { date: match[1], time: match[2] };
}

function matchBuildingId(locationText: string): string | null {
  if (!locationText) return null;
  const text = locationText.toLowerCase();

  for (const [id, building] of Object.entries(buildings)) {
    const candidates = [
      building.name.toLowerCase(),
      building.shortName.toLowerCase(),
      ...building.aliases.map((a) => a.toLowerCase()),
    ];

    if (candidates.some((c) => c.length > 2 && text.includes(c))) {
      return id;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Shared tables (same ones the Instagram scraper uses)
// ---------------------------------------------------------------------------

async function recordPost(
  sourceUrl: string,
  handle: string,
  outcome: PostOutcome
) {
  const isRetryable = !TERMINAL_OUTCOMES.includes(outcome);
  let retryCount = 0;

  if (isRetryable) {
    const { data } = await supabase
      .from("scraped_posts")
      .select("retry_count")
      .eq("source_url", sourceUrl)
      .maybeSingle();

    retryCount = (data?.retry_count ?? 0) + 1;
  }

  const { error } = await supabase.from("scraped_posts").upsert(
    {
      source_url: sourceUrl,
      handle,
      outcome,
      retry_count: retryCount,
      scraped_at: new Date().toISOString(),
    },
    { onConflict: "source_url" }
  );

  if (error) console.log("Could not record post:", error.message);
}

async function getScrapedUrls(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("scraped_posts")
    .select("source_url, outcome, retry_count");

  if (error || !data) {
    console.log("Could not fetch scraped URLs:", error?.message);
    return new Set();
  }

  const skip = data.filter(
    (row) =>
      TERMINAL_OUTCOMES.includes(row.outcome) || row.retry_count >= MAX_RETRIES
  );

  return new Set(skip.map((row) => row.source_url));
}

async function startRun(): Promise<string | null> {
  const { data, error } = await supabase
    .from("scrape_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (error || !data) {
    console.log("Could not start run record:", error?.message);
    return null;
  }
  return data.id;
}

async function finishRun(
  runId: string | null,
  status: "success" | "partial" | "failed",
  counters: RunCounters,
  errorSummary?: string
) {
  if (!runId) return;

  const { error } = await supabase
    .from("scrape_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      posts_visited: counters.postsVisited,
      captions_extracted: counters.captionsExtracted,
      ai_calls: counters.aiCalls,
      events_saved: counters.eventsSaved,
      errors: counters.errors,
      error_summary: errorSummary ?? null,
    })
    .eq("id", runId);

  if (error) console.log("Could not finish run record:", error.message);
}

async function saveEventToSupabase(
  parsedResult: any,
  sourceUrl: string,
  hostName: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): Promise<"saved" | "duplicate" | "error"> {
  const eventToInsert = {
    event_name: parsedResult.eventName,
    food: parsedResult.food,
    category: parsedResult.category ?? "meal",
    building: parsedResult.building,
    description: parsedResult.description,
    // Dates and times come from the feed, not the model. The feed is
    // authoritative and structured; there's no reason to let the AI guess.
    start_date: startDate,
    end_date: endDate,
    start_time: startTime,
    end_time: endTime,
    is_continuous: startDate !== endDate,
    source_url: sourceUrl,
    host: hostName,
    is_verified: false,
  };

  const { data, error } = await supabase
    .from("food_events")
    .insert(eventToInsert)
    .select();

  if (error) {
    if (error.code === "23505") {
      console.log("Duplicate skipped:", sourceUrl);
      return "duplicate";
    }
    console.log("Supabase save error:", error.message);
    return "error";
  }

  console.log("Saved to Supabase:", data?.[0]);
  return "saved";
}

// ---------------------------------------------------------------------------
// AI analysis
// ---------------------------------------------------------------------------

async function analyzeEvent(fields: {
  title: string;
  description: string;
  locationText: string;
  costText: string;
  department: string;
  sourceUrl: string;
}) {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
You are helping Timbi, a free food and drink event finder for students at
Western University.

This event came from Western's official events calendar. Decide whether
students attending would get free food or drinks.

Title: ${fields.title}
Description: ${fields.description}
Location: ${fields.locationText}
Cost info: ${fields.costText}
Department: ${fields.department}
Source: ${fields.sourceUrl}

Return ONLY valid JSON, no markdown fences:

{
  "isFoodEvent": boolean,
  "isFree": boolean | null,
  "eventName": string | null,
  "food": string | null,
  "category": "pizza" | "coffee" | "meal" | "snack" | "drink" | "baked" | null,
  "building": string | null,
  "description": string | null,
  "confidence": number
}

Rules:

isFoodEvent
- true only if food or drinks are available TO ATTENDEES
- false if food is only the topic of the event, or if the "free" applies to
  admission rather than to food. "Free - no tickets required" on a concert
  means free entry, NOT free food. That is isFoodEvent: false.

isFree
- true if food/drinks are explicitly free or clearly provided by the host
- false if attendees must pay for the food
- null if impossible to determine

eventName
- a short, student-facing name. Keep the original title unless it is very long.

food
- what is actually available, in a few words. null if unknown.

category
- pizza = pizza or slices
- coffee = coffee, latte, espresso
- baked = cookies, donuts, muffins, pastries, cake, brownies
- drink = tea, boba, juice, pop, refreshments if mostly drinks
- snack = chips, candy, popcorn, fruit, light refreshments
- meal = lunch, dinner, breakfast, sandwiches, full meal
If unclear but food is present, use "meal".

building
- must be one of the allowed building IDs below, or null
- match on the Location text
- return null if the location does not clearly match one of these
- never invent an ID

Allowed building IDs:
${VALID_BUILDING_IDS.join(", ")}

description
- one short friendly line for Timbi, max 120 characters
- no emojis, do not invent details

confidence
- integer 0 to 100, how sure you are that a student would actually get free
  food or drink at this event
`,
  });

  return response.output_text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const runId = await startRun();

  const counters: RunCounters = {
    postsVisited: 0,
    captionsExtracted: 0,
    aiCalls: 0,
    eventsSaved: 0,
    errors: 0,
  };

  let fatalError: unknown = null;

  try {
    const scrapedUrls = await getScrapedUrls();
    console.log(`Already scraped: ${scrapedUrls.size} urls`);

    const res = await fetch(FEED_URL);
    if (!res.ok) {
      throw new Error(`Feed request failed: ${res.status}`);
    }

    const feed = await res.json();
    const allEvents: FeedEvent[] = feed.events ?? [];
    console.log(`Feed returned ${allEvents.length} events`);

    const today = getLocalDateKey();

    for (const event of allEvents) {
      try {
        const sourceUrl = event.url;
        if (!sourceUrl) continue;
        if (scrapedUrls.has(sourceUrl)) continue;

        const start = splitFeedTimestamp(event.startDate);
        const end = splitFeedTimestamp(event.endDate);

        if (!start) continue;

        // The feed includes the previous month, so most entries are in the past.
        if (start.date < today) continue;

        if (!isForStudents(event)) continue;

        const locationText = getLocationText(event);
        if (isOnlineOnly(locationText)) continue;

        counters.postsVisited++;

        const title = decodeEntities(event.title ?? "");
        const description = decodeEntities(event.description ?? "");
        const costText = getCostText(event);
        const department = decodeEntities(event.filter5?.join(", ") ?? "");

        if (!title) {
          await recordPost(sourceUrl, "uwo-events", "no_caption");
          continue;
        }
        counters.captionsExtracted++;

        const haystack = `${title} ${description} ${costText}`;
        const matchedKeyword = foodKeywords.find((word) =>
          new RegExp(`\\b${word}s?\\b`, "i").test(haystack)
        );

        if (!matchedKeyword) {
          await recordPost(sourceUrl, "uwo-events", "no_keyword");
          continue;
        }

        console.log("\n======================");
        console.log("EVENT:", title);
        console.log("URL:", sourceUrl);
        console.log("LOCATION:", locationText);
        console.log("COST:", costText);
        console.log("Matched keyword:", matchedKeyword);

        counters.aiCalls++;
        const aiResult = await analyzeEvent({
          title,
          description,
          locationText,
          costText,
          department,
          sourceUrl,
        });

        console.log("AI RESULT:", aiResult);

        let parsedResult;
        try {
          parsedResult = JSON.parse(
            aiResult.replace(/```json|```/g, "").trim()
          );
        } catch {
          console.log("Could not parse AI result as JSON");
          await recordPost(sourceUrl, "uwo-events", "parse_failed");
          continue;
        }

        const passesCriteria =
          parsedResult.isFoodEvent &&
          parsedResult.isFree !== false &&
          parsedResult.confidence >= 80;

        if (!passesCriteria) {
          console.log("Skipping: failed save criteria");
          await recordPost(sourceUrl, "uwo-events", "rejected");
          continue;
        }

        // Prefer our own string match on the location text; fall back to the
        // model's guess only if ours found nothing.
        const buildingId =
          matchBuildingId(locationText) ??
          (VALID_BUILDING_IDS.includes(parsedResult.building)
            ? parsedResult.building
            : null);

        if (!buildingId) {
          console.log("Skipping: no building match for", locationText);
          await recordPost(sourceUrl, "uwo-events", "invalid_building");
          continue;
        }

        const saveResult = await saveEventToSupabase(
          { ...parsedResult, building: buildingId },
          sourceUrl,
          decodeEntities(
            event.contactDetails?.name || event.filter5?.[0] || "Western University"
          ),
          start.date,
          end?.date && end.date >= start.date ? end.date : start.date,
          start.time,
          end?.time ?? start.time
        );

        if (saveResult === "saved") {
          await recordPost(sourceUrl, "uwo-events", "saved");
          counters.eventsSaved++;
        } else if (saveResult === "duplicate") {
          await recordPost(sourceUrl, "uwo-events", "saved");
        } else {
          // Record nothing so it retries next run.
          counters.errors++;
          console.log("Save failed, will retry next run:", sourceUrl);
        }
      } catch (err) {
        counters.errors++;
        console.log(
          "Event failed:",
          event.url,
          err instanceof Error ? err.message : err
        );
        continue;
      }
    }

    console.log(`\n=== RUN SUMMARY ===`);
    console.log(`Events considered: ${counters.postsVisited}`);
    console.log(`Titles read:       ${counters.captionsExtracted}`);
    console.log(`AI calls:          ${counters.aiCalls}`);
    console.log(`Events saved:      ${counters.eventsSaved}`);
    console.log(`Errors:            ${counters.errors}`);
  } catch (err) {
    fatalError = err;
    throw err;
  } finally {
    const status = fatalError
      ? "failed"
      : counters.errors > 0
      ? "partial"
      : "success";

    await finishRun(
      runId,
      status,
      counters,
      fatalError instanceof Error ? fatalError.message : undefined
    );
  }
}

main().catch((error) => {
  console.error("UWO events scraper failed:", error);
  process.exitCode = 1;
});