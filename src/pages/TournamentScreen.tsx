import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  HashtagIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Player } from "../interfaces/interfaces.ts";
import Leaderboard from "../components/Leaderboard.tsx";
import { AnimatePresence } from "framer-motion";
import ExitDialog from "../components/ExitDialog.tsx";
import {
  createInitialArrangement,
  selectNextSitovers,
} from "../utils/sitoverUtils.ts";
import MatchCard from "../components/MatchCard.tsx";

export const TournamentScreen = () => {
  const navigate = useNavigate();
  const { players, setPlayers } = usePlayerContext();

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
      timeSatOut: 0,
    }));
  });

  const [currentRound, setCurrentRound] = useState<number>(() => {
    const stored = localStorage.getItem("currentRound");
    return stored ? parseInt(stored, 10) : 1;
  });

  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [courtMode, setCourtMode] = useState<"default" | "alt" | "full">("default");
  const [exitDialogVisible, setExitDialogVisible] = useState(false);
  const [reshuffleDialogOpen, setReshuffleDialogOpen] = useState(false);
  const [reshufflePassword, setReshufflePassword] = useState("");
  const [reshuffleError, setReshuffleError] = useState("");

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(playerScores));
    setPlayers(playerScores);
  }, [playerScores, setPlayers]);

  useEffect(() => {
    localStorage.setItem("currentRound", currentRound.toString());
  }, [currentRound]);

  useEffect(() => {
    if (!localStorage.getItem("tournamentStarted")) {
      setIsStartDialogOpen(true);
      const { orderedPlayers } = createInitialArrangement(playerScores);
      setPlayerScores(orderedPlayers);
      localStorage.setItem("tournamentStarted", "true");
    }
  }, []);

  const sitovers = useMemo(() => {
    const numSitouts = playerScores.length % 4;
    return numSitouts > 0 ? playerScores.slice(-numSitouts) : [];
  }, [playerScores]);

  const matches = useMemo(() => {
    const playingScores = playerScores.filter(
      (p) => !sitovers.some((s) => s.id === p.id)
    );
    const newMatches: Player[][] = [];
    for (let i = 0; i < playingScores.length; i += 4) {
      newMatches.push(playingScores.slice(i, i + 4));
    }
    return newMatches;
  }, [playerScores, sitovers]);

  const reshuffleFirstRound = useCallback(() => {
    const { orderedPlayers } = createInitialArrangement(playerScores);
    setPlayerScores(orderedPlayers);
    setReshuffleDialogOpen(false);
    setReshufflePassword("");
    setReshuffleError("");
  }, [playerScores]);

  const handleReshuffleSubmit = useCallback(() => {
    if (reshufflePassword === "4747") {
      reshuffleFirstRound();
    } else {
      setReshuffleError("Forkert adgangskode");
    }
  }, [reshufflePassword, reshuffleFirstRound]);

  const allMatchesHaveScores = useMemo(() => {
    if (matches.length === 0 && sitovers.length > 0) return true;
    return matches.every((match) =>
      match.some((player) => player.roundPoints > 0)
    );
  }, [matches, sitovers]);

  const handleNextRound = useCallback(() => {
    if (!allMatchesHaveScores) return;

    const finalizedScores = playerScores.map((player) => {
      const isSitover = sitovers.some((s) => s.id === player.id);
      const pointsForRound = isSitover ? 16 : player.roundPoints;
      const updatedPlayer = {
        ...player,
        points: player.points + pointsForRound,
      };

      if (!isSitover) {
        if (pointsForRound > 16) updatedPlayer.wins += 1;
        else if (pointsForRound < 16 && pointsForRound > 0)
          updatedPlayer.losses += 1;
        else if (pointsForRound === 16) updatedPlayer.draws += 1;
      }

      updatedPlayer.roundPoints = 0;
      updatedPlayer.currentRoundScore = 0;
      return updatedPlayer;
    });

    const sortedPlayers = [...finalizedScores].sort(
      (a, b) => b.points - a.points
    );
    const { sitovers: nextSitovers } = selectNextSitovers(sortedPlayers);

    const playersWithUpdatedSitoutCount = sortedPlayers.map((p) =>
      nextSitovers.some((s) => s.id === p.id)
        ? { ...p, timeSatOut: p.timeSatOut + 1 }
        : p
    );

    const playingNextRound = playersWithUpdatedSitoutCount.filter(
      (p) => !nextSitovers.some((s) => s.id === p.id)
    );
    const nextRoundPlayerOrder = [...playingNextRound, ...nextSitovers];

    setPlayerScores(nextRoundPlayerOrder);
    setCurrentRound((prev) => prev + 1);
  }, [playerScores, sitovers, allMatchesHaveScores]);

  const handleExit = () => navigate("/");

  const updateTeamPoints = useCallback(
    (team: Player[], opponentTeam: Player[], newPoints: number) => {
      const opponentScore = 32 - newPoints;
      const updates = new Map<number, Partial<Player>>();

      team.forEach((p) =>
        updates.set(p.id, {
          currentRoundScore: newPoints,
          roundPoints: newPoints,
        })
      );
      opponentTeam.forEach((p) =>
        updates.set(p.id, {
          currentRoundScore: opponentScore,
          roundPoints: opponentScore,
        })
      );

      setPlayerScores((prevScores) =>
        prevScores.map((player) =>
          updates.has(player.id)
            ? { ...player, ...updates.get(player.id) }
            : player
        )
      );
      setIsDialogOpen(false);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setCurrentTeam([]);
    setOpponentTeam([]);
    setIsDialogOpen(false);
  }, []);

  const openDialog = useCallback((team: Player[], opponent: Player[]) => {
    setCurrentTeam(team);
    setOpponentTeam(opponent);
    setIsDialogOpen(true);
  }, []);

  const resetPoints = useCallback(() => {
    const playerIdsToReset = new Set([
      ...currentTeam.map((p) => p.id),
      ...opponentTeam.map((o) => o.id),
    ]);

    setPlayerScores((prevScores) =>
      prevScores.map((player) =>
        playerIdsToReset.has(player.id)
          ? { ...player, roundPoints: 0, currentRoundScore: 0 }
          : player
      )
    );
    closeDialog();
  }, [currentTeam, opponentTeam, closeDialog]);

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

  const [courtNumbersFull] = useState<string[]>([
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
    "Bane 13",
    "Bane 15",
      "Bane 16"
  ]);

  const currentCourts =
      courtMode === "default"
          ? courtNumbers
          : courtMode === "alt"
              ? courtNumbers2
              : courtNumbersFull;


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

      <div className="flex justify-between p-2 fixed inset-0 h-fit z-10">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={() => setExitDialogVisible(true)}
        />
        <HashtagIcon
            className="h-8 w-8 cursor-pointer"
            onClick={() => {
              setCourtMode((prev) =>
                  prev === "default" ? "alt" : prev === "alt" ? "full" : "default"
              );
            }}
        />
      </div>

      {currentRound === 1 && (
        <button
          className="fixed left-2 bottom-2 text-gray-400 opacity-20 hover:opacity-80 text-lg bg-transparent border-none p-0 m-0 z-50"
          style={{ fontWeight: 500, background: "none" }}
          onClick={() => setReshuffleDialogOpen(true)}
          title="Bland spillerne igen"
          aria-label="Shuffle first round"
        >
          🔄
        </button>
      )}

      {reshuffleDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 w-full max-w-sm mx-4">
            <h2 className="text-xl font-bold text-black">Reshuffle 1. runde</h2>
            <label className="text-black">Adgangskode:</label>
            <input
              type="password"
              value={reshufflePassword}
              onChange={(e) => {
                setReshufflePassword(e.target.value);
                setReshuffleError("");
              }}
              className="border rounded p-2 text-black"
              autoFocus
            />
            {reshuffleError && <p className="text-red-500">{reshuffleError}</p>}
            <div className="flex gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setReshuffleDialogOpen(false)}
              >
                Annuller
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleReshuffleSubmit}
              >
                Bekræft
              </button>
            </div>
          </div>
        </div>
      )}

      <Animation>
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-[75%_25%]">
          {/* ----- MATCHES COLUMN ----- */}
          <div
            className={`${leaderboardVisible ? "hidden" : "block"} md:block`}
          >
            <div className="mb-3 mx-1 px-2 py-0.5 border rounded border-gray-500 flex flex-col text-center gap-1 text-xs md:text-sm md:flex-row md:justify-between">
              <h1 className="font-semibold">🔝 Venstre par server først</h1>
              <h1 className="font-semibold">☕️ Altid gratis kaffe</h1>
              <h1 className="font-semibold">♻️ Husk bolde - begge veje</h1>
            </div>
            <div className="flex justify-between px-6 items-center">
              <div className="h-8 w-8"></div>
              <h1 className="text-2xl font-bold mb-3 animate-pulse">
                Runde {currentRound}
              </h1>
              <ArrowRightIcon
                className={`h-8 w-8 ${
                  allMatchesHaveScores
                    ? "cursor-pointer animate-bounce"
                    : "text-black cursor-not-allowed"
                }`}
                onClick={allMatchesHaveScores ? handleNextRound : undefined}
                aria-disabled={!allMatchesHaveScores}
              />
            </div>
            <div
              className={`mx-1 gap-x-1.5 gap-y-10 mt-4 top-4 grid grid-cols-1 ${matches.length > 12
                  ? "grid-cols-3"
                  : matches.length > 8
                      ? "lg:grid-cols-3"
                      : matches.length > 4
                          ? "md:grid-cols-2"
                          : "grid-cols-1"}`}
            >
              <AnimatePresence>
                {matches.map((match, index) => {
                  const matchKey = match.map((p) => p.id).join("-");
                  const courtName =
                    matches.length < 9
                      ? currentCourts.filter((court: any) => court !== "Bane 1")[
                          index % (currentCourts.length - 1)
                        ]
                      : currentCourts[index % currentCourts.length];
                  const isSpecialLayout =
                    (matches.length === 9 || matches.length === 10 || matches.length === 13) &&
                    index === 0;

                  return (
                    <MatchCard
                      key={matchKey}
                      match={match}
                      courtName={courtName}
                      onOpenDialog={openDialog}
                      isSpecialLayout={isSpecialLayout}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* ----- LEADERBOARD COLUMN ----- */}
          <div>
            {/* Mobile Modal View */}
            <div
              className={`${
                leaderboardVisible
                  ? "fixed inset-0 bg-black/60 z-20 flex items-start justify-center p-4"
                  : "hidden"
              } md:hidden`}
            >
              <div className="bg-gray-900 rounded-lg shadow-xl h-[85vh] w-full max-w-md flex flex-col relative p-2 mt-8">
                <Leaderboard />
                <button
                  className="absolute top-2 right-2 z-30 bg-red-500 rounded-full p-1 shadow-lg"
                  onClick={() => setLeaderboardVisible(false)}
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Desktop Static View */}
            <div className="hidden md:block">
              <Leaderboard />
            </div>
          </div>
        </div>
      </Animation>

      {isStartDialogOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white text-black p-4 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-xl md:text-3xl font-bold mb-4">
              Velkommen til Rise 'n Shine ☀️
            </h2>
            <div className="space-y-2 text-sm md:text-xl font-semibold">
              <p>Mexicano-format - kampgenerering baseret på placering</p>
              <p>Bedst á 32 point pr. kamp</p>
              <p>2x4 server pr. spiller</p>
              <p>
                Parret til venstre starter med serven og tager bolde med ud.
              </p>
              <p>Efter sidste runde bedes I tage boldene med tilbage.</p>
              <p className="pt-2">
                Hvis appen ikke virker er det nok Jens' skyld.
              </p>
            </div>
            <p className="my-4 font-semibold text-2xl md:text-4xl">
              God fornøjelse!
            </p>
            <div className="flex justify-end">
              <button
                className="bg-green-500 rounded-lg p-2 text-white font-bold mt-4"
                onClick={() => setIsStartDialogOpen(false)}
              >
                Vamos!
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
            <div className="bg-white text-black p-4 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-base md:text-lg font-bold mb-4">
                Vælg point for hold:{" "}
                {currentTeam.map((player) => player.name).join(" & ")}
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Array.from({ length: 33 }, (_, i) => (
                  <button
                    key={i}
                    className="bg-gray-300 hover:bg-gray-400 p-2 rounded-lg font-mono text-sm"
                    onClick={() =>
                      updateTeamPoints(currentTeam, opponentTeam, i)
                    }
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={closeDialog}
                >
                  Annuller
                </button>
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                  onClick={resetPoints}
                >
                  Nulstil
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {sitovers.length > 0 && (
        <div className="animate-pulse fixed bottom-16 md:bottom-2 left-1/2 -translate-x-1/2 w-full max-w-md text-center bg-gray-900 bg-opacity-70 rounded-md p-1">
          <h2 className="text-base md:text-lg font-bold text-red-500 inline">
            Sidder over:
          </h2>
          <p className="text-base md:text-xl ml-2 inline">
            {sitovers.map((player) => player.name).join(", ")}
          </p>
        </div>
      )}

      <button
        className="md:hidden fixed bottom-4 right-4 bg-sky-500 rounded-full p-3 shadow-lg z-10"
        onClick={() => setLeaderboardVisible(true)}
      >
        <ListBulletIcon className="h-6 w-6 text-white" />
      </button>
    </>
  );
};

export default TournamentScreen;
