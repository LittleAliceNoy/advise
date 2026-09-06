import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT_STATIC = 8091;
const PORT_WORKER = 8092;
const BASE_PATH = "/advise";
const OUT_DIR = path.resolve(process.cwd(), "out");
const COMPARE_DIR = path.resolve(process.cwd(), "tmp", "visual-compare");

fs.mkdirSync(COMPARE_DIR, { recursive: true });

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

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT_STATIC}`).pathname);
    if (!reqPath.startsWith(BASE_PATH)) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    let relPath = reqPath.slice(BASE_PATH.length);
    if (relPath === "" || relPath === "/") relPath = "/index.html";
    let filePath = path.join(OUT_DIR, relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("404");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(fs.readFileSync(filePath));
  });

  return new Promise((r) => server.listen(PORT_STATIC, () => r(server)));
}

async function startWorkerServer() {
  const { default: worker } = await import(path.resolve(process.cwd(), "dist", "server", "index.js"));
  const clientDir = path.resolve(process.cwd(), "dist", "client");

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT_WORKER}`);
    let reqPath = decodeURIComponent(url.pathname);

    // Static asset fallback
    if (reqPath.startsWith("/advise/")) {
      const assetRel = reqPath.slice("/advise/".length);
      const possibleFiles = [
        path.join(clientDir, "advise", assetRel),
        path.join(clientDir, assetRel),
        path.join(OUT_DIR, assetRel),
      ];
      for (const p of possibleFiles) {
        if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
          const ext = path.extname(p).toLowerCase();
          res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
          res.end(fs.readFileSync(p));
          return;
        }
      }
    }

    const workerRes = await worker.fetch(
      new Request(url.href, {
        method: req.method,
        headers: req.headers,
      }),
      {
        ASSETS: {
          fetch: async (r) => {
            return new Response("Not found", { status: 404 });
          },
        },
      },
      { waitUntil() {}, passThroughOnException() {} }
    );

    res.writeHead(workerRes.status, Object.fromEntries(workerRes.headers.entries()));
    const buf = Buffer.from(await workerRes.arrayBuffer());
    res.end(buf);
  });

  return new Promise((r) => server.listen(PORT_WORKER, () => r(server)));
}

async function compare() {
  const staticServer = await startStaticServer();
  const workerServer = await startWorkerServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const testSlides = [
    { id: "clinical-problem", num: "02" },
    { id: "therapeutic-goal", num: "03" },
    { id: "systemic-strategies", num: "04" },
    { id: "statistics-redesign", num: "15" },
  ];

  try {
    const staticPage = await browser.newPage();
    await staticPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await staticPage.goto(`http://localhost:${PORT_STATIC}${BASE_PATH}/`, { waitUntil: "networkidle0" });
    await staticPage.evaluate(async () => {
      await document.fonts.ready;
      await document.fonts.load('16px "Geist"');
      await document.fonts.load('16px "Geist Mono"');
    });

    const workerPage = await browser.newPage();
    await workerPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await workerPage.goto(`http://localhost:${PORT_WORKER}${BASE_PATH}/`, { waitUntil: "networkidle0" });
    await workerPage.evaluate(async () => {
      await document.fonts.ready;
      await document.fonts.load('16px "Geist"');
      await document.fonts.load('16px "Geist Mono"');
    });

    for (const slide of testSlides) {
      // Setup both pages
      await staticPage.evaluate((slideId) => window.__PREPARE_SLIDE__ && window.__PREPARE_SLIDE__(slideId), slide.id);
      await workerPage.evaluate((slideId) => window.__PREPARE_SLIDE__ && window.__PREPARE_SLIDE__(slideId), slide.id);

      await new Promise((r) => setTimeout(r, 250));

      const pathStatic = path.join(COMPARE_DIR, `slide-${slide.num}-static.png`);
      const pathWorker = path.join(COMPARE_DIR, `slide-${slide.num}-local.png`);

      await staticPage.screenshot({ path: pathStatic });
      await workerPage.screenshot({ path: pathWorker });

      const bufStatic = fs.readFileSync(pathStatic);
      const bufWorker = fs.readFileSync(pathWorker);

      const isIdentical = bufStatic.equals(bufWorker);
      console.log(`[Visual Compare] Slide ${slide.num} (${slide.id}): Exact Byte Identity = ${isIdentical}, Sizes: Static=${bufStatic.length}, Local=${bufWorker.length}`);
      if (!isIdentical) {
        console.log(`  Difference ratio: ${(Math.abs(bufStatic.length - bufWorker.length) / bufStatic.length * 100).toFixed(4)}%`);
      }
    }
  } finally {
    await browser.close();
    staticServer.close();
    workerServer.close();
  }
}

compare().catch((err) => {
  console.error("Comparison failed:", err);
  process.exit(1);
});
