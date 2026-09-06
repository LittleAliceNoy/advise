import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const APP_URL = process.env.ADVISE_APP_URL || "http://localhost:3000/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 1 };
const SLIDES = [
  "signal", "clinical-problem", "therapeutic-goal", "systemic-strategies",
  "question", "evidence-gap", "chapter-methods", "study-design", "screening", "randomization",
  "treatment", "tapering", "followup", "outcomes", "statistics-sample-only",
  "statistics-redesign", "chapter-results", "participant-flow", "baseline-portrait",
  "treatment-results-redesign", "results", "discontinuation", "ocular-results",
  "systemic-safety-tolerability", "quality-of-life-results", "chapter-discussion", "limitations-4",
  "discussion-safety", "limitations-1", "limitations-2", "limitations-3",
  "limitations-5", "limitations-6", "conclusion", "outcomes-original",
  "secondary-outcomes-redesign", "tapering-cinematic",
];
const slidesArg = process.argv.find((arg) => arg.startsWith("--slides="));
const selectedSlides = slidesArg
  ? slidesArg.slice("--slides=".length).split(",").map((id) => id.trim()).filter(Boolean)
  : SLIDES;
const outDir = path.join(process.cwd(), "tmp", "projection-readability-qa");

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settle(page, slideId) {
  await page.evaluate(async (id) => {
    window.__INSTANT_CHART__ = true;
    window.__REVEAL_ALL_SLIDES__?.();
    window.__PREPARE_SLIDE__?.(id);
    const deck = document.querySelector(".deck");
    const slide = document.getElementById(id);
    if (deck && slide) deck.scrollTop = slide.offsetTop;
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.complete
      ? Promise.resolve()
      : new Promise((resolve) => image.addEventListener("load", resolve, { once: true }))));
  }, slideId);
  await pause(170);
  const top = await page.evaluate((id) => {
    const deck = document.querySelector(".deck");
    const slide = document.getElementById(id);
    if (!deck || !slide) return null;
    deck.scrollTop = slide.offsetTop;
    return slide.getBoundingClientRect().top;
  }, slideId);
  if (top === null || Math.abs(top) > 2) throw new Error(`Could not align ${slideId}: ${top}`);
  if (slideId === "outcomes") {
    await page.evaluate(() => {
      const slide = document.getElementById("outcomes");
      slide?.click();
      slide?.click();
      slide?.click();
    });
    await pause(170);
  }
}

if (!slidesArg) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars", "--window-size=1920,1080"],
});
try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.emulateMediaType("screen");
  await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".deck", { timeout: 15000 });
  await page.waitForFunction(() => window.__IS_HYDRATED__ === true && typeof window.__PREPARE_SLIDE__ === "function", { timeout: 15000 });
  await page.addStyleTag({ content: `
    html, body { width:1920px !important; height:1080px !important; overflow:hidden !important; }
    .deck { width:1920px !important; height:1080px !important; overflow-y:auto !important; scroll-snap-type:none !important; scroll-behavior:auto !important; }
    .scene { width:1920px !important; min-height:1080px !important; height:1080px !important; }
    *, *::before, *::after { animation-duration:.001s !important; animation-delay:0s !important; transition-duration:0s !important; scroll-behavior:auto !important; }
    #signal .cosmic-eye::after { animation:none !important; transform:translateY(-100%) !important; }
  ` });
  for (const id of selectedSlides) {
    const index = SLIDES.indexOf(id);
    if (index < 0) throw new Error(`Unknown slide id: ${id}`);
    await settle(page, id);
    await page.screenshot({
      path: path.join(outDir, `${String(index + 1).padStart(2, "0")}_${id}.png`),
      type: "png",
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
      captureBeyondViewport: false,
    });
  }
  console.log(`Rendered ${selectedSlides.length} slides at 1920×1080 to ${outDir}`);
} finally {
  await browser.close();
}
