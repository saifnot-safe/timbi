import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/");

  console.log("Log in manually, then press Enter here.");

  await new Promise((resolve) => process.stdin.once("data", resolve));

  await page.context().storageState({
    path: "instagram-session.json",
  });

  await browser.close();
}

main();