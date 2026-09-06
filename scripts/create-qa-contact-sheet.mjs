import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.resolve("tmp/projection-readability-qa");
const files = fs.readdirSync(inputDir).filter((file) => /^\d{2}_.+\.png$/.test(file)).sort();
const cellWidth = 384;
const cellHeight = 216;
const columns = 4;
const rows = Math.ceil(files.length / columns);

const tiles = await Promise.all(files.map(async (file, index) => ({
  input: await sharp(path.join(inputDir, file)).resize(cellWidth, cellHeight).png().toBuffer(),
  left: (index % columns) * cellWidth,
  top: Math.floor(index / columns) * cellHeight,
})));

await sharp({
  create: {
    width: columns * cellWidth,
    height: rows * cellHeight,
    channels: 3,
    background: "#060606",
  },
}).composite(tiles).png().toFile(path.join(inputDir, "contact-sheet.png"));
