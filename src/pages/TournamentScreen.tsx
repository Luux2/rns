import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { Player } from "../interfaces/interfaces.ts";
import Leaderboard from "../components/Leaderboard.tsx";
import { AnimatePresence, motion } from "framer-motion";
import gif from "../assets/fire.gif";
import ExitDialog from "../components/ExitDialog.tsx";
import {
  createInitialArrangement,
  selectNextSitovers,
} from "../utils/sitoverUtils.ts";

export const TournamentScreen = () => {
  const navigate = useNavigate();
  const { players, setPlayers } = usePlayerContext();

  // --- State Initialization from LocalStorage ---
  const [playerScores, setPlayerScores] = useState<Player[]>(() => {
    const stored = localStorage.getItem("players");
    if (stored) return JSON.parse(stored);
    return players.map((p) => ({
      ...p,
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      roundPoints: 0,
      currentRoundScore: 0,
      isRoundFinalized: false,
      timeSatOut: 0, // Initialize counter at 0
    }));
  });

  const [currentRound, setCurrentRound] = useState<number>(() => {
    const stored = localStorage.getItem("currentRound");
    return stored ? parseInt(stored, 10) : 1;
  });

  const [sitovers, setSitovers] = useState<Player[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [useCourtNumbers2, setUseCourtNumbers2] = useState(false);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const [roundScores, setRoundScores] = useState<{
    [round: number]: { [playerId: number]: number };
  }>(() => {
    const stored = localStorage.getItem("roundScores");
    return stored ? JSON.parse(stored) : {};
  });

  // --- State Persistence to LocalStorage ---
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(playerScores));
    setPlayers(playerScores);
  }, [playerScores, setPlayers]);

  useEffect(() => {
    localStorage.setItem("currentRound", currentRound.toString());
  }, [currentRound]);

  useEffect(() => {
    localStorage.setItem("roundScores", JSON.stringify(roundScores));
  }, [roundScores]);

  // --- Initial Tournament Setup ---
  useEffect(() => {
    if (!localStorage.getItem("tournamentStarted")) {
      setIsStartDialogOpen(true);
    }
    if (!localStorage.getItem("tournamentStarted") && playerScores.length > 0) {
      const { orderedPlayers } = createInitialArrangement(playerScores);
      setPlayerScores(orderedPlayers);
      localStorage.setItem("tournamentStarted", "true");
    }
  }, []);

  // --- Derived State ---
  useEffect(() => {
    const numSitouts = playerScores.length % 4;
    if (numSitouts > 0) {
      setSitovers(playerScores.slice(-numSitouts));
    } else {
      setSitovers([]);
    }
  }, [playerScores]);

  const matches: Player[][] = [];
  const playingScores = playerScores.filter(
    (p) => !sitovers.some((s) => s.id === p.id)
  );
  for (let i = 0; i < playingScores.length; i += 4) {
    matches.push(playingScores.slice(i, i + 4));
  }

  // --- Handlers and Logic ---
  const handleNextRound = () => {
    if (!allMatchesHaveScores()) return;

    // 1. Finalize scores from the completed round.
    const finalizedScores = playerScores.map((player) => {
      const isSitover = sitovers.some((s) => s.id === player.id);
      const pointsForRound = isSitover ? 16 : player.roundPoints;

      const updatedPlayer = { ...player };
      updatedPlayer.points += pointsForRound;

      if (!isSitover) {
        if (pointsForRound > 16) updatedPlayer.wins += 1;
        else if (pointsForRound < 16 && pointsForRound > 0)
          updatedPlayer.losses += 1;
        else if (pointsForRound === 16) updatedPlayer.draws += 1;
      }

      updatedPlayer.roundPoints = 0;
      updatedPlayer.currentRoundScore = 0;
      updatedPlayer.isRoundFinalized = false;

      return updatedPlayer;
    });

    // 2. Sort players by their new total points.
    const sortedPlayers = [...finalizedScores].sort(
      (a, b) => b.points - a.points
    );

    // 3. Select sitovers for the NEXT round based on the fairest distribution.
    const { sitovers: nextSitovers } = selectNextSitovers(sortedPlayers);

    // 4. Increment the sit-out counter for the players just selected to sit out.
    const playersWithUpdatedSitoutCount = sortedPlayers.map((p) => {
      if (nextSitovers.some((s) => s.id === p.id)) {
        return { ...p, timeSatOut: p.timeSatOut + 1 };
      }
      return p;
    });

    // 5. Create the final player list for the next round.
    const playingNextRound = playersWithUpdatedSitoutCount.filter(
      (p) => !nextSitovers.some((s) => s.id === p.id)
    );
    const nextRoundPlayerOrder = [...playingNextRound, ...nextSitovers];

    // 6. Update state for the new round.
    setPlayerScores(nextRoundPlayerOrder);
    setCurrentRound((prev) => prev + 1);
  };

  const handleExit = () => {
    localStorage.removeItem("players");
    localStorage.removeItem("hasSatOut"); // Keep for cleanup
    localStorage.removeItem("roundScores");
    localStorage.removeItem("currentRound");
    localStorage.removeItem("tournamentStarted");
    setPlayers([]);
    navigate("/");
  };

  const updateTeamPoints = (
    team: Player[],
    opponentTeam: Player[],
    newPoints: number
  ) => {
    setPlayerScores((prevScores) =>
      prevScores.map((player) => {
        let updatedPlayer = { ...player };
        if (team.some((teammate) => teammate.id === player.id)) {
          updatedPlayer.currentRoundScore = newPoints;
          updatedPlayer.roundPoints = newPoints;
        } else if (opponentTeam.some((opponent) => opponent.id === player.id)) {
          const opponentScore = 32 - newPoints;
          updatedPlayer.currentRoundScore = opponentScore;
          updatedPlayer.roundPoints = opponentScore;
        }
        return updatedPlayer;
      })
    );
    closeDialog();
  };

  const allMatchesHaveScores = () => {
    if (matches.length === 0 && sitovers.length > 0) return true;
    return matches.every((match) => {
      const totalScore = match.reduce(
        (sum, player) => sum + (player.roundPoints || 0),
        0
      );
      return totalScore > 0;
    });
  };

  const closeDialog = () => {
    setCurrentTeam([]);
    setIsDialogOpen(false);
  };

  const openDialog = (team: Player[], opponentTeam: Player[]) => {
    setCurrentTeam(team);
    setOpponentTeam(opponentTeam);
    setIsDialogOpen(true);
  };

  const resetPoints = () => {
    setPlayerScores((prevScores) =>
      prevScores.map((player) => {
        if (
          currentTeam.some((t) => t.id === player.id) ||
          opponentTeam.some((o) => o.id === player.id)
        ) {
          return { ...player, roundPoints: 0, currentRoundScore: 0 };
        }
        return player;
      })
    );
    closeDialog();
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
    "Bane 15",
    "Bane 16",
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
    "Bane 15",
  ]);
  const currentCourts = useCourtNumbers2 ? courtNumbers2 : courtNumbers;
  const handleCourtChange = () => setUseCourtNumbers2((prev) => !prev);

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

  // --- JSX ---
  return (
    <>
      <div
        className={`min-h-screen -mt-20 fixed inset-0 z-50 bg-gray-500 bg-opacity-90 flex items-center justify-center ${
          exitDialogVisible ? "" : "hidden"
        }`}
      >
        <ExitDialog
          handleConfirm={handleExit}
          onCancel={() => setExitDialogVisible(false)}
        />
      </div>
      <Animation>
        <Header />
        <div className="grid grid-cols-[75%_25%]">
          <div className="col-span-1">
            <div className="mb-3 mx-1 px-2 py-0.5 border rounded border-gray-500 flex justify-between">
              <h1 className="font-semibold">🔝 Venstre par server først</h1>
              <h1 className="text-center font-semibold">
                ☕️ Altid gratis kaffe
              </h1>
              <h1 className="font-semibold">♻️ Husk bolde - begge veje</h1>
            </div>
            <div className="flex justify-between px-6">
              <div className="h-8 w-8"></div>
              <h1 className="text-2xl font-bold mb-3 animate-pulse">
                Runde {currentRound}
              </h1>
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
            <div
              className={`mx-1 gap-x-1.5 gap-y-10 mt-4 top-4 grid ${
                matches.length <= 4
                  ? "grid-cols-1"
                  : matches.length <= 8
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              <AnimatePresence>
                {matches.map((match, index) => {
                  const team1Score = match[0]?.currentRoundScore ?? 0;
                  const team2Score = match[1]?.currentRoundScore ?? 0;
                  const isHighScore = team1Score >= 24 || team2Score >= 24;
                  return (
                    <motion.div
                      key={index}
                      className={`relative h-20 grid grid-cols-3 rounded-lg bg-gradient-to-t from-orange-500 via-yellow-300 to-sky-300 ${
                        (matches.length === 9 || matches.length === 10) &&
                        index === 0
                          ? "col-span-3 text-xl py-2 px-2"
                          : "py-4 pr-0.5"
                      }`}
                      variants={matchVariants}
                      style={
                        isHighScore
                          ? {
                              backgroundImage: `url(${gif})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : {}
                      }
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={transitionSettings}
                    >
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md">
                        <div className="font-bold text-black text-center bg-transparent border-none focus:outline-none focus:ring-0 w-24 py-1">
                          {matches.length < 9
                            ? currentCourts.filter(
                                (court) => court !== "Bane 1"
                              )[index % (currentCourts.length - 1)]
                            : currentCourts[index % currentCourts.length]}
                        </div>
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
                              {" "}
                              <h1
                                className={`truncate ${
                                  isHighScore ? "text-white" : "text-black"
                                }`}
                              >
                                {" "}
                                {match[idx].name}{" "}
                              </h1>{" "}
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
                              [match[1], match[3]].filter(Boolean)
                            )
                          }
                        >
                          {" "}
                          {match[0]?.currentRoundScore ?? 0}{" "}
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
                          {" "}
                          {match[1]?.currentRoundScore ?? 0}{" "}
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
                              {" "}
                              <h1
                                className={`pl-1 truncate ${
                                  isHighScore ? "text-white" : "text-black"
                                }`}
                              >
                                {" "}
                                {match[idx].name}{" "}
                              </h1>{" "}
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
          <div>
            <Leaderboard />
          </div>
        </div>
      </Animation>
      {isStartDialogOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white text-black p-4 rounded-lg shadow-lg max-w-4xl">
            <h2 className="text-3xl font-bold mb-4">
              {" "}
              Velkommen til Rise 'n Shine ☀️{" "}
            </h2>
            <p className="mb-2 font-semibold text-xl">
              {" "}
              Mexicano-format - kampgenerering baseret på placering{" "}
            </p>
            <p className="mb-2 font-semibold text-xl">
              {" "}
              Bedst á 32 point pr. kamp{" "}
            </p>
            <p className="mb-2 font-semibold text-xl">2x4 server pr. spiller</p>
            <p className="mb-2 font-semibold text-xl">
              {" "}
              Parret til venstre starter med serven og tager bolde med ud.{" "}
            </p>
            <p className="mb-2 font-semibold text-xl">
              {" "}
              Efter sidste runde bedes I tage boldene med tilbage.{" "}
            </p>
            <p className="mb-4 font-semibold text-xl">
              {" "}
              Hvis appen ikke virker er det nok Jens' skyld.{" "}
            </p>
            <p className="mb-4 font-semibold text-4xl">God fornøjelse!</p>
            <div className="flex justify-end">
              <button
                className="bg-green-500 rounded-lg p-2 text-white font-bold mt-4"
                onClick={() => setIsStartDialogOpen(false)}
              >
                {" "}
                Vamos!{" "}
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
          >
            <motion.div
              className="bg-white text-black p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h2 className="text-lg font-bold mb-4">
                {" "}
                Vælg point for hold:{" "}
                {currentTeam.map((player) => player.name).join(" & ")}{" "}
              </h2>
              <div className="grid grid-cols-11 gap-2">
                {Array.from({ length: 33 }, (_, i) => (
                  <button
                    key={i}
                    className="bg-gray-300 hover:bg-gray-400 p-2 rounded-lg font-mono"
                    onClick={() =>
                      updateTeamPoints(currentTeam, opponentTeam, i)
                    }
                  >
                    {" "}
                    {i}{" "}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={closeDialog}
                >
                  {" "}
                  Annuller{" "}
                </button>
                <button
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={resetPoints}
                >
                  {" "}
                  Nulstil{" "}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {sitovers.length > 0 && (
        <div className="animate-pulse fixed bottom-0 left-1/3 transform -translate-x-1/2 flex justify-center items-center py-2">
          <h2 className="text-lg font-bold text-red-500">
            {" "}
            Sidder over (16 point):{" "}
          </h2>
          <p className="text-xl ml-2">
            {" "}
            {sitovers.map((player) => player.name).join(", ")}{" "}
          </p>
        </div>
      )}
      <div className="flex justify-between p-2 fixed inset-0 h-fit">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={() => setExitDialogVisible(true)}
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
