/**
 * PWA Icon Generator
 * 
 * This script generates PNG icons from the Logo.svg for PWA installation
 * 
 * Usage:
 * 1. Install sharp: npm install sharp
 * 2. Run: node generate-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, 'public', 'icons', 'Logo.svg');
const outputDir = path.join(__dirname, 'public', 'icons');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if Logo.svg exists
  if (!fs.existsSync(inputSvg)) {
    console.error('❌ Logo.svg not found at:', inputSvg);
    process.exit(1);
  }

  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Update manifest.json to use PNG icons (see PWA_SETUP_GUIDE.md)');
  console.log('2. Test PWA installation on mobile device');
}

generateIcons().catch(console.error);
