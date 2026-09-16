// Shared SVG filter for the "liquid glass" refraction effect.
//
// Uses feTurbulence + feGaussianBlur + feDisplacementMap only — no feImage,
// no data-URI normal map, no primitiveUnits="objectBoundingBox". That combo
// (feImage + objectBoundingBox) has inconsistent support in Safari/WebKit;
// this procedural version uses long-supported primitives in their default
// userSpaceOnUse coordinate space, which renders reliably across engines.
export default function LiquidFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="liquid-lens" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="12" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
