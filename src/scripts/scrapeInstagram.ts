import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { chromium } from "playwright";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  "westernfoodies"
];

const foodKeywords = [

  "food",
  "pizza",
  "snacks",
  "coffee",
  "donuts",
  "refreshments",
  "lunch",
  "dinner",
  "breakfast",
  "cookies",
  "boba",
  "pancakes",
];

const TEST_MODE = true;
const TEST_ANCHOR_DATE = new Date("2026-03-18");

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
  return shiftedDate.toISOString().split("T")[0];
}

function cleanDateText(dateText: string) {
  return dateText
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1")
    .replace(/Monday,|Tuesday,|Wednesday,|Thursday,|Friday,|Saturday,|Sunday,/gi, "")
    .trim();
}

function addHours(time: string, hours: number) {
  const [h, m] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setHours(date.getHours() + hours);

  return date.toTimeString().slice(0, 5);
}

function extractCaption(bodyText: string, handle: string) {
  const lines = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleIndex = lines.findIndex((line, index) => {
    return (
      line === handle &&
      (
        lines[index + 1]?.match(/^\d+[smhdw]$/) ||
        lines[index + 2]?.match(/^\d+[smhdw]$/)
      )
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

async function analyzePost(
  caption: string,
  imageUrls: string[],
  sourceUrl: string
) {
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
`
  });

  return response.output_text;
}

function shouldUseVision(caption: string, imageUrls: string[]) {
  const text = caption.toLowerCase();

  const eventWords = [
    "join us",
    "event",
    "night",
    "social",
    "mixer",
    "workshop",
    "meeting",
    "gbm",
    "info session",
    "agm"
  ];

  const foodWords = [
    "food",
    "pizza",
    "snacks",
    "coffee",
    "donuts",
    "refreshments",
    "lunch",
    "dinner",
    "breakfast",
    "cookies",
  ];

  if (imageUrls.length === 0) return false;
  if (!caption) return true;

  return (
    eventWords.some((word) => text.includes(word)) ||
    foodWords.some((word) => text.includes(word))
  );
}

async function saveEventToSupabase(parsedResult: any, sourceUrl: string, clubHandle: string) {
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
    .upsert(eventToInsert, {
      onConflict: "source_url",
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    console.log("Supabase save error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("Duplicate skipped:", sourceUrl);
    return;
  }

  console.log("Saved to Supabase:", data[0]);
}

async function main() {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    storageState: "instagram-session.json",
  });

  const page = await context.newPage();

  for (const handle of clubHandles) {
    console.log(`\nScraping @${handle}`);

    await page.goto(`https://www.instagram.com/${handle}/`, {
      waitUntil: "networkidle",
    });

    await page.waitForTimeout(5000);

    const postLinks = await page
      .locator('a[href*="/p/"], a[href*="/reel/"]')
      .evaluateAll((els) =>
        els.slice(0, 6).map((a) => (a as HTMLAnchorElement).href)
      );

    console.log(`Found ${postLinks.length} posts`);

    for (const link of postLinks) {
      await page.goto(link, { waitUntil: "networkidle" });
      await page.waitForTimeout(4000);

      const bodyText = await page.locator("body").innerText().catch(() => "");

      const caption = extractCaption(bodyText, handle);

      const imageUrls = await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .map((img) => (img as HTMLImageElement).src)
            .filter((src) =>
                    src.includes("cdninstagram") &&
                    !src.includes("s150x150") &&
                    !src.includes("t51.89012-19") &&
                    !src.includes("t51.2885-19")
                  )
        )
        .catch(() => []);

        if (!caption) {
        console.log("Skipping: no caption");
        continue;
      }

    const matchedKeyword = foodKeywords.find((word) =>
   new RegExp(`\\b${word}\\b`, "i").test(caption)
);

if (!matchedKeyword) {
  console.log("Skipping AI: no food keywords");
  continue;
}

console.log("Matched food keyword:", matchedKeyword);

      console.log("\n======================");
      console.log("POST:", link);
      console.log("CAPTION:", caption || "[no caption found]");
      console.log("IMAGES:", imageUrls.slice(0, 3));

       const aiResult = await analyzePost(
        caption,
        imageUrls,
        link
      );

      console.log("AI RESULT:");
      console.log(aiResult);
     let parsedResult;

      try {
        parsedResult = JSON.parse(aiResult);
      } catch {
        console.log("Could not parse AI result as JSON");
        continue;
      }

      if (TEST_MODE) {
        parsedResult.startDate = shiftDateForTestMode(parsedResult.startDate);
        parsedResult.endDate = shiftDateForTestMode(parsedResult.endDate);
      }
      if (
          parsedResult.isFoodEvent &&
          parsedResult.isFree !== false &&
          parsedResult.confidence >= 90
        ) {
          
          await saveEventToSupabase(parsedResult, link, handle);
        }


    }
  }

  await browser.close();
}

main();