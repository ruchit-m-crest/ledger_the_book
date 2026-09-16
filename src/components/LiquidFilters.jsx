// Shared SVG filter defs for the "liquid glass" refraction effect used on small,
// contained UI elements (segmented-control pill, keypad keys, selected category
// tile). Adapted from the feImage + feDisplacementMap "lens" technique found in
// freefrontend's iOS-26 liquid-glass demos, tuned down for small controls.
//
// Deliberately NOT applied to large surfaces (bottom tab bar, the add-transaction
// sheet) — those stay on plain backdrop-filter blur, which is both the more
// battery-friendly choice and the one every liquid-glass library we evaluated
// warns can misbehave on Safari once a glass panel covers a large area.

const NORMAL_MAP_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <radialGradient id='g' cx='50%' cy='50%' r='75%'>
    <stop offset='0%' stop-color='rgb(128,128,255)'/>
    <stop offset='90%' stop-color='rgb(255,255,255)'/>
  </radialGradient>
  <rect width='100%' height='100%' fill='url(#g)'/>
</svg>`;

const NORMAL_MAP_HREF = `data:image/svg+xml,${encodeURIComponent(NORMAL_MAP_SVG)}`;

export default function LiquidFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="liquid-lens" x="-40%" y="-40%" width="180%" height="180%" primitiveUnits="objectBoundingBox">
        <feImage x="0" y="0" width="1" height="1" result="normalMap" href={NORMAL_MAP_HREF} />
        <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="0.06" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
