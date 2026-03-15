import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

const iconSvg = readFileSync(path.join(publicDir, 'icon.svg'))

// ── Icons ────────────────────────────────────────────────────────────────────
async function generateIcon(size, outName) {
  await sharp(iconSvg)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, outName))
  console.log(`✓ ${outName}`)
}

// ── Screenshot helpers ───────────────────────────────────────────────────────
// Generates a simple branded placeholder screenshot as a PNG
async function generateScreenshot(width, height, outName) {
  // Build an SVG screenshot mockup
  const isWide = width > height
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0d1117"/>
  <!-- header bar -->
  <rect width="${width}" height="${isWide ? 48 : 56}" fill="#161b22"/>
  <rect x="${isWide ? 16 : 12}" y="${isWide ? 12 : 14}" width="28" height="28" rx="8" fill="#1e3a6e"/>
  <rect x="${isWide ? 52 : 48}" y="${isWide ? 18 : 20}" width="80" height="12" rx="4" fill="#3b82f6" opacity="0.9"/>
  <!-- card -->
  <rect x="${isWide ? width/2 - 220 : 16}" y="${isWide ? 72 : 72}" width="${isWide ? 440 : width - 32}" height="${isWide ? 260 : 280}" rx="16" fill="#161b22" stroke="#21262d" stroke-width="1"/>
  <!-- form fields -->
  <rect x="${isWide ? width/2 - 200 : 32}" y="${isWide ? 112 : 116}" width="${isWide ? 400 : width - 64}" height="40" rx="10" fill="#1c2333"/>
  <rect x="${isWide ? width/2 - 200 : 32}" y="${isWide ? 168 : 172}" width="${isWide ? 400 : width - 64}" height="40" rx="10" fill="#1c2333"/>
  <!-- generate button -->
  <rect x="${isWide ? width/2 - 200 : 32}" y="${isWide ? 228 : 236}" width="${isWide ? 400 : width - 64}" height="44" rx="12" fill="#2563eb"/>
  <rect x="${isWide ? width/2 - 52 : width/2 - 40}" y="${isWide ? 246 : 254}" width="80" height="10" rx="4" fill="white" opacity="0.9"/>
  <!-- decorative dots -->
  <circle cx="${isWide ? width - 60 : width - 40}" cy="${height - 60}" r="80" fill="#1e3a6e" opacity="0.15"/>
  <circle cx="40" cy="${height - 40}" r="50" fill="#1e3a6e" opacity="0.1"/>
</svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, outName))
  console.log(`✓ ${outName}`)
}

// ── Run ───────────────────────────────────────────────────────────────────────
await generateIcon(192, 'pwa-192x192.png')
await generateIcon(512, 'pwa-512x512.png')
await generateIcon(180, 'apple-touch-icon.png')
await generateIcon(32, 'favicon-32.png')
await generateScreenshot(390, 844, 'screenshot-mobile.png')   // iPhone-ish portrait
await generateScreenshot(1280, 800, 'screenshot-wide.png')    // desktop wide

// Simple 32x32 favicon ICO (just use PNG, browsers accept it)
writeFileSync(path.join(publicDir, 'favicon.ico'), readFileSync(path.join(publicDir, 'favicon-32.png')))
console.log('✓ favicon.ico')

console.log('\nAll assets generated.')
