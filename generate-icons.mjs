// Run once: node generate-icons.mjs
// Generates placeholder PNG icons using Canvas API (Node.js)
// Requires: npm install canvas (or use any image editor to replace with real icons)

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

const sizes = [16, 48, 128]

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#FF6B35'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Letter G
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('G', size / 2, size / 2)

  writeFileSync(`public/icons/icon${size}.png`, canvas.toBuffer('image/png'))
  console.log(`Generated icon${size}.png`)
}
