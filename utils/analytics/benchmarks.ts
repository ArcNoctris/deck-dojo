export type StatStatus = 'Optimal' | 'Good' | 'Risky' | 'Critical';

export interface EvaluationResult {
  status: StatStatus;
  color: string;
  advice: string;
}

export const evaluateStat = (type: 'Starter' | 'HandTrap' | 'Brick', probability: number): EvaluationResult => {
  if (type === 'Starter') {
    if (probability > 90) return { status: 'Optimal', color: '#10b981', advice: 'Hyper-Consistent (Ceiling may be low).' }; // Green-500
    if (probability >= 85) return { status: 'Optimal', color: '#10b981', advice: 'Optimal Competitive Standard.' };
    if (probability >= 75) return { status: 'Good', color: '#f59e0b', advice: 'Decent (Standard).' }; // Yellow-500
    return { status: 'Critical', color: '#ef4444', advice: 'Inconsistent. Add Starters.' }; // Red-500
  }

  if (type === 'Brick') {
    if (probability > 20) return { status: 'Critical', color: '#ef4444', advice: 'Critical Risk (1 in 5 games).' };
    if (probability >= 10) return { status: 'Risky', color: '#f59e0b', advice: 'Moderate Risk.' };
    return { status: 'Optimal', color: '#10b981', advice: 'Clean.' };
  }

  if (type === 'HandTrap') {
    // Heuristic: You generally want at least 1 HT going second.
    if (probability >= 80) return { status: 'Optimal', color: '#10b981', advice: 'Strong Defense.' };
    if (probability >= 60) return { status: 'Good', color: '#3b82f6', advice: 'Standard Defense.' }; // Blue-500
    if (probability >= 40) return { status: 'Risky', color: '#f59e0b', advice: 'Light Defense.' };
    return { status: 'Critical', color: '#ef4444', advice: 'Vulnerable. Add Interaction.' };
  }

  return { status: 'Good', color: '#9ca3af', advice: 'No analysis available.' };
};
