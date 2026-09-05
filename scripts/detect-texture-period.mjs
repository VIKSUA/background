import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEXTURE_PATH = path.resolve(
  __dirname,
  "../src/assets/background-texture-tile.png",
);

/** Extra row Y positions (0-based) used as horizontal slices. */
const EXTRA_ROW_YS = [0, 1, 99];

/** Extra column X positions (0-based) used as vertical slices. */
const EXTRA_COL_XS = [0, 1, 99];

/** Divide width/height by these factors to pick additional slice positions. */
const SLICE_DIVISORS = [4, 5, 6];

function uniqueSorted(values, maxExclusive) {
  return [...new Set(values)]
    .filter((v) => Number.isInteger(v) && v >= 0 && v < maxExclusive)
    .sort((a, b) => a - b);
}

function packPixel(data, offset) {
  return (
    (data[offset] << 24) |
    (data[offset + 1] << 16) |
    (data[offset + 2] << 8) |
    data[offset + 3]
  );
}

function extractRow(png, y) {
  const values = new Int32Array(png.width);
  const rowStart = y * png.width * 4;
  for (let x = 0; x < png.width; x++) {
    values[x] = packPixel(png.data, rowStart + x * 4);
  }
  return values;
}

function extractCol(png, x) {
  const values = new Int32Array(png.height);
  for (let y = 0; y < png.height; y++) {
    values[y] = packPixel(png.data, (y * png.width + x) * 4);
  }
  return values;
}

function findPeriod(values) {
  const n = values.length;
  const maxP = Math.floor(n / 2);
  for (let p = 1; p <= maxP; p++) {
    let matches = true;
    for (let i = 0; i < n - p; i++) {
      if (values[i] !== values[i + p]) {
        matches = false;
        break;
      }
    }
    if (matches) return p;
  }
  return n;
}

function slicePositions(length, extra, divisors) {
  const fromDivisors = divisors.map((d) => Math.floor(length / d));
  return uniqueSorted([...extra, ...fromDivisors], length);
}

function cropTile(png, tileWidth, tileHeight) {
  const tile = new PNG({ width: tileWidth, height: tileHeight });
  for (let y = 0; y < tileHeight; y++) {
    const srcStart = y * png.width * 4;
    const dstStart = y * tileWidth * 4;
    png.data.copy(tile.data, dstStart, srcStart, srcStart + tileWidth * 4);
  }
  return tile;
}

const png = PNG.sync.read(fs.readFileSync(TEXTURE_PATH));
const { width, height } = png;

const rowYs = slicePositions(height, EXTRA_ROW_YS, SLICE_DIVISORS);
const colXs = slicePositions(width, EXTRA_COL_XS, SLICE_DIVISORS);

console.log(`Texture: ${path.basename(TEXTURE_PATH)} (${width}×${height})`);
console.log(`Horizontal slices (rows): ${rowYs.join(", ")}`);
console.log(`Vertical slices (columns): ${colXs.join(", ")}`);
console.log("");

const horizontalSteps = [];
for (const y of rowYs) {
  const step = findPeriod(extractRow(png, y));
  horizontalSteps.push(step);
  console.log(`row y=${y}: horizontal step = ${step}px`);
}

console.log("");

const verticalSteps = [];
for (const x of colXs) {
  const step = findPeriod(extractCol(png, x));
  verticalSteps.push(step);
  console.log(`col x=${x}: vertical step = ${step}px`);
}

const uniqueH = [...new Set(horizontalSteps)];
const uniqueV = [...new Set(verticalSteps)];

console.log("");
if (uniqueH.length === 1) {
  console.log(`Horizontal step (all slices agree): ${uniqueH[0]}px`);
} else {
  console.log(`Horizontal step MISMATCH across slices: ${uniqueH.join(", ")}px`);
}

if (uniqueV.length === 1) {
  console.log(`Vertical step (all slices agree): ${uniqueV[0]}px`);
} else {
  console.log(`Vertical step MISMATCH across slices: ${uniqueV.join(", ")}px`);
}

if (uniqueH.length === 1 && uniqueV.length === 1) {
  const tileWidth = uniqueH[0];
  const tileHeight = uniqueV[0];
  const outPath = path.join(
    path.dirname(TEXTURE_PATH),
    "background-texture-tile-unit.png",
  );
  const tile = cropTile(png, tileWidth, tileHeight);
  fs.writeFileSync(outPath, PNG.sync.write(tile));
  console.log(`Saved tile ${tileWidth}×${tileHeight} → ${outPath}`);
} else {
  console.log("Skip crop: slices did not agree on a single step.");
}
