import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { chromium } from "playwright";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const shiftMs = now.getTime() - TEST_ANCHOR_DATE.getTime();

const cleanedDate = cleanDateText(dateText);
const parsedDate = new Date(`${cleanedDate}, 2026`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateText;
  }

  const shiftedDate = new Date(parsedDate.getTime() + shiftMs);

  return shiftedDate.toISOString().split("T")[0];
}

function cleanDateText(dateText: string) {
  return dateText
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, "$1")
    .replace(/Monday,|Tuesday,|Wednesday,|Thursday,|Friday,|Saturday,|Sunday,/gi, "")
    .trim();
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

Do not guess.

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
  "building": string | null,
  "startDate": string | null,
  "endDate": string | null,
  "isContinuous": boolean | null,
  "startTime": string | null,
  "endTime": string | null,
  "confidence": number
}

Rules:
- confidence must be an integer from 0 to 100
- isFoodEvent must always be true or false
- confidence should reflect how certain you are that the extracted information is correct
- If the event is one day, startDate and endDate should be the same.
- If it spans multiple days continuously, isContinuous should be true.
- If it repeats daily at the same time, isContinuous should be false.
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
          console.log("WOULD SAVE TO SUPABASE:");
            console.log({
      ...parsedResult,
      sourceUrl: link,
      clubHandle: handle,
    });
        }


    }
  }

  await browser.close();
}

main();