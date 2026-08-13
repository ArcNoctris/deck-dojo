export function banLimit(banStatus: string | null): number {
  if (banStatus === 'Banned') return 0;
  if (banStatus === 'Limited') return 1;
  if (banStatus === 'Semi-Limited') return 2;
  return 3;
}
