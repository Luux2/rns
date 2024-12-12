/* eslint-disable @typescript-eslint/no-unused-vars */
import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import {
  ArrowLeftIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Player } from "../interfaces/interfaces.ts";
import Leaderboard from "../components/Leaderboard.tsx";

export const TournamentScreen = () => {
  const navigate = useNavigate();
  const { players, setPlayers } = usePlayerContext();
  const [currentRound, setCurrentRound] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [sitovers, setSitovers] = useState<Player[]>([]);

  const [playerScores, setPlayerScores] = useState<Player[]>(
    players.map((player) => ({
      ...player,
      roundPoints: 0,
      currentRoundScore: 0, // New field to track current round's temporary score
    }))
  );
  const savePlayersToLocalStorage = (players: Player[]) => {
    localStorage.setItem("players", JSON.stringify(players));
  };

  const [courtNumbers, setCourtNumbers] = useState<string[]>([
    "Bane 8",
    "Bane 9",
    "Bane 10",
    "Bane 11",
    "Bane 12",
    "Bane 2",
    "Bane 3",
    "Bane 4",
    "Bane 7",
  ]);

  const handleCourtNumberChange = (index: number, newValue: string) => {
    setCourtNumbers((prev) => {
      const updated = [...prev];
      updated[index] = newValue; // Opdaterer værdien direkte
      return updated;
    });

    // Persistér ændringen i localStorage
    localStorage.setItem("courtNumbers", JSON.stringify(courtNumbers));
  };

  useEffect(() => {
    const storedCourtNumbers = localStorage.getItem("courtNumbers");
    if (storedCourtNumbers) {
      setCourtNumbers(JSON.parse(storedCourtNumbers));
    }
  }, []);

  useEffect(() => {
    const storedPlayers = localStorage.getItem("players");
    if (storedPlayers) {
      setPlayerScores(JSON.parse(storedPlayers));
    }
  }, []);

  useEffect(() => {
    if (playerScores.length > 0 && playerScores.length % 4 !== 0) {
      const remainingPlayers = playerScores.slice(-(playerScores.length % 4));
      setSitovers(remainingPlayers);
    }
  }, [playerScores]);

  useEffect(() => {
    savePlayersToLocalStorage(playerScores);
  }, [playerScores]);

  const matches: Player[][] = [];
  for (let i = 0; i < playerScores.length; i += 4) {
    const matchPlayers = playerScores.slice(i, i + 4);
    if (matchPlayers.length === 4) {
      matches.push(matchPlayers);
    }
  }

  const saveRoundScoresToLocalStorage = (roundScores: {
    [round: number]: { [playerId: number]: number };
  }) => {
    localStorage.setItem("roundScores", JSON.stringify(roundScores));
  };

  const loadRoundScoresFromLocalStorage = () => {
    const storedRoundScores = localStorage.getItem("roundScores");
    return storedRoundScores ? JSON.parse(storedRoundScores) : {};
  };

  const [roundScores, setRoundScores] = useState<{
    [round: number]: { [playerId: number]: number };
  }>(loadRoundScoresFromLocalStorage());
  const [totalRounds, setTotalRounds] = useState<number>(1);

  const updateTeamPoints = (
    team: Player[],
    opponentTeam: Player[],
    newPoints: number
  ) => {
    setPlayerScores((prevScores) =>
      prevScores.map((player) => {
        let updatedPlayer = { ...player };

        // If points are already finalized for this player, don't update
        if (updatedPlayer.isRoundFinalized) {
          return updatedPlayer;
        }

        // Update current round score for the specific team
        if (team.some((teammate) => teammate.id === player.id)) {
          const result =
            newPoints > 16 ? "Win" : newPoints === 16 ? "Tie" : "Lose";

          // Increment stats based on the result
          if (result === "Win") {
            updatedPlayer.wins += 1;
          } else if (result === "Tie") {
            updatedPlayer.draws += 1;
          } else if (result === "Lose") {
            updatedPlayer.losses += 1;
          }

          updatedPlayer = {
            ...updatedPlayer,
            currentRoundScore: newPoints,
            roundPoints: newPoints,
            isRoundFinalized: false, // Allow points to change until "Next Round"
          };
        }
        // Update opponent team's score
        else if (opponentTeam.some((opponent) => opponent.id === player.id)) {
          const opponentScore = 32 - newPoints;
          const result =
            opponentScore > 16 ? "Win" : opponentScore === 16 ? "Tie" : "Lose";

          // Increment stats based on the result
          if (result === "Win") {
            updatedPlayer.wins += 1;
          } else if (result === "Tie") {
            updatedPlayer.draws += 1;
          } else if (result === "Lose") {
            updatedPlayer.losses += 1;
          }

          updatedPlayer = {
            ...updatedPlayer,
            currentRoundScore: opponentScore,
            roundPoints: opponentScore,
            isRoundFinalized: false, // Allow points to change until "Next Round"
          };
        }

        return updatedPlayer;
      })
    );

    // Save the points for the current round
    const updatedRoundScores = {
      ...roundScores,
      [currentRound]: {
        ...roundScores[currentRound],
        ...team.reduce((acc, player) => {
          acc[player.id] = newPoints;
          return acc;
        }, {} as { [playerId: number]: number }),
        ...opponentTeam.reduce((acc, player) => {
          acc[player.id] = 32 - newPoints;
          return acc;
        }, {} as { [playerId: number]: number }),
      },
    };

    setRoundScores(updatedRoundScores);
    saveRoundScoresToLocalStorage(updatedRoundScores);

    closeDialog();
  };

  const allMatchesHaveScores = () => {
    if (matches.length > 0) {
      return matches.every((match) => {
        const scores = match.map((player) => player.roundPoints || 0);
        const totalScore = scores.reduce((a, b) => a + b, 0);
        return totalScore > 0;
      });
    }
    return false;
  };

  const handleNextRound = () => {
    if (allMatchesHaveScores()) {
      if (currentRound < totalRounds) {
        setCurrentRound((prevRound) => prevRound + 1);
        // Restore the points for the next round
        setPlayerScores((prevScores) =>
          prevScores.map((player) => ({
            ...player,
            roundPoints: roundScores[currentRound + 1]?.[player.id] || 0,
            currentRoundScore: roundScores[currentRound + 1]?.[player.id] || 0,
          }))
        );
        return;
      }

      // Add 16 points to sitover players
      for (const sitover of sitovers) {
        setPlayerScores((prevScores) =>
          prevScores.map((player) => {
            if (player.id === sitover.id) {
              return {
                ...player,
                roundPoints: 16,
                isRoundFinalized: true,
              };
            }
            return player;
          })
        );
      }
      // Reset the sitover list at the start of each new round
      setSitovers([]);

      // Award 16 points to remaining players who haven't received points yet
      const updatedScoresWithRemainingPlayers = playerScores.map((player) => {
        if (remainingPlayers.some((p) => p.id === player.id)) {
          // Assign 16 points only if they haven't received it yet
          if (player.roundPoints === 0) {
            return {
              ...player,
              roundPoints: 0, // Assign 16 points for sitting out
              points: player.points + 16, // Update total points
            };
          }
        }
        return player;
      });

      // Update player stats based on round performance
      const updatedScores = updatedScoresWithRemainingPlayers.map((player) => {
        return {
          ...player,
          points: player.points + player.roundPoints, // Add round points to total points
          roundPoints: 0, // Reset round points after finalizing
          currentRoundScore: 0, // Reset current round score
        };
      });

      // Shuffle players randomly
      const shuffledPlayers = [...updatedScores].sort(
        () => 0.5 - Math.random()
      );

      // Select the correct ammount calculated by taking n % 4 = x chose x players to sitover
      const sitoutPlayers = shuffledPlayers.slice(
        0,
        shuffledPlayers.length % 4
      );
      setSitovers(sitoutPlayers);

      // Sort players by total points in descending order
      const sortedPlayers = [...updatedScores].sort(
        (a, b) => b.points - a.points
      );

      // Remove sitout players from the list of players who are playing
      const updatedPlayers = sortedPlayers.filter(
        (player) => !sitoutPlayers.some((sitout) => sitout.id === player.id)
      );

      // Create new matches: pair 1 & 3, 2 & 4, etc.
      const newMatches: Player[][] = [];
      for (let i = 0; i < updatedPlayers.length; i += 4) {
        const matchPlayers = updatedPlayers.slice(i, i + 4);

        if (matchPlayers.length === 4) {
          // Pair the players by their ranking (1st & 3rd, 2nd & 4th)
          newMatches.push([
            matchPlayers[0],
            matchPlayers[2],
            matchPlayers[1],
            matchPlayers[3],
          ]);
        }
      }

      // Add sitovers to the list again
      const updatedPlayerScores = updatedPlayers.concat(sitoutPlayers);

      // Update players and increment round
      setPlayerScores(updatedPlayerScores);
      setCurrentRound((prevRound) => prevRound + 1);
      setTotalRounds((prevTotal) => prevTotal + 1);
      resetPoints();
    }
  };

  useEffect(() => {
    setPlayers(playerScores);
  }, [playerScores, setPlayers]);

  const handlePreviousRound = () => {
    if (currentRound > 1) {
      setCurrentRound((prevRound) => prevRound - 1);
      // Restore the points for the previous round
      setPlayerScores((prevScores) =>
        prevScores.map((player) => ({
          ...player,
          roundPoints: roundScores[currentRound - 1]?.[player.id] || 0,
          currentRoundScore: roundScores[currentRound - 1]?.[player.id] || 0,
        }))
      );
    }
  };

  const handleExit = () => navigate("/");

  const openDialog = (team: Player[], opponentTeam: Player[]) => {
    setCurrentTeam(team);
    setOpponentTeam(opponentTeam);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setCurrentTeam([]);
    setIsDialogOpen(false);
  };

  const resetPoints = () => {
    setPlayerScores((prevScores) =>
      prevScores.map((player) => {
        if (
          currentTeam.some((teammate) => teammate.id === player.id) ||
          opponentTeam.some((opponent) => opponent.id === player.id)
        ) {
          return {
            ...player,
            roundPoints: 0,
            currentRoundScore: 0,
          };
        }
        return player;
      })
    );
    closeDialog();
  };

  // Sitovers saved in variable remainingPlayers
  const remainingPlayers = playerScores.filter((player) =>
    sitovers.some((sitover) => sitover.id === player.id)
  );

  return (
    <>
      <Animation>
        <Header />
        <div className="grid grid-cols-[75%_25%]">
          <div className="col-span-1">
            <div className="mt-4 mb-3 mx-1 px-2 py-0.5 border rounded border-gray-500 flex justify-between">
              <h1 className="font-semibold">
                🔝 Venstre par server først
              </h1>
              <h1 className="text-center font-semibold">
                ☕️ Altid gratis kaffe
              </h1>
              <h1 className="font-semibold">
                ♻️ Husk bolde - begge veje
              </h1>
            </div>

            <div className="flex justify-between px-6">
              {/* <ArrowLeftIcon
                className={`h-8 w-8 ${
                  currentRound > 1
                    ? "cursor-pointer"
                    : "text-black cursor-not-allowed"
                }`}
                onClick={handlePreviousRound}
                aria-disabled={currentRound === 1}
              /> */}
              <h1 className="text-2xl font-bold mb-3">Runde {currentRound}</h1>
              <ArrowRightIcon
                className={`h-8 w-8 ${
                  allMatchesHaveScores()
                    ? "cursor-pointer"
                    : "text-black cursor-not-allowed"
                }`}
                onClick={allMatchesHaveScores() ? handleNextRound : undefined}
                aria-disabled={!allMatchesHaveScores()}
              />
            </div>

            <div className={`mx-1 gap-x-1.5 gap-y-10 mt-4 top-4 grid ${matches.length <= 4 ? "grid-cols-1" : matches.length <= 8 ? "grid-cols-2" : "grid-cols-3"}`}>
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="relative h-20 py-4 px-1 grid grid-cols-3 rounded-lg bg-gradient-to-l from-sky-500 to-sky-200"
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md">
                    <input
                      type="text"
                      value={courtNumbers[index % courtNumbers.length]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleCourtNumberChange(index % courtNumbers.length, e.target.value)
                      }
                      className="font-bold text-black text-center bg-transparent border-none focus:outline-none focus:ring-0 w-24"
                    />
                  </div>

                  <div>
                    {[0, 2].map((idx) =>
                      match[idx] ? (
                        <div key={idx} className="text-black">
                          <h1 className="truncate pr-3">{match[idx].name}</h1>
                        </div>
                      ) : null
                    )}
                  </div>

                  <div className="flex justify-center items-center text-2xl">
                    <span
                      className="min-w-8 cursor-pointer font-mono bg-gray-900 rounded-full text-center"
                      onClick={() =>
                        openDialog(
                          [match[0], match[2]].filter(Boolean),
                          [match[1], match[3]].filter(Boolean)
                        )
                      }
                    >
                      {match[0]?.currentRoundScore ?? 0}
                    </span>
                    <h1 className="font-mono mx-1">-</h1>
                    <span
                      className="min-w-8 cursor-pointer font-mono bg-gray-900 rounded-full text-center"
                      onClick={() =>
                        openDialog(
                          [match[1], match[3]].filter(Boolean),
                          [match[0], match[2]].filter(Boolean)
                        )
                      }
                    >
                      {match[1]?.currentRoundScore ?? 0}
                    </span>
                  </div>

                  <div>
                    {[1, 3].map((idx) =>
                      match[idx] ? (
                        <div key={idx} className="text-black text-right">
                          <h1 className="pl-2 truncate">{match[idx].name}</h1>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </Animation>

      {isDialogOpen && currentTeam.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white text-black p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              Vælg point for hold:{" "}
              {currentTeam.map((player) => player.name).join(" & ")}
            </h2>
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: 33 }, (_, i) => (
                <button
                  key={i}
                  className="bg-gray-300 hover:bg-gray-300 p-2 rounded-lg font-mono"
                  onClick={() => updateTeamPoints(currentTeam, opponentTeam, i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={closeDialog}
              >
                Annuller
              </button>
              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={resetPoints}
              >
                Nulstil
              </button>
            </div>
          </div>
        </div>
      )}

      {remainingPlayers.length > 0 && (
        <div className="animate-pulse fixed bottom-0 left-1/3 transform -translate-x-1/2 flex justify-center items-center py-2">
          <h2 className="text-lg font-bold text-red-500">
            Sidder over (16 point):
          </h2>
          <p className="text-xl ml-2">
            {remainingPlayers.map((player) => player.name).join(", ")}
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 p-2">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={handleExit}
        />
      </div>
    </>
  );
};
export default TournamentScreen;
