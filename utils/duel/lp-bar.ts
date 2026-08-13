const TIER_COLORS = ['#7C5CFF', '#FF3DA6', '#38C6FF'];
const RAINBOW = 'linear-gradient(90deg,#FF3D5C,#FFA53D,#FFD23D,#3DFF8F,#3DC7FF,#7C5CFF,#FF3DA6,#FF3D5C)';

const tierColor = (idx: number) => (idx < 3 ? TIER_COLORS[idx] : RAINBOW);

export interface LpBarState {
  pct: number;
  color: string;
  pips: { key: number; color: string }[];
  extraTiers: number;
  hasPips: boolean;
}

/**
 * LP over one `startLp` renders as a filled tier (a "pip") plus the bar showing
 * the remainder — lets the bar communicate LP far above the starting total
 * (from lifegain effects) without the fill just maxing out silently.
 */
export function computeLpBar(lp: number, startLp: number): LpBarState {
  let tiers = lp > 0 ? Math.ceil(lp / startLp) - 1 : 0;
  if (tiers < 0) tiers = 0;
  const remainder = lp - tiers * startLp;
  const pct = Math.max(0, Math.min(100, (remainder / startLp) * 100));
  const color = tiers === 0
    ? (pct >= 60 ? '#35D07F' : pct >= 30 ? '#FFC53D' : '#FF3B5C')
    : tierColor(tiers - 1);
  const pipCount = Math.min(tiers, 3);
  const pips = Array.from({ length: pipCount }, (_, i) => ({ key: i, color: tierColor(i) }));
  const extraTiers = tiers > 3 ? tiers - 3 : 0;

  return { pct, color, pips, extraTiers, hasPips: tiers > 0 };
}
