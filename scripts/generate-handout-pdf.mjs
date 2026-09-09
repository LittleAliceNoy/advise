import puppeteer from "puppeteer-core";
// Import the bundled ESM build directly. The installed package's legacy root
// entry point is absent in this workspace, while the self-contained ESM build
// remains complete and avoids changing the application's dependency set.
import { PDFDocument } from "../node_modules/pdf-lib/dist/pdf-lib.esm.min.js";
import fs from "node:fs";
import path from "node:path";

// The browser render is the source of truth. PDFs are assembled only from
// captured PNGs so print CSS can never reflow the presentation.
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 2 };
const PDF_PAGE = { width: 960, height: 540 }; // points: 13.333 × 7.5 inches
const APP_URL = process.env.ADVISE_APP_URL || "http://localhost:3000/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const SLIDES = [
  "signal", "clinical-problem", "therapeutic-goal", "systemic-strategies",
  "question", "evidence-gap", "chapter-methods", "study-design", "screening", "randomization",
  "treatment", "tapering", "followup", "outcomes", "statistics-sample-only",
  "statistics-redesign", "chapter-results", "participant-flow", "baseline-portrait",
  "treatment-results-redesign", "results", "discontinuation", "ocular-results",
  "systemic-safety-tolerability", "quality-of-life-results", "chapter-discussion", "limitations-4",
  "discussion-safety", "limitations-1", "limitations-2", "limitations-3",
  "limitations-5", "limitations-6", "conclusion", "drug-dosing", "outcomes-original",
  "secondary-outcomes-redesign", "tapering-cinematic",
];

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const fullExport = args.has("--full");
const adjustedExport = args.has("--adjusted");
const slidesArg = rawArgs.find((arg) => arg.startsWith("--slides="));
const outputArg = rawArgs.find((arg) => arg.startsWith("--output="));
const outcomesClicksArg = rawArgs.find((arg) => arg.startsWith("--outcomes-clicks="));
const outcomesClicks = outcomesClicksArg
  ? Number.parseInt(outcomesClicksArg.slice("--outcomes-clicks=".length), 10)
  : 3;
if (!Number.isInteger(outcomesClicks) || outcomesClicks < 0 || outcomesClicks > 4) {
  throw new Error("--outcomes-clicks must be an integer from 0 through 4.");
}
const customSlides = slidesArg
  ? slidesArg.slice("--slides=".length).split(",").map((id) => id.trim()).filter(Boolean)
  : null;
if (customSlides) {
  const unknownSlides = customSlides.filter((id) => !SLIDES.includes(id));
  if (unknownSlides.length) throw new Error(`Unknown slide ids: ${unknownSlides.join(", ")}`);
}
const selectedSlides = customSlides ?? (fullExport ? SLIDES : ["statistics-redesign"]);
const customOutputName = outputArg ? outputArg.slice("--output=".length).trim() : null;
if (customOutputName && (path.basename(customOutputName) !== customOutputName || !customOutputName.toLowerCase().endsWith(".pdf"))) {
  throw new Error("--output must be a PDF filename without a directory path.");
}
const outputRoot = path.join(process.cwd(), "output");
const adjustedWorkRoot = path.join(process.cwd(), "tmp", "pdfs", "adjusted-2026-09-01");
const customWorkRoot = path.join(process.cwd(), "tmp", "pdfs", "custom-export");
const pngDir = customSlides
  ? path.join(customWorkRoot, "png")
  : adjustedExport
    ? path.join(adjustedWorkRoot, "png")
    : path.join(outputRoot, "png");
const pdfDir = path.join(outputRoot, "pdf");
const proofPdfDir = adjustedExport ? adjustedWorkRoot : pdfDir;

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function pngSize(file) {
  const png = fs.readFileSync(file);
  if (png.toString("ascii", 1, 4) !== "PNG") throw new Error(`${file} is not a PNG.`);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

async function waitForRenderedAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(images.map((image) => image.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // Export CSS reduces animations to a single frame; give that frame time to
    // commit its `forwards` state before the slide is captured.
    await new Promise((resolve) => setTimeout(resolve, 80));
  });

  const fontStatus = await page.evaluate(() => {
    const loadedFaces = Array.from(document.fonts)
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replaceAll('"', ""));
    return {
      geistReady: document.fonts.check('16px "Geist"'),
      loadedFaces,
      rootFamily: getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim(),
      bodyFamily: getComputedStyle(document.body).fontFamily,
    };
  });
  if (!fontStatus.geistReady || !fontStatus.loadedFaces.some((face) => face.includes("Geist"))) {
    throw new Error(`Required Geist font did not load: ${JSON.stringify(fontStatus)}`);
  }
  return fontStatus;
}

async function prepareSlide(page, id) {
  await page.evaluate((slideId) => {
    window.__INSTANT_CHART__ = true;
    window.__REVEAL_ALL_SLIDES__?.();
    window.__PREPARE_SLIDE__?.(slideId);
    const deck = document.querySelector(".deck");
    const slide = document.getElementById(slideId);
    if (deck && slide) {
      deck.scrollTop = slide.offsetTop;
      slide.scrollIntoView({ block: "start", inline: "nearest" });
      deck.dispatchEvent(new Event("scroll", { bubbles: true }));
    }
  }, id);
  let aligned = false;
  let finalTop = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    finalTop = await page.evaluate((slideId) => {
      const slide = document.getElementById(slideId);
      const deck = document.querySelector(".deck");
      if (!slide || !deck) return null;
      deck.scrollTop = slide.offsetTop;
      slide.scrollIntoView({ block: "start", inline: "nearest" });
      return slide.getBoundingClientRect().top;
    }, id);
    if (finalTop !== null && Math.abs(finalTop) < 2) {
      aligned = true;
      break;
    }
  }
  if (!aligned) throw new Error(`Could not align ${id} to the capture viewport (top=${finalTop}).`);
  await waitForRenderedAssets(page);

  // The outcomes slide reveals in presentation clicks. Default to its final
  // audience state, while allowing a requested intermediate state to be
  // captured without changing the live slide implementation.
  if (id === "outcomes") {
    await page.evaluate((clickCount) => {
      const slide = document.getElementById("outcomes");
      for (let click = 0; click < clickCount; click += 1) slide?.click();
    }, outcomesClicks);
    await waitForRenderedAssets(page);
  }
}

async function createPdf(pngFiles, pdfFile) {
  const pdf = await PDFDocument.create();
  for (const pngFile of pngFiles) {
    const pdfPage = pdf.addPage([PDF_PAGE.width, PDF_PAGE.height]);
    const png = await pdf.embedPng(fs.readFileSync(pngFile));
    pdfPage.drawImage(png, { x: 0, y: 0, width: PDF_PAGE.width, height: PDF_PAGE.height });
  }
  fs.writeFileSync(pdfFile, await pdf.save());
}

async function main() {
  ensureDir(pngDir);
  ensureDir(pdfDir);
  ensureDir(proofPdfDir);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars", "--window-size=1920,1080"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.emulateMediaType("screen");
    // The development server retains a live connection, so networkidle0 would
    // never settle. Font and asset readiness are verified explicitly below.
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".deck", { timeout: 15000 });
    await page.waitForFunction(() => window.__IS_HYDRATED__ === true && typeof window.__PREPARE_SLIDE__ === "function", { timeout: 15000 });
    await page.addStyleTag({ content: `
      html, body { width: 1920px !important; height: 1080px !important; overflow: hidden !important; }
      .deck { width: 1920px !important; height: 1080px !important; overflow-y: auto !important; scroll-snap-type: none !important; scroll-behavior: auto !important; }
      .scene { width: 1920px !important; min-height: 1080px !important; height: 1080px !important; }
      *, *::before, *::after {
        animation-duration: .001s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
      /* The handout cover must show the eye fully open, never mid-blink. */
      #signal .cosmic-eye::after {
        animation: none !important;
        transform: translateY(-100%) !important;
      }
    ` });
    const fonts = await waitForRenderedAssets(page);
    console.log(`Verified font: Geist (${fonts.bodyFamily})`);
    const pngFiles = [];
    for (const id of selectedSlides) {
      await prepareSlide(page, id);
      const physicalIndex = SLIDES.indexOf(id) + 1;
      const suffix = customSlides
        ? `${String(pngFiles.length + 1).padStart(2, "0")}_Page_${String(physicalIndex).padStart(2, "0")}_${id}`
        : fullExport
        ? `${String(pngFiles.length + 1).padStart(2, "0")}_${id}`
        : adjustedExport
          ? "Page_15_Export_Proof_Adjusted_2026-09-01_3840x2160"
          : "Page_15_Export_Proof_3840x2160";
      const pngFile = path.join(pngDir, `ADVISE_${suffix}.png`);
      await page.screenshot({
        path: pngFile,
        type: "png",
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
        captureBeyondViewport: false,
      });
      const dimensions = pngSize(pngFile);
      if (dimensions.width !== 3840 || dimensions.height !== 2160) throw new Error(`Expected 3840×2160 PNG; received ${dimensions.width}×${dimensions.height}.`);
      pngFiles.push(pngFile);
      console.log(`Captured ${id}: ${dimensions.width}×${dimensions.height}`);
    }
    const pdfFile = customOutputName
      ? path.join(pdfDir, customOutputName)
      : fullExport
      ? path.join(pdfDir, adjustedExport ? "ADVISE_Trial_Presentation_Handout_Adjusted_2026-09-01.pdf" : "ADVISE_Trial_Presentation_Handout.pdf")
      : path.join(proofPdfDir, adjustedExport ? "ADVISE_Page_15_Export_Proof_Adjusted_2026-09-01.pdf" : "ADVISE_Page_15_Export_Proof.pdf");
    await createPdf(pngFiles, pdfFile);
    console.log(`Created ${pdfFile} (${PDF_PAGE.width}×${PDF_PAGE.height} pt per page)`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
