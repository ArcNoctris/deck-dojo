/** Deterministic "random" pick so the same deck always resolves to the same fallback card. */
export function pickStable<T>(seed: string, items: T[]): T | null {
  if (items.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return items[hash % items.length];
}
