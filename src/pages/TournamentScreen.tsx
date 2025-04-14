import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon, HashtagIcon,
} from "@heroicons/react/24/outline";
import { Player } from "../interfaces/interfaces.ts";
import Leaderboard from "../components/Leaderboard.tsx";
import {AnimatePresence, motion} from "framer-motion";
//import gif from "../assets/fire.gif";
import eastergif from "../assets/chicken3.gif"

export const TournamentScreen = () => {
  const navigate = useNavigate();
  const { players, setPlayers } = usePlayerContext();
  const [currentRound, setCurrentRound] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [sitovers, setSitovers] = useState<Player[]>([]);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [useCourtNumbers2, setUseCourtNumbers2] = useState(false);



  useEffect(() => {
    setIsStartDialogOpen(true);
  }, []);

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

  const [courtNumbers] = useState<string[]>([
    "Bane 8",
    "Bane 9",
    "Bane 10",
    "Bane 11",
    "Bane 12",
    "Bane 1",
    "Bane 2",
    "Bane 3",
    "Bane 4",
    "Bane 7",
    "Bane 15"
  ]);

  const [courtNumbers2] = useState<string[]>([
    "Bane 8",
    "Bane 9",
    "Bane 10",
    "Bane 11",
    "Bane 12",
    "Bane 2",
    "Bane 3",
    "Bane 4",
    "Bane 7",
    "Bane 13",
    "Bane 15"
  ]);

  const currentCourts = useCourtNumbers2 ? courtNumbers2 : courtNumbers;


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
        const updatedPlayer = {
          ...player,
          points: player.points + player.roundPoints, // Add round points to total points
          roundPoints: 0, // Reset round points after finalizing
          currentRoundScore: 0, // Reset current round score
        };

        // Determine win, tie, or loss based on roundPoints
        if (player.roundPoints > 16) {
          updatedPlayer.wins += 1;
        } else if (player.roundPoints === 16) {
          updatedPlayer.draws += 1;
        } else if (player.roundPoints > 0) {
          updatedPlayer.losses += 1;
        }

        return updatedPlayer;
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
      //TODO: Slet efter påske
      setEasterCourtIndex(Math.floor(Math.random() * newMatches.length));

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

  /*const handlePreviousRound = () => {
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
  };*/

  const handleExit = () => navigate("/");

  const handleCourtChange = () => {
    setUseCourtNumbers2(prevState => !prevState);
  }

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

  const playerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };


  const matchVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const transitionSettings = { duration: 0.8, ease: "easeInOut" };

  const [easterCourtIndex, setEasterCourtIndex] = useState<number>(() => Math.floor(Math.random() * matches.length));

  return (
    <>
      <Animation>
        <Header />
        <div className="grid grid-cols-[75%_25%]">
          <div className="col-span-1">
            <div className="mb-3 mx-1 px-2 py-0.5 border rounded border-gray-500 flex justify-between">
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
              <div className="h-8 w-8"></div>
              <h1 className="text-2xl font-bold mb-3 animate-pulse">Runde {currentRound}</h1>
              <ArrowRightIcon
                className={`h-8 w-8 ${
                  allMatchesHaveScores()
                    ? "cursor-pointer animate-bounce"
                    : "text-black cursor-not-allowed"
                }`}
                onClick={allMatchesHaveScores() ? handleNextRound : undefined}
                aria-disabled={!allMatchesHaveScores()}
              />
            </div>

            <div className={`mx-1 gap-x-1.5 gap-y-10 mt-4 top-4 grid ${matches.length <= 4 ? "grid-cols-1" : matches.length <= 8 ? "grid-cols-2" : "grid-cols-3"}`}>
              <AnimatePresence>
                {matches.map((match, index) => {
                  // Tjek om et af holdene har en score på 27 eller mere
                  const team1Score = match[0]?.currentRoundScore ?? 0;
                  const team2Score = match[1]?.currentRoundScore ?? 0;
                  const isHighScore = team1Score >= 24 || team2Score >= 24;

                  return (
                      <motion.div
                          key={index}
                          className={`relative h-20 grid grid-cols-3 rounded-lg bg-gradient-to-t from-pink-200 via-yellow-200 to-green-200 ${(matches.length === 9 || matches.length === 10) && index === 0 ? "col-span-3 text-xl py-2 px-2" : "py-4 pr-0.5"}`}
                          //className={`relative h-20 grid grid-cols-3 rounded-lg bg-gradient-to-t from-orange-500 via-yellow-300 to-sky-300 ${(matches.length === 9 || matches.length === 10) && index === 0 ? "col-span-3 text-xl py-2 px-2" : "py-4 pr-0.5"}`}
                          variants={matchVariants}
                          //TODO: Ændr backgroundSize til cover
                          style={isHighScore ? { backgroundImage: /*`url(${gif})`*/ `url(${eastergif}`, backgroundSize: "contain", backgroundPosition: "center"} : {}}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={transitionSettings}
                      >
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md">
                          <div className="font-bold text-black text-center bg-transparent border-none focus:outline-none focus:ring-0 w-24 py-1">
                            {(matches.length < 9
                                    ? currentCourts.filter((court) => court !== "Bane 1")[index % (currentCourts.length - 1)]
                                    : currentCourts[index % currentCourts.length])
                                + (index === easterCourtIndex ? " 🐣" : "")}
                          </div>
                          {/*<div className="font-bold text-black text-center bg-transparent border-none focus:outline-none focus:ring-0 w-24 py-1">
                            {matches.length < 9
                                ? currentCourts.filter((court) => court !== "Bane 1")[index % (currentCourts.length - 1)]
                                : currentCourts[index % currentCourts.length]}
                          </div>*/}
                        </div>

                        <div>
                          {[0, 2].map((idx) =>
                              match[idx] ? (
                                  <motion.div
                                      key={match[idx].id}
                                      className="text-black"
                                      variants={playerVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      transition={transitionSettings}
                                  >
                                    <h1 className={`truncate`}>{match[idx].name}</h1>
                                    {/*<h1 className={`truncate ${isHighScore ? "text-white" : "text-black"}`}>{match[idx].name}</h1>*/}
                                  </motion.div>
                              ) : null
                          )}
                        </div>

                        <div className="flex justify-center items-center text-2xl">
                          <span
                              className="min-w-8 cursor-pointer font-mono bg-gray-900 rounded-full text-center"
                              onClick={() =>
                                  openDialog(
                    [match[0], match[2]].filter(Boolean),
                    [match[1], match[3]].filter(Boolean))
                          }
                          >
                            {match[0]?.currentRoundScore ?? 0}
                          </span>

                          <h1 className="font-mono mx-1 text-black">-</h1>
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
                                  <motion.div
                                      key={match[idx].id}
                                      className="text-black text-right"
                                      variants={playerVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      transition={transitionSettings}
                                  >
                                    <h1 className={`pl-1 truncate ${isHighScore ? "text-white" : "text-black"}`}>{match[idx].name}</h1>
                                  </motion.div>
                              ) : null
                          )}
                        </div>
                      </motion.div>
                  );
                })}

              </AnimatePresence>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </Animation>

      {isStartDialogOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white text-black p-4 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Velkommen til Rise 'n Shine ☀️</h2>
              <p className="mb-4 font-semibold text-2xl">Mexicano-format - kampgenerering baseret på placering i
                stillingen</p>
              <p className="mb-4 font-semibold text-2xl">Bedst á 32 point pr. kamp</p>
              <p className="mb-4 font-semibold text-2xl">2x4 server pr. spiller</p>
              <p className="mb-4 font-semibold text-2xl">Parret til venstre starter med serven</p>
              <p className="mb-4 font-semibold text-2xl">Brug endelig de første 5 minutter på at varme op</p>
              <p className="mb-4 font-semibold text-2xl">Parret til venstre tager bolde med ud til banerne - smid ikke
                rørene ud!</p>
              <p className="mb-4 font-semibold text-2xl">Efter sidste runde bedes I tage boldene med tilbage - gerne med
                rør</p>
              <p className="mb-4 font-semibold text-2xl">Hvis ikke der er mere kaffe er det Jens' skyld</p>
              <p className="mb-4 font-semibold text-2xl">Hvis appen ikke virker er det nok også Jens' skyld</p>
            <p className="mb-4 font-semibold text-4xl">God fornøjelse!</p>
            <div className="flex justify-end">
                <button className="bg-green-500 rounded-lg p-2 text-white font-bold mt-4"
                        onClick={() => setIsStartDialogOpen(false)}>
                Vamos!
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
      {isDialogOpen && currentTeam.length > 0 && (
          <motion.div
              className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
          >
            <motion.div
                className="bg-white text-black p-6 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h2 className="text-lg font-bold mb-4">
                Vælg point for hold: {currentTeam.map((player) => player.name).join(" & ")}
              </h2>
              <div className="grid grid-cols-11 gap-2">
                {Array.from({ length: 33 }, (_, i) => (
                    <button
                        key={i}
                        className="bg-gray-300 hover:bg-gray-400 p-2 rounded-lg font-mono transition-all duration-200"
                        onClick={() => updateTeamPoints(currentTeam, opponentTeam, i)}
                    >
                      {i}
                    </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-600"
                    onClick={closeDialog}
                >
                  Annuller
                </button>
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-600"
                    onClick={resetPoints}
                >
                  Nulstil
                </button>
              </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

      {remainingPlayers.length > 0 && (
                    <div
                        className="animate-pulse fixed bottom-0 left-1/3 transform -translate-x-1/2 flex justify-center items-center py-2">
          <h2 className="text-lg font-bold text-red-500">
            Sidder over (16 point):
          </h2>
          <p className="text-xl ml-2">
            {remainingPlayers.map((player) => player.name).join(", ")}
          </p>
        </div>
      )}


      <div className="flex justify-between p-2 fixed inset-0 h-fit">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={handleExit}
        />
        <HashtagIcon
            className="h-8 w-8 cursor-pointer"
            onClick={handleCourtChange}
        />
      </div>
    </>
  );
};
export default TournamentScreen;
