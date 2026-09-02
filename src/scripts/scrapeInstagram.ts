import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { chromium, type Page } from "playwright";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getLocalDateKey } from "@/lib/dateUtils";
import { buildings } from "@/data/buildings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const clubHandles = [
  "westernusc_events",
  "healthscisophs",
  "pangea.uwo",
  "uwowicsa",
  "ueo.bioethicssociety",
  "speakwestern",
  "westerndebate",
  "caisawestern",
  "bsawestern",
  "westernboardgamesclub",
  "uwoteaclub",
  "westernfoodies",
];

const foodKeywords = [
  "food", "pizza", "snack", "coffee", "donut", "refreshment",
  "lunch", "dinner", "breakfast", "cookie", "boba", "pancake",
  "tea", "bagel", "dessert", "treat", "samosa", "candy",
  "popcorn", "catered", "provided", "bbq",
];

const TEST_MODE = process.env.TEST_MODE === "true";
const TEST_ANCHOR_DATE = new Date("2026-03-18");

const VALID_BUILDING_IDS = Object.keys(buildings);

type PostOutcome =
  | "no_caption"
  | "no_keyword"
  | "parse_failed"
  | "invalid_building"
  | "rejected"
  | "saved";

// Outcomes that are final. Anything not listed here gets retried next run:
// no_caption (page may not have loaded), parse_failed (AI hiccup),
// invalid_building (may become valid when buildings.ts grows).
const TERMINAL_OUTCOMES: PostOutcome[] = ["no_keyword", "rejected", "saved"];

const AUTH_ERROR = "Instagram authentication required";

function shiftDateForTestMode(dateText: string | null) {
  if (!TEST_MODE || !dateText) return dateText;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const anchor = new Date(TEST_ANCHOR_DATE);
  anchor.setHours(0, 0, 0, 0);

  const shiftMs = now.getTime() - anchor.getTime();

  let parsedDate = new Date(`${dateText}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    const cleanedDate = cleanDateText(dateText);
    parsedDate = new Date(`${cleanedDate}, 2026`);
  }

  if (Number.isNaN(parsedDate.getTime())) return dateText;

  const shiftedDate = new Date(parsedDate.getTime() + shiftMs);
  return getLocalDateKey(shiftedDate);
}

function cleanDateText(dateText: string) {
  return dateText
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1")
    .replace(
      /Monday,|Tuesday,|Wednesday,|Thursday,|Friday,|Saturday,|Sunday,/gi,
      ""
    )
    .trim();
}

// Instagram does not redirect logged-out profile views to /accounts/login
// (it shows a modal instead), so that check is mostly inert. /challenge is
// the one that does redirect, and it means the account is blocked.
function assertInstagramSession(page: Page) {
  const currentUrl = page.url();

  if (
    currentUrl.includes("/challenge") ||
    currentUrl.includes("/accounts/login")
  ) {
    throw new Error(`${AUTH_ERROR}: ${currentUrl}`);
  }
}

function isAuthError(err: unknown) {
  return err instanceof Error && err.message.includes(AUTH_ERROR);
}

function extractCaption(bodyText: string, handle: string) {
  const lines = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleIndex = lines.findIndex((line, index) => {
    return (
      line === handle &&
      (lines[index + 1]?.match(/^\d+[smhdw]$/) ||
        lines[index + 2]?.match(/^\d+[smhdw]$/))
    );
  });

  if (handleIndex === -1) return "";

  const startIndex = lines[handleIndex + 1]?.match(/^\d+[smhdw]$/)
    ? handleIndex + 2
    : handleIndex + 3;

  const captionLines: string[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    if (
      lines[i + 1]?.match(/^\d+[smhdw]$/) ||
      line.match(/^\d+[smhdw]$/) ||
      line === "Reply" ||
      line.includes("likes") ||
      line.includes("Liked by") ||
      line.includes("More posts from") ||
      line === "Meta"
    ) {
      break;
    }

    captionLines.push(line);
  }

  return captionLines.join("\n");
}

async function analyzePost(caption: string, sourceUrl: string) {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: `
You are helping Timbi, a university free food and drink event finder.

Your job is to determine whether an Instagram post describes a Timbi event.

A Timbi event is an event where food or drinks are available to attendees.

Food/drinks include:
- pizza
- snacks
- coffee
- tea
- boba
- refreshments
- desserts
- meals
- breakfast
- lunch
- dinner

Determine:

1. isFoodEvent
- true if food or drinks are available at the event
- false if the post is unrelated to food/drinks

2. isFree
- true if the food/drinks are explicitly free OR clearly implied to be provided by the event
  Examples:
  - "free pizza"
  - "pizza provided"
  - "join us for tea"
  - "refreshments available"
  - "coffee and donuts will be served"

- false if the post clearly requires payment, tickets, registration fees, purchase, or admission to receive the food/drinks

- null if it is impossible to determine

3. Extract event information.

If information is not present, return null.
Do not invent information that is not present in the caption.
You may infer the year as 2026 when a month and day are provided.

Caption:
${caption}

Source URL:
${sourceUrl}

Return ONLY valid JSON:

{
  "isFoodEvent": boolean,
  "isFree": boolean | null,
  "eventName": string | null,
  "food": string | null,
  "category": "pizza" | "coffee" | "meal" | "snack" | "drink" | "baked" | null,
  "building": string | null,
  "startDate": string,
  "endDate": string | null,
  "description": string | null,
  "isContinuous": boolean | null,
  "startTime": string | null,
  "endTime": string | null,
  "confidence": number
}

General Rules:
- confidence must be an integer from 0 to 100
- isFoodEvent must always be true or false
- confidence should reflect how certain you are that the extracted information is correct
- If the event is one day, startDate and endDate should be the same.
- If it spans multiple days continuously, isContinuous should be true.
- If it repeats daily at the same time, isContinuous should be false.

Category Rules:
- pizza = pizza or slices
- coffee = coffee, latte, espresso
- baked = cookies, donuts, muffins, pastries, cake, brownies
- drink = tea, boba, juice, pop, soda, water, refreshments if mostly drinks
- snack = chips, candy, popcorn, fruit, snacks, light refreshments
- meal = lunch, dinner, breakfast, sandwiches, wraps, burgers, shawarma, sushi, pasta, full meal
If multiple categories apply, choose the most specific/main one.
If unclear but food/drinks are present, use "meal".

Building Rules:
- building must be one of the allowed building IDs or null.
- Never return a building name that is not one of the allowed IDs.
- If the location clearly matches one of these buildings, return the matching building ID.
- If the location does not clearly match one of these buildings, return null.

Allowed building IDs:
- aceb = Amit Chakma Engineering Building, ACEB, engineering building, eng building
- spencer = Spencer Engineering Building, SEB
- ues = UES Lounge, Undergraduate Engineering Society
- weldon = Weldon Library
- ucc = University Community Centre, UCC, Mustang Lounge, Mustang Lounge West
- natSci = Natural Sciences Centre, NSC, Nat Sci
- taylor = Taylor Library
- socialSci = Social Science Centre, SSC, Social Sci
- somerville = Somerville House, Somerville Hall
- rec = Recreation Centre, Rec Centre
- thames = Thames Hall, Thames Hall Atrium
- ncb = North Campus Building, NCB
- talbot = Talbot College, TC
- uc = University College, UC
- ivey = Richard Ivey Building, Ivey Building, Ivey
- hsb = Health Sciences Building, Labatt Health Sciences Building
- msb = Medical Sciences Building
- pab = Physics and Astronomy Building
- mb = Music Building
- vac = Visual Arts Centre
- kresge = Kresge Building, Kresge Auditorium
- morrissette = Ronald D. Schmeichel Building, Schmeichel, Morrissette, entrepreneurship building
- middlesex = Middlesex College, MC
- alumni = Alumni Hall
- chem = Chemistry Building
- bgs = Biological and Geological Sciences Building, BGS
- fnb = FIMS and Nursing Building, FNB
- stevenson = Stevenson Hall
- lawson = Lawson Hall
- ahb = Arts and Humanities Building
- elborn = Elborn College
- threeM = 3M Centre
- law = Law Building, Josephine Spencer Niblett Law Building
- alumniStadium = Western Student Alumni Stadium, TD Stadium
- saugeen = Saugeen-Maitland Hall, Saugeen
- ontarioHall = Ontario Hall
- delaware = Delaware Hall
- perth = Perth Hall
- essex = Essex Hall
- londonHall = London Hall
- medSyd = Medway-Sydenham Hall, Med-Syd
- elgin = Elgin Hall
- bayfield = Bayfield Hall

Date Rules:
- The current year is 2026.
- If the caption gives a month and day but no year, assume 2026.
- Convert dates to YYYY-MM-DD format.
- Example: "March 18" -> "2026-03-18"
- Example: "July 12-14" -> startDate "2026-07-12" and endDate "2026-07-14"
- If the event is one day, startDate and endDate should be the same.
- Only return null if no date is mentioned.

Time rules:
- startTime and endTime must be in 24-hour HH:MM format.
- Examples:
  - 4pm -> "16:00"
  - 7pm -> "19:00"
  - 11:30am -> "11:30"


Description rules:
- Write a short friendly Timbi description for the event.
- Do not invent details.
- Do not use emojis.
- Max 120 characters.
`,
  });

  return response.output_text;
}
const MAX_RETRIES = 3;

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

type RunCounters = {
  postsVisited: number;
  captionsExtracted: number;
  aiCalls: number;
  eventsSaved: number;
  errors: number;
};

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
  status: "success" | "partial" | "failed_auth" | "failed",
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
  clubHandle: string
): Promise<"saved" | "duplicate" | "error"> {
  const eventToInsert = {
    event_name: parsedResult.eventName,
    food: parsedResult.food,
    category: parsedResult.category ?? "meal",
    building: parsedResult.building,
    description: parsedResult.description,
    start_date: parsedResult.startDate,
    end_date: parsedResult.endDate,
    start_time: parsedResult.startTime,
    end_time: parsedResult.endTime,
    is_continuous: parsedResult.isContinuous ?? false,
    source_url: sourceUrl,
    host: `@${clubHandle}`,
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


async function main() {
  const browser = await chromium.launch({ headless: false });
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
    console.log(`Already scraped: ${scrapedUrls.size} posts`);

    const context = await browser.newContext({
      storageState: "instagram-session.json",
    });

    const page = await context.newPage();

    for (const handle of clubHandles) {
      let handlePosts = 0;
      let handleCaptions = 0;

      try {
        console.log(`\nScraping @${handle}`);

        await page.goto(`https://www.instagram.com/${handle}/`, {
          waitUntil: "domcontentloaded",
        });
        assertInstagramSession(page);

        await page.waitForTimeout(5000);

        const allLinks = await page
          .locator('a[href*="/p/"], a[href*="/reel/"]')
          .evaluateAll((els) =>
            els.slice(0, 6).map((a) => (a as HTMLAnchorElement).href)
          );

        const postLinks = allLinks.filter((l) => !scrapedUrls.has(l));

        console.log(`Found ${allLinks.length} posts, ${postLinks.length} new`);

        for (const link of postLinks) {
          try {
            await page.goto(link, { waitUntil: "domcontentloaded" });
            assertInstagramSession(page);
            await page.waitForTimeout(4000);
            handlePosts++;

            const bodyText = await page
              .locator("body")
              .innerText()
              .catch(() => "");

            const caption = extractCaption(bodyText, handle);

            const imageUrls = await page
              .locator("img")
              .evaluateAll((imgs) =>
                imgs
                  .map((img) => (img as HTMLImageElement).src)
                  .filter(
                    (src) =>
                      src.includes("cdninstagram") &&
                      !src.includes("s150x150") &&
                      !src.includes("t51.89012-19") &&
                      !src.includes("t51.2885-19")
                  )
              )
              .catch(() => []);

            if (!caption) {
              console.log("Skipping: no caption");
              await recordPost(link, handle, "no_caption");
              continue;
            }
            handleCaptions++;

            const matchedKeyword = foodKeywords.find((word) =>
              new RegExp(`\\b${word}s?\\b`, "i").test(caption)
            );

            if (!matchedKeyword) {
              console.log("Skipping AI: no food keywords");
              await recordPost(link, handle, "no_keyword");
              continue;
            }

            console.log("Matched food keyword:", matchedKeyword);

            console.log("\n======================");
            console.log("POST:", link);
            console.log("CAPTION:", caption);
            console.log("IMAGES:", imageUrls.slice(0, 3));

            counters.aiCalls++;
            const aiResult = await analyzePost(caption, link);

            console.log("AI RESULT:");
            console.log(aiResult);

            let parsedResult;

            try {
              parsedResult = JSON.parse(aiResult);
            } catch {
              console.log("Could not parse AI result as JSON");
              await recordPost(link, handle, "parse_failed");
              continue;
            }

            if (TEST_MODE) {
              parsedResult.startDate = shiftDateForTestMode(
                parsedResult.startDate
              );
              parsedResult.endDate = shiftDateForTestMode(parsedResult.endDate);
            }

            // Criteria check runs BEFORE the building check so that non-events
            // and paid events get the terminal "rejected" outcome instead of
            // the retryable "invalid_building" one.
            const passesCriteria =
              parsedResult.isFoodEvent &&
              parsedResult.isFree !== false &&
              parsedResult.confidence >= 90;

            if (!passesCriteria) {
              console.log("Skipping: failed save criteria");
              await recordPost(link, handle, "rejected");
              continue;
            }

            if (!VALID_BUILDING_IDS.includes(parsedResult.building)) {
              console.log("Skipping: invalid building", parsedResult.building);
              await recordPost(link, handle, "invalid_building");
              continue;
            }

            const saveResult = await saveEventToSupabase(
              parsedResult,
              link,
              handle
            );

            if (saveResult === "saved") {
              await recordPost(link, handle, "saved");
              counters.eventsSaved++;
            } else if (saveResult === "duplicate") {
              await recordPost(link, handle, "saved");
            } else {
              // Record nothing: the DB write failed, so this post stays out of
              // scraped_posts and gets retried next run.
              counters.errors++;
              console.log("Save failed, will retry next run:", link);
            }
          } catch (err) {
            if (isAuthError(err)) throw err;
            counters.errors++;
            console.log(
              "Post failed:",
              link,
              err instanceof Error ? err.message : err
            );
            continue;
          }
        }

        console.log(`@${handle}: ${handleCaptions}/${handlePosts} captions`);
      } catch (err) {
        if (isAuthError(err)) throw err;
        counters.errors++;
        console.log("Handle failed:", handle, err);
        continue;
      } finally {
        counters.postsVisited += handlePosts;
        counters.captionsExtracted += handleCaptions;
      }
    }

    console.log(`\n=== RUN SUMMARY ===`);
    console.log(`Posts visited:      ${counters.postsVisited}`);
    console.log(`Captions extracted: ${counters.captionsExtracted}`);
    console.log(`AI calls:           ${counters.aiCalls}`);
    console.log(`Events saved:       ${counters.eventsSaved}`);
    console.log(`Errors:             ${counters.errors}`);

    if (counters.postsVisited >= 10 && counters.captionsExtracted === 0) {
      throw new Error(
        "session expired: zero captions extracted across entire run"
      );
    }
  } catch (err) {
    fatalError = err;
    throw err;
  } finally {
    let status: "success" | "partial" | "failed_auth" | "failed" = "success";

    if (fatalError) {
      status = isAuthError(fatalError) ? "failed_auth" : "failed";
    } else if (counters.errors > 0) {
      status = "partial";
    }

    await finishRun(
      runId,
      status,
      counters,
      fatalError instanceof Error ? fatalError.message : undefined
    );
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Scraper failed:", error);
  process.exitCode = 1;
});