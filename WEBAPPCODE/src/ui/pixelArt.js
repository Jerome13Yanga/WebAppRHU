/**
 * Crisp SVG Pixel Art Components for Padre Burgos RHU
 * Clean, lightweight, professional pixel art for maternal & child healthcare.
 */

export function renderPixelParentChild(size = 48) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="pixel-art-svg drop-shadow-sm" style="image-rendering: pixelated; shape-rendering: crispEdges;">
      <!-- Mother Head & Hair -->
      <rect x="7" y="2" width="6" height="2" fill="#78350f" />
      <rect x="6" y="4" width="2" height="4" fill="#78350f" />
      <rect x="13" y="4" width="2" height="4" fill="#78350f" />
      <rect x="8" y="4" width="5" height="5" fill="#fbcfe8" />
      <!-- Mother Eyes & Smile -->
      <rect x="9" y="5" width="1" height="1" fill="#475569" />
      <rect x="12" y="5" width="1" height="1" fill="#475569" />
      <rect x="10" y="7" width="2" height="1" fill="#db2777" />
      <!-- Mother Body / Dress -->
      <rect x="6" y="9" width="8" height="12" fill="#0284c7" />
      <rect x="5" y="10" width="1" height="8" fill="#38bdf8" />
      <rect x="14" y="10" width="1" height="8" fill="#38bdf8" />
      <rect x="7" y="9" width="6" height="2" fill="#ffffff" />
      
      <!-- Baby Held in Arms (Right Side) -->
      <!-- Baby Head -->
      <rect x="12" y="10" width="4" height="4" fill="#fed7aa" />
      <rect x="13" y="11" width="1" height="1" fill="#475569" />
      <rect x="15" y="11" width="1" height="1" fill="#475569" />
      <rect x="14" y="13" width="1" height="1" fill="#ea580c" />
      <!-- Baby Swaddle Wrap -->
      <rect x="11" y="14" width="6" height="6" fill="#f472b6" />
      <rect x="12" y="15" width="4" height="4" fill="#fbcfe8" />
      <rect x="13" y="16" width="2" height="2" fill="#ffffff" />
      
      <!-- Mother Arms Wrapping Baby -->
      <rect x="9" y="13" width="3" height="3" fill="#fbcfe8" />
      <rect x="16" y="14" width="2" height="3" fill="#fbcfe8" />
    </svg>
  `;
}

export function renderPixelHeart(size = 20) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;">
      <rect x="2" y="3" width="4" height="3" fill="#db2777" />
      <rect x="10" y="3" width="4" height="3" fill="#db2777" />
      <rect x="1" y="4" width="14" height="4" fill="#db2777" />
      <rect x="2" y="8" width="12" height="2" fill="#db2777" />
      <rect x="4" y="10" width="8" height="2" fill="#db2777" />
      <rect x="6" y="12" width="4" height="2" fill="#db2777" />
      <rect x="7" y="14" width="2" height="1" fill="#db2777" />
      <!-- Sparkle highlight -->
      <rect x="3" y="4" width="2" height="2" fill="#fbcfe8" />
    </svg>
  `;
}

export function renderPixelCross(size = 20) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;">
      <rect x="2" y="2" width="12" height="12" rx="3" fill="#0284c7" />
      <rect x="6" y="4" width="4" height="8" fill="#ffffff" />
      <rect x="4" y="6" width="8" height="4" fill="#ffffff" />
    </svg>
  `;
}

export function renderPixelRattle(size = 20) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;">
      <rect x="5" y="1" width="6" height="6" fill="#38bdf8" />
      <rect x="6" y="2" width="4" height="4" fill="#e0f2fe" />
      <rect x="7" y="7" width="2" height="6" fill="#f59e0b" />
      <rect x="6" y="13" width="4" height="2" fill="#38bdf8" />
    </svg>
  `;
}
