import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function generateMosquePng(width, height) {
  const bytesPerPixel = 4;
  const scanlineLength = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(scanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      
      // Islamic emerald gradient background
      const ny = y / height;
      const rGrad = Math.round(4 + ny * 6);
      const gGrad = Math.round(90 + (1 - ny) * 30);
      const bGrad = Math.round(60 + ny * 20);

      let r = rGrad;
      let g = gGrad;
      let b = bGrad;
      let a = 255;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold Crescent & Dome elements
      // Center Dome
      const domeBaseY = height * 0.62;
      const domeTopY = height * 0.35;
      const domeHalfW = width * 0.22;
      
      if (y >= domeTopY && y <= domeBaseY && Math.abs(x - cx) <= domeHalfW) {
        const normY = (y - domeTopY) / (domeBaseY - domeTopY);
        const curveLimit = Math.sin(normY * Math.PI) * domeHalfW + 2;
        if (Math.abs(x - cx) <= curveLimit) {
          // Gold dome
          r = 245; g = 180; b = 35;
        }
      }

      // Minaret left & right
      const minW = width * 0.05;
      const minLeftX = width * 0.22;
      const minRightX = width * 0.78;
      if (y >= height * 0.38 && y <= height * 0.75) {
        if (Math.abs(x - minLeftX) <= minW || Math.abs(x - minRightX) <= minW) {
          r = 230; g = 245; b = 235;
        }
      }

      // Base building
      if (y > domeBaseY && y <= height * 0.75 && Math.abs(x - cx) <= width * 0.32) {
        r = 240; g = 250; b = 244;
        // Arch door
        if (y >= height * 0.65 && Math.abs(x - cx) <= width * 0.08) {
          r = 6; g = 78; b = 59;
        }
      }

      // Crescent moon near top
      const moonCx = cx;
      const moonCy = height * 0.24;
      const mDist1 = Math.sqrt((x - moonCx) ** 2 + (y - moonCy) ** 2);
      const mDist2 = Math.sqrt((x - (moonCx + width * 0.03)) ** 2 + (y - (moonCy - height * 0.02)) ** 2);
      if (mDist1 <= width * 0.07 && mDist2 >= width * 0.055) {
        r = 254; g = 240; b = 138;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per sample
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('./public/pwa-192x192.png', generateMosquePng(192, 192));
fs.writeFileSync('./public/pwa-512x512.png', generateMosquePng(512, 512));
fs.writeFileSync('./public/pwa-maskable-512x512.png', generateMosquePng(512, 512));
fs.writeFileSync('./public/apple-touch-icon.png', generateMosquePng(180, 180));
console.log('Icons generated successfully!');
