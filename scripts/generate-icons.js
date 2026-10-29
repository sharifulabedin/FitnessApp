import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = createCrcTable();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

function encodeRGBAtoPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (1 + width * 4);
    scanlines[scanlineOffset] = 0; // Filter byte: None
    const rowData = rgbaBuffer.subarray(y * width * 4, (y + 1) * width * 4);
    rowData.copy(scanlines, scanlineOffset + 1);
  }

  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate stylized icon pixels
function renderIconPixels(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const cornerRadius = isMaskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rectangle test for standard icon
      if (!isMaskable && cornerRadius > 0) {
        let dx = 0;
        let dy = 0;
        if (x < cornerRadius) dx = cornerRadius - x;
        else if (x > size - 1 - cornerRadius) dx = x - (size - 1 - cornerRadius);
        if (y < cornerRadius) dy = cornerRadius - y;
        else if (y > size - 1 - cornerRadius) dy = y - (size - 1 - cornerRadius);

        if (dx > 0 && dy > 0 && (dx * dx + dy * dy > cornerRadius * cornerRadius)) {
          // Transparent outside rounded corner
          buf[idx] = 0;
          buf[idx + 1] = 0;
          buf[idx + 2] = 0;
          buf[idx + 3] = 0;
          continue;
        }
      }

      // Background gradient: #0F172A (top) to #1E293B (bottom)
      const gradT = y / size;
      let r = Math.round(15 + gradT * (30 - 15));
      let g = Math.round(23 + gradT * (41 - 23));
      let b = Math.round(42 + gradT * (59 - 42));
      let a = 255;

      // Normalized coordinates from center [-1, 1]
      const nx = (x - cx) / (size * 0.45);
      const ny = (y - cy) / (size * 0.45);

      // Radial glow around center
      const distFromCenter = Math.sqrt(nx * nx + ny * ny);
      if (distFromCenter < 1.1) {
        const glowFactor = Math.pow(Math.max(0, 1.1 - distFromCenter), 2) * 0.45;
        r = Math.min(255, Math.round(r + glowFactor * 244));
        g = Math.min(255, Math.round(g + glowFactor * 63));
        b = Math.min(255, Math.round(b + glowFactor * 94));
      }

      // Flame shape mathematical approximation:
      // A teardrop / flame body tapering to the top
      // y-range roughly [-0.7 (top) to +0.6 (base)]
      const flameY = ny + 0.1; // offset slightly
      if (flameY > -0.75 && flameY < 0.65) {
        // Taper width based on vertical position
        const t = (flameY + 0.75) / 1.4; // 0 at top, 1 at base
        let flameWidth = Math.sin(t * Math.PI * 0.9) * 0.52;
        // add pinch near top
        if (flameY < -0.3) flameWidth *= Math.pow((flameY + 0.75) / 0.45, 1.2);

        const flameDist = Math.abs(nx);
        if (flameDist < flameWidth) {
          const edgeAlpha = Math.min(1, (flameWidth - flameDist) / (flameWidth * 0.25));
          // Flame gradient: Amber-yellow at center-top, Rose-Red at base
          const flameT = Math.max(0, Math.min(1, (flameY + 0.6) / 1.1));
          const fr = 244 + (1 - flameT) * 11; // 244 to 255
          const fg = Math.round(63 + (1 - flameT) * 140); // 63 (rose) to 203 (amber/gold)
          const fb = Math.round(94 - flameT * 40); // 94 to 54

          r = Math.round(r * (1 - edgeAlpha) + fr * edgeAlpha);
          g = Math.round(g * (1 - edgeAlpha) + fg * edgeAlpha);
          b = Math.round(b * (1 - edgeAlpha) + fb * edgeAlpha);
        }
      }

      // Inner flame core (bright warm gold)
      if (flameY > -0.15 && flameY < 0.5) {
        const tInner = (flameY + 0.15) / 0.65;
        const innerWidth = Math.sin(tInner * Math.PI) * 0.22;
        if (Math.abs(nx) < innerWidth) {
          const innerAlpha = Math.min(1, (innerWidth - Math.abs(nx)) / (innerWidth * 0.3));
          r = Math.round(r * (1 - innerAlpha) + 254 * innerAlpha);
          g = Math.round(g * (1 - innerAlpha) + 240 * innerAlpha);
          b = Math.round(b * (1 - innerAlpha) + 138 * innerAlpha);
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return buf;
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// Generate 192 and 512 icons
for (const size of [192, 512]) {
  // Standard icon
  const standardPixels = renderIconPixels(size, false);
  const standardPng = encodeRGBAtoPNG(size, size, standardPixels);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), standardPng);
  console.log(`Generated icon-${size}.png (${standardPng.length} bytes)`);

  // Maskable icon
  const maskablePixels = renderIconPixels(size, true);
  const maskablePng = encodeRGBAtoPNG(size, size, maskablePixels);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}-maskable.png`), maskablePng);
  console.log(`Generated icon-${size}-maskable.png (${maskablePng.length} bytes)`);
}

// Copy 192 as apple-touch-icon
fs.copyFileSync(
  path.join(iconsDir, 'icon-192.png'),
  path.resolve('public', 'apple-touch-icon.png')
);
console.log('Generated public/apple-touch-icon.png');
