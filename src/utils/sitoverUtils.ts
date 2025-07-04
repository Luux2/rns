import { Player } from "../interfaces/interfaces.ts";

/**
 * Creates the initial random arrangement for the first round.
 * It shuffles players, selects the first sitovers, and increments their `timeSatOut` counter.
 * @param players - The initial array of all players, with `timeSatOut` initialized to 0.
 * @returns An object with the newly ordered players list and the players who are sitting out.
 */
export const createInitialArrangement = (players: Player[]) => {
  const shuffled = [...players].sort(() => 0.5 - Math.random());
  const numSitouts = players.length % 4;

  if (numSitouts === 0) {
    return { orderedPlayers: shuffled, sitovers: [] };
  }

  const sitoversToUpdate = shuffled.slice(-numSitouts);
  const playing = shuffled.slice(0, shuffled.length - numSitouts);

  // Increment timeSatOut for the players who are sitting out this first round
  const updatedSitovers = sitoversToUpdate.map((p) => ({
    ...p,
    timeSatOut: p.timeSatOut + 1,
  }));

  // The new player list is the playing group followed by the updated sitover group
  const orderedPlayers = [...playing, ...updatedSitovers];

  return { orderedPlayers, sitovers: updatedSitovers };
};

/**
 * Selects the next players to sit out based on who has the lowest `timeSatOut` count.
 * @param allPlayers - The array of all players.
 * @returns An object containing the players selected to sit out (`sitovers`).
 */
export const selectNextSitovers = (allPlayers: Player[]) => {
  const numSitouts = allPlayers.length % 4;
  if (numSitouts === 0) {
    return { sitovers: [] };
  }

  // 1. Find the minimum number of times anyone has sat out.
  const minSitOutCount = Math.min(...allPlayers.map((p) => p.timeSatOut));

  // 2. Filter for players who are eligible (i.e., have sat out the minimum number of times).
  const eligiblePlayers = allPlayers.filter(
    (p) => p.timeSatOut === minSitOutCount
  );

  // 3. Randomly select the required number of sitovers from the eligible pool.
  const shuffledEligible = eligiblePlayers.sort(() => 0.5 - Math.random());
  const newSitovers = shuffledEligible.slice(0, numSitouts);

  return { sitovers: newSitovers };
};
