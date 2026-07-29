/**
 * Génère les icônes PWA (PNG réels, encodés à la main via zlib — aucune
 * dépendance d'image externe) : un dégradé de barres blanches croissantes
 * sur fond vert EWA Senegal, symbole simple de croissance/gain de salaire.
 * Icônes de remplacement — à remplacer par une identité de marque définitive.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(__dirname, "..", "public", "icons");
const BRAND_GREEN = [0x12, 0x92, 0x55]; // #129255 (primary-600)

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function roundedRectCoverage(px, py, w, h, r) {
  const rx = Math.min(r, w / 2);
  const ry = Math.min(r, h / 2);
  let dx = 0;
  let dy = 0;
  if (px < rx) dx = rx - px;
  else if (px > w - rx) dx = px - (w - rx);
  if (py < ry) dy = ry - py;
  else if (py > h - ry) dy = py - (h - ry);
  if (dx === 0 && dy === 0) return 1;
  if (rx === 0 || ry === 0) return dx <= 0 && dy <= 0 ? 1 : 0;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1 ? 1 : 0;
}

function encodePng(width, height, pixelFn) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const idx = rowStart + 1 + x * 4;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function drawBarsIcon(size, { cornerRadius = 0, safeMarginRatio = 0.28 } = {}) {
  const safeMargin = size * safeMarginRatio;
  const areaSize = size - safeMargin * 2;
  const barCount = 3;
  const gap = areaSize * 0.16;
  const barWidth = (areaSize - gap * (barCount - 1)) / barCount;
  const heightRatios = [0.42, 0.7, 1.0];
  const baseY = size - safeMargin;
  const [br, bgc, bb] = BRAND_GREEN;

  return encodePng(size, size, (x, y) => {
    const coverage = roundedRectCoverage(x + 0.5, y + 0.5, size, size, cornerRadius);
    const alpha = Math.round(255 * coverage);
    let r = br;
    let g = bgc;
    let b = bb;

    for (let i = 0; i < barCount; i++) {
      const barX0 = safeMargin + i * (barWidth + gap);
      const barX1 = barX0 + barWidth;
      const barH = areaSize * heightRatios[i];
      const barY0 = baseY - barH;
      const barRadius = barWidth * 0.35;
      if (x + 0.5 >= barX0 && x + 0.5 <= barX1 && y + 0.5 >= barY0 && y + 0.5 <= baseY) {
        const inBar = roundedRectCoverage(x + 0.5 - barX0, y + 0.5 - barY0, barX1 - barX0, baseY - barY0, barRadius);
        if (inBar > 0.5) {
          r = 255;
          g = 255;
          b = 255;
        }
      }
    }

    return [r, g, b, alpha];
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, cornerRadius: 192 * 0.22, safeMarginRatio: 0.26 },
  { name: "icon-512.png", size: 512, cornerRadius: 512 * 0.22, safeMarginRatio: 0.26 },
  { name: "icon-maskable-512.png", size: 512, cornerRadius: 0, safeMarginRatio: 0.36 },
  { name: "apple-touch-icon.png", size: 180, cornerRadius: 0, safeMarginRatio: 0.26 },
  { name: "favicon-32.png", size: 32, cornerRadius: 32 * 0.22, safeMarginRatio: 0.24 },
];

for (const t of targets) {
  const png = drawBarsIcon(t.size, { cornerRadius: t.cornerRadius, safeMarginRatio: t.safeMarginRatio });
  fs.writeFileSync(path.join(OUT_DIR, t.name), png);
  console.log(`Généré: ${t.name} (${t.size}x${t.size}, ${png.length} octets)`);
}
