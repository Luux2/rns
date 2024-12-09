/* eslint-disable @typescript-eslint/no-unused-vars */
import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const storedPlayers = localStorage.getItem("players");
    if (storedPlayers) {
      setPlayerScores(JSON.parse(storedPlayers));
    }
  }, []);

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

  const updateTeamPoints = (
    team: Player[],
    opponentTeam: Player[],
    newPoints: number
  ) => {
    setPlayerScores((prevScores) =>
      prevScores.map((player) => {
        // Update current round score for the specific team
        if (team.some((teammate) => teammate.id === player.id)) {
          return {
            ...player,
            currentRoundScore: newPoints,
            roundPoints: newPoints,
          };
        }
        // Update opponent team's score
        else if (opponentTeam.some((opponent) => opponent.id === player.id)) {
          return {
            ...player,
            currentRoundScore: 32 - newPoints,
            roundPoints: 32 - newPoints,
          };
        }
        return player;
      })
    );
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
      // Award 16 points to remaining players
      const updatedScoresWithRemainingPlayers = playerScores.map((player) => {
        if (remainingPlayers.some((p) => p.id === player.id)) {
          return {
            ...player,
            roundPoints: 16, // Add 16 points for sitting out
            points: player.points + 16, // Update total points
          };
        }
        return player;
      });

      // Update player stats based on round performance
      const updatedScores = updatedScoresWithRemainingPlayers.map((player) => {
        const matchingMatch = matches.find((match) =>
          match.some((matchPlayer) => matchPlayer.id === player.id)
        );

        if (matchingMatch) {
          const playerInMatch = matchingMatch.find((p) => p.id === player.id);
          const opponentTeamInMatch = matchingMatch.filter(
            (p) => p.id !== player.id
          );

          const playerRoundScore = playerInMatch?.roundPoints || 0;
          const opponentTeamScore = opponentTeamInMatch.reduce(
            (sum, p) => sum + (p.roundPoints || 0),
            0
          );

          let wins = player.wins;
          let losses = player.losses;
          let draws = player.draws;

          if (playerRoundScore > opponentTeamScore) {
            wins += 1;
          } else if (playerRoundScore < opponentTeamScore) {
            losses += 1;
          } else {
            draws += 1;
          }

          return {
            ...player,
            points: player.points + player.roundPoints, // Add round points to total points
            roundPoints: 0, // Reset round points
            currentRoundScore: 0, // Reset current round score
            wins,
            losses,
            draws,
          };
        }
        return player;
      });

      // Sort players by total points in descending order
      const sortedPlayers = [...updatedScores].sort(
        (a, b) => b.points - a.points
      );

      // Create new matches: pair 1 & 3, 2 & 4, etc.
      const newMatches: Player[][] = [];
      for (let i = 0; i < sortedPlayers.length; i += 4) {
        const matchPlayers = sortedPlayers.slice(i, i + 4);
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

      // Update players and increment round
      setPlayerScores(sortedPlayers);
      setCurrentRound((prevRound) => prevRound + 1);
    }
  };

  useEffect(() => {
    setPlayers(playerScores);
  }, [playerScores, setPlayers]);

  const handlePreviousRound = () => {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
  };

  const handleExit = () => navigate("/");

  // Banenumre
  const courtNumber = ["8", "9", "10", "11", "12", "2", "3", "4", "7"];

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

  const remainingPlayers = playerScores.slice(matches.length * 4);

  return (
    <>
      <Animation>
        <Header />
        <div className="grid grid-cols-[75%_25%]">
          <div className="col-span-1">
            <div className="mt-4 mb-3 mx-5 px-2 py-0.5 border rounded-lg border-gray-500 flex justify-between">
              <h1 className="font-semibold">
                🔝 Venstre par server først og tager boldene
              </h1>
              <h1 className="text-center font-semibold">
                ☕️ Altid gratis kaffe
              </h1>
              <h1 className="font-semibold">
                ♻️ Husk at aflevere boldene tilbage
              </h1>
            </div>

            <div className="flex justify-between px-6">
              <ArrowLeftIcon
                  className={`h-8 w-8 ${
                  currentRound > 1
                    ? "cursor-pointer"
                    : "text-black cursor-not-allowed"
                }`}
                onClick={handlePreviousRound}
                aria-disabled={currentRound === 1}
              />
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

            <div className="mx-5 grid grid-cols-3 gap-x-4 gap-y-10 mt-4 sticky top-4">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="relative h-20 py-4 px-1 grid grid-cols-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-200"
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-full shadow-md">
                    <h2 className="text-sm font-bold text-black">
                      Bane {courtNumber[index % courtNumber.length]}
                    </h2>
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

                  <div className="flex justify-center items-center text-2xl text-black">
                    <span
                      className="cursor-pointer font-mono"
                      onClick={() =>
                        openDialog(
                          [match[0], match[2]].filter(Boolean),
                          [match[1], match[3]].filter(Boolean)
                        )
                      }
                    >
                      {match[0]?.currentRoundScore ?? 0}
                    </span>
                    <h1 className="font-mono mx-2">-</h1>
                    <span
                      className="cursor-pointer font-mono"
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
                        <div key={idx} className="text-black">
                          <h1 className="truncate pl-3">{match[idx].name}</h1>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1">
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
        <div className="animate-pulse fixed bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center items-center py-4">
          <h2 className="text-lg font-bold text-red-500">
            Sidder over (16 point):
          </h2>
          <p className="text-xl ml-2">
            {remainingPlayers.map((player) => player.name).join(", ")}
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 p-4">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={handleExit}
        />
      </div>
    </>
  );
};
export default TournamentScreen;
