import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";

const SLIDES_TO_CAPTURE = [
  { id: "signal", name: "01 - Signal" },
  { id: "clinical-problem", name: "02 - Clinical Landscape" },
  { 
    id: "therapeutic-goal", 
    name: "03 - Therapeutic Goal",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("therapeutic-goal");
        if (el) {
          el.className = "scene intro3-scene stage-3";
          el.querySelectorAll(".therapeutic-stage-item").forEach(item => {
            item.classList.remove("stage-hidden");
            item.classList.add("stage-visible");
          });
        }
      });
    }
  },
  { id: "systemic-strategies", name: "04 - Conventional Immunosuppression" },
  { id: "question", name: "05 - Adalimumab" },
  { id: "evidence-gap", name: "06 - Evidence Gap" },
  { id: "study-design", name: "07 - Study Design" },
  { id: "screening", name: "08 - Screening Pathway" },
  { id: "randomization", name: "09 - Randomization" },
  { id: "treatment", name: "10 - Treatment by Stratum" },
  { 
    id: "tapering-cinematic", 
    name: "11 - Tapering and Reactivation (Cinematic)",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("tapering-cinematic");
        if (el) {
          el.className = "scene tapering-cinematic-scene tapering-stage-7";
          const escScene = el.querySelector(".taperx-escalation");
          if (escScene) {
            escScene.classList.add("active");
            escScene.classList.remove("faded");
          }
          el.querySelectorAll(".taperx-esc-step").forEach(step => {
            step.classList.add("revealed");
          });
        }
      });
    }
  },
  { id: "followup", name: "12 - Follow-up" },
  { id: "outcomes-original", name: "13 - Outcomes (Original Combined)" },
  { id: "statistics-sample-only", name: "14 - Statistics Sample Size" },
  { 
    id: "statistics-redesign", 
    name: "15 - Statistical Analysis Framework",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("statistics-redesign");
        if (el) {
          el.className = "scene statistics-framework-scene statistics-framework-stage--1";
          el.querySelectorAll(".analysis-framework-column").forEach(col => {
            col.style.opacity = "1";
            col.style.filter = "none";
          });
        }
      });
    }
  },
  { id: "participant-flow", name: "16 - Participant Flow" },
  { id: "baseline-portrait", name: "17 - Baseline Cohort" },
  { 
    id: "treatment-results-redesign", 
    name: "18 - Treatments Received",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("treatment-results-redesign");
        if (el) {
          el.className = "scene txr-dashboard-scene txr-stage--1";
        }
      });
    }
  },
  { 
    id: "results", 
    name: "19 - Corticosteroid Sparing Efficacy",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("results");
        if (el) {
          el.className = "scene results-scene efficacy-sequence-5";
        }
      });
    }
  },
  { 
    id: "discontinuation", 
    name: "20 - Corticosteroid Discontinuation",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("discontinuation");
        if (el) {
          el.className = "scene results-scene discontinuation-scene efficacy-sequence-5";
        }
      });
    }
  },
  { id: "ocular-results", name: "21 - Visual and Macular Outcomes" },
  { id: "systemic-safety-tolerability", name: "22 - Safety and Tolerability" },
  { id: "quality-of-life-results", name: "23 - Quality of Life" },
  { id: "limitations-4", name: "24 - Treatment Advancement" },
  { id: "discussion-safety", name: "25 - Cataract Signal" },
  { id: "limitations-1", name: "26 - Masking Limitations" },
  { 
    id: "limitations-2", 
    name: "27 - Comparator Heterogeneity",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("limitations-2");
        if (el) {
          el.className = "scene discussion-comparator-scene branch-state-idle both-inspected";
          const synthBlock = el.querySelector(".left-synthesis-block");
          if (synthBlock) {
            synthBlock.classList.remove("synthesis-hidden");
            synthBlock.classList.add("synthesis-revealed");
          }
          const pointsBlock = el.querySelector(".left-synthesis-points");
          if (pointsBlock) {
            pointsBlock.classList.remove("points-hidden");
            pointsBlock.classList.add("points-revealed");
          }
          const splitView = el.querySelector(".synthesis-split-view");
          if (splitView) {
            splitView.classList.remove("synthesis-focus-dimmed");
          }
        }
      });
    }
  },
  { 
    id: "limitations-3", 
    name: "28 - Temporal Trajectory",
    setup: async (page) => {
      await page.evaluate(() => {
        const canvas = document.querySelector(".temporal-matrix-canvas");
        if (canvas) {
          canvas.className = "temporal-matrix-canvas step-4";
        }
      });
    }
  },
  { 
    id: "limitations-5", 
    name: "29 - Missing Data and Attrition",
    setup: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById("limitations-5");
        if (el) {
          el.className = "scene discussion-attrition-scene attrition-step-5";
          const reasons = el.querySelector(".adv-observations-block.side-by-side");
          if (reasons) {
            reasons.classList.remove("reasons-hidden");
            reasons.classList.add("reasons-revealed");
          }
        }
      });
    }
  },
  { id: "limitations-6", name: "30 - Immunogenicity" },
  { id: "conclusion", name: "31 - Conclusion" },
];

async function generateHandoutPDF() {
  console.log("Launching headless Chrome...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
      "--hide-scrollbars",
      "--force-device-scale-factor=2"
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  
  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

  // Hide side navigation dots and smooth out scroll behavior for instant capturing
  await page.addStyleTag({
    content: `
      .chapter-nav { display: none !important; }
      .deck { scroll-behavior: auto !important; }
      * { animation-duration: 0.001s !important; transition-duration: 0.001s !important; }
    `
  });

  const tempDir = path.join(process.cwd(), "temp_pdf_frames");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const imagePaths = [];

  for (let i = 0; i < SLIDES_TO_CAPTURE.length; i++) {
    const slide = SLIDES_TO_CAPTURE[i];
    console.log(`[${i + 1}/${SLIDES_TO_CAPTURE.length}] Capturing slide: ${slide.name} (#${slide.id})...`);

    // Scroll to the target element
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
      }
    }, slide.id);

    // Apply any slide-specific full-reveal setup
    if (slide.setup) {
      await slide.setup(page);
    }

    // Wait a brief moment for canvas / SVG paints
    await new Promise((r) => setTimeout(r, 450));

    // Capture screenshot of the exact slide section element
    const slideElement = await page.$(`#${slide.id}`);
    if (!slideElement) {
      console.warn(`Warning: Could not find element #${slide.id}`);
      continue;
    }

    const imgPath = path.join(tempDir, `slide_${String(i + 1).padStart(2, "0")}_${slide.id}.png`);
    await slideElement.screenshot({ path: imgPath, type: "png" });
    imagePaths.push(imgPath);
  }

  await browser.close();
  console.log(`Captured ${imagePaths.length} slide screenshots. Creating PDF...`);

  // Create combined PDF with pdf-lib
  const pdfDoc = await PDFDocument.create();

  // Standard 16:9 widescreen dimensions in PDF points (1920pt x 1080pt)
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
  const outputPdfPath = path.join(process.cwd(), "ADVISE_Trial_Presentation_Handout.pdf");
  fs.writeFileSync(outputPdfPath, pdfBytes);

  console.log(`\n✅ PDF Handout created successfully at: ${outputPdfPath}`);
  console.log(`File size: ${(pdfBytes.length / (1024 * 1024)).toFixed(2)} MB`);

  // Clean up temporary image files
  try {
    for (const p of imagePaths) {
      fs.unlinkSync(p);
    }
    fs.rmdirSync(tempDir);
  } catch (e) {}

  return outputPdfPath;
}

generateHandoutPDF().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
