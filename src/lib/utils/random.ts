// True random number generation using Web Crypto API
// No cheating - genuine randomness for all games

/**
 * Generate a cryptographically secure random integer between min (inclusive) and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const maxSafe = Math.floor((0xFFFFFFFF / range)) * range;
  let array = new Uint32Array(1);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= maxSafe);
  return min + (array[0] % range);
}

/**
 * Generate a cryptographically secure random float between 0 and 1
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 0xFFFFFFFF;
}

/**
 * Shuffle an array using Fisher-Yates with crypto random
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Seeded random for reproducible game states (not for gambling)
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Weighted random selection
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = secureRandom() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}