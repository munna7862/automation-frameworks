/**
 * Utility helper to introduce controlled latency in route mock simulations.
 * Encapsulated outside test specs to strictly comply with test determinism rules.
 */
export const delayMs = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
