import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";

const SLIDES = [
  { id: "signal", name: "01 - Signal" },
  { id: "clinical-problem", name: "02 - Clinical Landscape" },
  { id: "therapeutic-goal", name: "03 - Therapeutic Goal" },
  { id: "systemic-strategies", name: "04 - Conventional Immunosuppression" },
  { id: "question", name: "05 - Adalimumab" },
  { id: "evidence-gap", name: "06 - Evidence Gap" },
  { id: "study-design", name: "07 - Study Design" },
  { id: "screening", name: "08 - Screening Pathway" },
  { id: "randomization", name: "09 - Randomization" },
  { id: "treatment", name: "10 - Treatment by Stratum" },
  { id: "tapering", name: "11 - Tapering and Reactivation" },
  { id: "followup", name: "12 - Follow-up" },
  { id: "outcomes-original", name: "13 - Outcomes (Original Combined)" },
  { id: "statistics-sample-only", name: "14 - Statistics Sample Size" },
  { id: "statistics-redesign", name: "15 - Statistical Analysis Framework" },
  { id: "participant-flow", name: "16 - Participant Flow" },
  { id: "baseline-portrait", name: "17 - Baseline Cohort" },
  { id: "treatment-results-redesign", name: "18 - Treatments Received" },
  { id: "results", name: "19 - Corticosteroid Sparing Efficacy" },
  { id: "discontinuation", name: "20 - Corticosteroid Discontinuation" },
  { id: "ocular-results", name: "21 - Visual and Macular Outcomes" },
  { id: "systemic-safety-tolerability", name: "22 - Safety and Tolerability" },
  { id: "quality-of-life-results", name: "23 - Quality of Life" },
  { id: "limitations-4", name: "24 - Treatment Advancement" },
  { id: "discussion-safety", name: "25 - Cataract Signal" },
  { id: "limitations-1", name: "26 - Masking Limitations" },
  { id: "limitations-2", name: "27 - Comparator Heterogeneity" },
  { id: "limitations-3", name: "28 - Temporal Trajectory" },
  { id: "limitations-5", name: "29 - Missing Data and Attrition" },
  { id: "limitations-6", name: "30 - Immunogenicity" },
  { id: "conclusion", name: "31 - Conclusion" },
];

async function main() {
  console.log("Launching headless Chrome at 1920x1080 (2x Retina)...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.toString()));

  console.log("Navigating to http://localhost:3000/?handout=true ...");
  await page.goto("http://localhost:3000/?handout=true", { waitUntil: "domcontentloaded" });

  // Wait for React hydration or presence of deck
  await page.waitForSelector(".deck", { timeout: 15000 });
  await page.waitForFunction(() => typeof window.__REVEAL_ALL_SLIDES__ === "function" || document.querySelectorAll(".scene").length > 20, { timeout: 15000 });

  // Remove navigation UI and disable smooth snapping during capture
  await page.addStyleTag({
    content: `
      .chapter-nav { display: none !important; }
      .deck { scroll-behavior: auto !important; scroll-snap-type: none !important; }
      * { transition: none !important; animation-duration: 0.001s !important; }
    `
  });

  // Call global reveal
  await page.evaluate(() => {
    if (typeof window.__REVEAL_ALL_SLIDES__ === "function") {
      window.__REVEAL_ALL_SLIDES__();
    }
  });

  await new Promise((r) => setTimeout(r, 800));

  const tempDir = path.join(process.cwd(), "temp_inspect_frames");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imagePaths = [];

  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    console.log(`[${i + 1}/${SLIDES.length}] Preparing & capturing: ${slide.name} (#${slide.id})...`);

    // Prepare slide state and scroll exactly into viewport
    await page.evaluate((id) => {
      if (typeof window.__PREPARE_SLIDE__ === "function") {
        window.__PREPARE_SLIDE__(id);
      }
      const el = document.getElementById(id);
      const deck = document.querySelector(".deck");
      if (el && deck) {
        deck.scrollTop = el.offsetTop;
      }
    }, slide.id);

    // Wait for React re-render, canvas redraw and DOM paint to settle
    await new Promise((r) => setTimeout(r, 600));

    // Force canvas repaints if present
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.querySelectorAll("canvas").forEach((c) => {
          if (typeof c.__DRAW_FULL__ === "function") {
            c.__DRAW_FULL__();
          }
        });
      }
    }, slide.id);

    await new Promise((r) => setTimeout(r, 200));

    const imgPath = path.join(tempDir, `slide_${String(i + 1).padStart(2, "0")}_${slide.id}.png`);
    
    // Capture the full 1920x1080 viewport
    await page.screenshot({ path: imgPath, type: "png" });
    imagePaths.push(imgPath);
  }

  await browser.close();
  console.log(`\nAll ${imagePaths.length} slides captured cleanly. Generating PDF document...`);

  const pdfDoc = await PDFDocument.create();
  const pageWidth = 1920;
  const pageHeight = 1080;

  for (let i = 0; i < imagePaths.length; i++) {
    const imgFile = fs.readFileSync(imagePaths[i]);
    const pngImage = await pdfDoc.embedPng(imgFile);
    
    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const sitePdfPath = path.join(process.cwd(), "ADVISE_Trial_Presentation_Handout.pdf");
  const rootPdfPath = path.join(process.cwd(), "..", "ADVISE_Trial_Presentation_Handout.pdf");
  
  fs.writeFileSync(sitePdfPath, pdfBytes);
  fs.writeFileSync(rootPdfPath, pdfBytes);

  console.log(`\n✅ PDF Handout created successfully:`);
  console.log(`- ${sitePdfPath}`);
  console.log(`- ${rootPdfPath}`);
  console.log(`Total Size: ${(pdfBytes.length / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
