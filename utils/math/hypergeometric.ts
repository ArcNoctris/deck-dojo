/**
 * Calculates the number of ways to choose k items from a set of n items.
 * Uses an iterative approach to avoid factorial overflow.
 */
const combinations = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
};

/**
 * Calculates the probability of drawing at least `desiredCount` copies of a specific card type
 * from a deck, based on the Hypergeometric Distribution.
 * 
 * Formula: P(X >= k) = 1 - P(X < k)
 * 
 * @param deckSize Total number of cards in the deck (N)
 * @param successCount Number of "success" cards in the deck (K)
 * @param handSize Number of cards drawn (n)
 * @param desiredCount Minimum number of success cards desired (k)
 * @returns The probability as a percentage (0-100)
 */
export const calculateProbability = (
  deckSize: number,
  successCount: number,
  handSize: number,
  desiredCount: number = 1
): number => {
    if (deckSize <= 0 || handSize <= 0) return 0;
    if (successCount <= 0) return 0;
    if (desiredCount > handSize || desiredCount > successCount) return 0;

    const totalWays = combinations(deckSize, handSize);
    if (totalWays === 0) return 0;

    let probLessThanDesired = 0;
    
    // Calculate P(X < desiredCount) i.e. Sum P(X=i) for i = 0 to desiredCount-1
    for (let i = 0; i < desiredCount; i++) {
        const waysToChooseSuccess = combinations(successCount, i);
        const waysToChooseFailure = combinations(deckSize - successCount, handSize - i);
        
        probLessThanDesired += (waysToChooseSuccess * waysToChooseFailure) / totalWays;
    }
    
    const probability = 1 - probLessThanDesired;
    
    // Clamp to 0-100 just in case of floating point errors (though logic should be sound)
    return Math.max(0, Math.min(100, probability * 100));
};
