import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 8089;
const BASE_PATH = "/advise";
const OUT_DIR = path.resolve(process.cwd(), "out");
const SCREENSHOT_DIR = path.resolve(process.cwd(), "tmp", "gh-pages-qa");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

// 1. Static file server simulating GitHub Pages at /advise/
function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    
    // GitHub Pages subpath simulation
    if (!reqPath.startsWith(BASE_PATH)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found (outside basePath)");
      return;
    }

    let relPath = reqPath.slice(BASE_PATH.length);
    if (relPath === "" || relPath === "/") {
      relPath = "/index.html";
    }

    let filePath = path.join(OUT_DIR, relPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      // 404 fallback to 404.html like GitHub Pages
      const notFoundPage = path.join(OUT_DIR, "404.html");
      if (fs.existsSync(notFoundPage)) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(fs.readFileSync(notFoundPage));
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`File not found: ${relPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[QA-Server] Serving ${OUT_DIR} at http://localhost:${PORT}${BASE_PATH}/`);
      resolve(server);
    });
  });
}

async function runQA() {
  const server = await startServer();
  const failedRequests = [];
  const consoleErrors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    page.on("requestfailed", (req) => {
      failedRequests.push({ url: req.url(), failure: req.failure() });
      console.error(`[FAIL] Request failed: ${req.url()}`, req.failure());
    });

    page.on("response", (res) => {
      if (res.status() >= 400) {
        failedRequests.push({ url: res.url(), status: res.status() });
        console.error(`[FAIL] HTTP ${res.status}: ${res.url()}`);
      }
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      }
    });

    const targetUrl = `http://localhost:${PORT}${BASE_PATH}/`;
    console.log(`[QA] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    // Verify fonts
    await page.evaluate(async () => {
      await document.fonts.ready;
      await document.fonts.load('16px "Geist"');
      await document.fonts.load('16px "Geist Mono"');
    });

    const fontCheck = await page.evaluate(() => {
      return {
        geistLoaded: document.fonts.check('16px "Geist"'),
        geistMonoLoaded: document.fonts.check('16px "Geist Mono"'),
        fontsCount: Array.from(document.fonts).filter(f => f.status === "loaded").length,
        loadedFamilies: Array.from(document.fonts).filter(f => f.status === "loaded").map(f => f.family),
      };
    });

    console.log("[QA] Font verification:", fontCheck);

    // Verify slides and capture target screenshots: 02, 03, 04, 15
    const testSlides = [
      { id: "clinical-problem", num: "02" },
      { id: "therapeutic-goal", num: "03" },
      { id: "systemic-strategies", num: "04" },
      { id: "statistics-redesign", num: "15" },
    ];

    for (const slide of testSlides) {
      await page.evaluate((slideId) => {
        if (window.__PREPARE_SLIDE__) {
          window.__PREPARE_SLIDE__(slideId);
        } else {
          const el = document.getElementById(slideId);
          if (el) el.scrollIntoView({ behavior: "instant" });
        }
      }, slide.id);

      await new Promise((r) => setTimeout(r, 250));

      const screenshotPath = path.join(SCREENSHOT_DIR, `slide-${slide.num}-${slide.id}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`[QA] Captured Slide ${slide.num} (${slide.id}) -> ${screenshotPath}`);
    }

    console.log("\n=== QA SUMMARY ===");
    console.log(`Failed HTTP requests / 404s: ${failedRequests.length}`);
    console.log(`Browser console errors: ${consoleErrors.length}`);
    console.log(`Fonts verified: Geist=${fontCheck.geistLoaded}, GeistMono=${fontCheck.geistMonoLoaded}`);

    if (failedRequests.length > 0 || consoleErrors.length > 0 || !fontCheck.geistLoaded) {
      throw new Error("QA verification failed!");
    }

    console.log("=== ALL CHECKS PASSED ===\n");
  } finally {
    await browser.close();
    server.close();
  }
}

runQA().catch((err) => {
  console.error("QA Test Run Failed:", err);
  process.exit(1);
});
