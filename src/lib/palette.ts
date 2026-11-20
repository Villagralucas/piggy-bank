/**
 * Category colors: instead of one random color per category, the app paints
 * categories as shades of its green accent, strongest for the biggest one.
 * Amber/red are reserved for budget warnings.
 */
export function categoryShade(rank: number, total: number) {
  if (total <= 1) return "var(--primary)";
  const strength = Math.round(100 - (rank / (total - 1)) * 78); // 100% → 22%
  return `color-mix(in oklch, var(--primary) ${strength}%, var(--muted))`;
}

/** Same ramp as categoryShade, as an opacity of the accent (for SVG charts). */
export function categoryOpacity(rank: number, total: number) {
  if (total <= 1) return 1;
  return Math.round((1 - (rank / (total - 1)) * 0.75) * 100) / 100;
}
