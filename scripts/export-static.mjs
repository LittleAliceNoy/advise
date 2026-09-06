import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

async function exportStatic() {
  const root = process.cwd();
  const basePath = process.env.BASE_PATH || "/advise";
  const outputDir = resolve(root, "out");

  console.log(`[export-static] Exporting static site with BASE_PATH=${basePath} to ${outputDir}...`);

  // Clean output directory
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  // 1. Render static HTML from server bundle
  const workerPath = resolve(root, "dist", "server", "index.js");
  if (!existsSync(workerPath)) {
    throw new Error(`Worker file not found at ${workerPath}. Did you run build first?`);
  }

  const { default: worker } = await import(pathToFileURL(workerPath).href);
  const requestUrl = `http://localhost${basePath}/`;
  const res = await worker.fetch(
    new Request(requestUrl, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    }
  );

  if (res.status !== 200) {
    throw new Error(`Failed to render HTML from worker. Status: ${res.status}`);
  }

  let html = await res.text();

  // Write index.html and 404.html
  await writeFile(resolve(outputDir, "index.html"), html, "utf8");
  await writeFile(resolve(outputDir, "404.html"), html, "utf8");
  console.log(`[export-static] Generated index.html and 404.html (${html.length} bytes)`);

  // 2. Add .nojekyll for GitHub Pages
  await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8");
  console.log(`[export-static] Created .nojekyll`);

  // 3. Copy client assets
  const clientDir = resolve(root, "dist", "client");
  
  // If basePath directory exists in dist/client (e.g. dist/client/advise/_next)
  const basePathSubdir = basePath.replace(/^\/+/, "");
  const baseSubdirPath = resolve(clientDir, basePathSubdir);

  if (existsSync(baseSubdirPath)) {
    await cp(baseSubdirPath, outputDir, { recursive: true });
    console.log(`[export-static] Copied ${baseSubdirPath} to ${outputDir}`);
  }

  // Copy root client assets (public files like fonts, images, favicons)
  const rootClientEntries = ["fonts", "favicon.svg", "og.png", "nihms-2128218-f0004.jpg"];
  for (const entry of rootClientEntries) {
    const src = resolve(clientDir, entry);
    const dest = resolve(outputDir, entry);
    if (existsSync(src)) {
      await cp(src, dest, { recursive: true });
      console.log(`[export-static] Copied ${entry} to output`);
    }
  }

  // Ensure _next/static/fonts exists if font files were placed in _vinext_fonts or root fonts
  const vinextFonts = resolve(outputDir, "_next", "static", "_vinext_fonts");
  const nextStaticFonts = resolve(outputDir, "_next", "static", "fonts");
  if (existsSync(vinextFonts) && !existsSync(nextStaticFonts)) {
    await cp(vinextFonts, nextStaticFonts, { recursive: true });
    console.log(`[export-static] Mirrored _vinext_fonts to _next/static/fonts`);
  }
  const rootFonts = resolve(outputDir, "fonts");
  if (existsSync(rootFonts) && !existsSync(nextStaticFonts)) {
    await cp(rootFonts, nextStaticFonts, { recursive: true });
    console.log(`[export-static] Mirrored fonts to _next/static/fonts`);
  }

  console.log(`[export-static] Static export complete in ${outputDir}!`);
}

exportStatic().catch((err) => {
  console.error("[export-static] Error:", err);
  process.exit(1);
});
