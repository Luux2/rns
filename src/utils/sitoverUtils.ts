import { Player } from "../interfaces/interfaces.ts";

/**
 * Determines the initial set of players to sit out.
 * @param players - The array of all players.
 * @returns An object containing the initial sitovers and their IDs.
 */
export const getInitialSitovers = (players: Player[]) => {
  const numberOfSitouts = players.length % 4;
  if (players.length > 0 && numberOfSitouts > 0) {
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const initialSitovers = shuffledPlayers.slice(0, numberOfSitouts);
    return {
      sitovers: initialSitovers,
      hasSatOut: initialSitovers.map((p) => p.id),
    };
  }
  return { sitovers: [], hasSatOut: [] };
};

/**
 * Selects the next set of players to sit out for the upcoming round.
 * @param players - The array of all players with updated scores.
 * @param hasSatOut - An array of IDs of players who have already sat out.
 * @returns An object containing the new sitovers and the updated list of players who have sat out.
 */
export const selectNextSitovers = (players: Player[], hasSatOut: number[]) => {
  const numberOfSitouts = players.length % 4;
  let newHasSatOut = [...hasSatOut];

  if (numberOfSitouts > 0) {
    let eligibleToSitOut = players.filter((p) => !newHasSatOut.includes(p.id));

    // If all players have sat out, reset the list
    if (eligibleToSitOut.length < numberOfSitouts) {
      newHasSatOut = [];
      eligibleToSitOut = players;
    }

    const shuffledEligible = eligibleToSitOut.sort(() => 0.5 - Math.random());
    const sitoutPlayers = shuffledEligible.slice(0, numberOfSitouts);
    newHasSatOut.push(...sitoutPlayers.map((p) => p.id));

    return { sitovers: sitoutPlayers, hasSatOut: newHasSatOut };
  }

  return { sitovers: [], hasSatOut: newHasSatOut };
};
