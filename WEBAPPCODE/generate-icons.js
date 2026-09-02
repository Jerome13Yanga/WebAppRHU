const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, 'icon-512.png');
const FOREGROUND_SOURCE = path.join(__dirname, 'icon-512.png');
const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android mipmap density sizes
const DENSITIES = [
  { folder: 'mipmap-mdpi',    size: 48 },
  { folder: 'mipmap-hdpi',    size: 72 },
  { folder: 'mipmap-xhdpi',   size: 96 },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Foreground layer for adaptive icons (108dp * density multiplier)
const FOREGROUND_DENSITIES = [
  { folder: 'mipmap-mdpi',    size: 108 },
  { folder: 'mipmap-hdpi',    size: 162 },
  { folder: 'mipmap-xhdpi',   size: 216 },
  { folder: 'mipmap-xxhdpi',  size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

async function generateIcons() {
  console.log('Generating Android launcher icons from icon-512.png...');

  for (const { folder, size } of DENSITIES) {
    const outDir = path.join(RES_DIR, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // ic_launcher.png — standard square icon
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // ic_launcher_round.png — circular cropped icon
    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    console.log(`  ✓ ${folder}: ${size}x${size}px`);
  }

  // Generate foreground layers for adaptive icons (Android 8+)
  for (const { folder, size } of FOREGROUND_DENSITIES) {
    const outDir = path.join(RES_DIR, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Center the icon within the 108dp canvas with padding for safe zone
    const iconSize = Math.round(size * 0.66); // 66% of canvas = safe zone
    const padding = Math.round((size - iconSize) / 2);

    await sharp(SOURCE)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: padding,
        bottom: size - iconSize - padding,
        left: padding,
        right: size - iconSize - padding,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`  ✓ ${folder} foreground: ${size}x${size}px`);
  }

  console.log('\n✅ All Android launcher icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
