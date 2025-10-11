// Seeded random number generator for consistent server/client values
// This prevents hydration mismatches by ensuring the same "random" values are generated

class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    // Use a deterministic seed based on current timestamp if none provided
    // This ensures consistency between server and client renders
    this.seed = seed || this.generateDeterministicSeed();
  }

  private generateDeterministicSeed(): number {
    // Create a deterministic seed based on current time (same on server and client at render time)
    const now = new Date();
    return now.getTime() % 1000000; // Use last 6 digits for manageable seed
  }

  // Generate random number between 0 and 1 (same as Math.random())
  random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Generate random integer between min and max (inclusive)
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Generate random float between min and max
  randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }
}

// Create a global seeded random instance
let globalSeededRandom: SeededRandom | null = null;

// Get or create the global seeded random instance
export function getSeededRandom(): SeededRandom {
  if (!globalSeededRandom) {
    globalSeededRandom = new SeededRandom();
  }
  return globalSeededRandom;
}

// Convenience functions that use the global seeded random instance
export function seededRandom(): number {
  return getSeededRandom().random();
}

export function seededRandomInt(min: number, max: number): number {
  return getSeededRandom().randomInt(min, max);
}

export function seededRandomFloat(min: number, max: number): number {
  return getSeededRandom().randomFloat(min, max);
}
