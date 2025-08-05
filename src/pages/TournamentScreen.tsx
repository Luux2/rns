import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "../components/Header.tsx";
import Animation from "../components/Animation.tsx";
import Leaderboard from "../components/Leaderboard.tsx";
import ExitDialog from "../components/ExitDialog.tsx";
import MatchCard from "../components/MatchCard.tsx";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Player } from "../interfaces/interfaces.ts";
import { selectNextSitovers } from "../utils/sitoverUtils.ts";

interface RoundSnapshot {
  round: number;
  matches: Player[][];
  sitovers: Player[];
}

interface Tournament {
  id: string;
  createdAt: string;
  players: Player[];
  currentRound: number;
  status: "active" | "finished";
  history: RoundSnapshot[];
}

export const TournamentScreen = () => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Player[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<Player[]>([]);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => res.json())
      .then((data) => setTournament(data));

    const ws = new WebSocket(`ws://${window.location.host}/socket`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (
        message.type === "UPDATE_TOURNAMENT" &&
        message.payload.id === tournamentId
      ) {
        setTournament(message.payload);
      }
    };
    return () => ws.close();
  }, [tournamentId]);

  const playerScores = useMemo(() => tournament?.players || [], [tournament]);
  const currentRound = useMemo(
    () => tournament?.currentRound || 1,
    [tournament]
  );

  const updateBackend = (updatedTournamentData: Partial<Tournament>) => {
    if (!tournamentId) return;
    fetch(`/api/tournaments/${tournamentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTournamentData),
    });
  };

  const sitovers = useMemo(() => {
    if (!playerScores) return [];
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

  const allMatchesHaveScores = useMemo(() => {
    if (!tournament) return false;
    if (matches.length === 0 && sitovers.length > 0) return true;
    return matches.every((match) =>
      match.some((player) => player.roundPoints > 0)
    );
  }, [matches, sitovers, tournament]);

  const handleNextRound = useCallback(() => {
    if (!allMatchesHaveScores || !tournament) return;

    // Create a snapshot of the completed round
    const roundSnapshot: RoundSnapshot = {
      round: tournament.currentRound,
      matches: JSON.parse(JSON.stringify(matches)), // Deep copy
      sitovers: JSON.parse(JSON.stringify(sitovers)),
    };
    const newHistory = [...(tournament.history || []), roundSnapshot];

    const partnerMap = new Map<number, number>();
    matches.forEach((match) => {
      if (match.length === 4 && match[0].roundPoints === 16) {
        partnerMap.set(match[0].id, match[2].id);
        partnerMap.set(match[2].id, match[0].id);
        partnerMap.set(match[1].id, match[3].id);
        partnerMap.set(match[3].id, match[1].id);
      }
    });

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

    const sortedPlayers = [...finalizedScores].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return b.draws - a.draws;
    });

    const { sitovers: nextSitovers } = selectNextSitovers(sortedPlayers);

    const playersWithUpdatedSitoutCount = sortedPlayers.map((p) =>
      nextSitovers.some((s) => s.id === p.id)
        ? { ...p, timeSatOut: p.timeSatOut + 1 }
        : p
    );

    const playingNextRound = playersWithUpdatedSitoutCount.filter(
      (p) => !nextSitovers.some((s) => s.id === p.id)
    );

    for (let i = 0; i < playingNextRound.length; i += 4) {
      if (i + 3 < playingNextRound.length) {
        const p1 = playingNextRound[i];
        const p3 = playingNextRound[i + 2];
        if (partnerMap.get(p1.id) === p3.id) {
          const p4 = playingNextRound[i + 3];
          playingNextRound[i + 2] = p4;
          playingNextRound[i + 3] = p3;
        }
      }
    }

    const nextRoundPlayerOrder = [...playingNextRound, ...nextSitovers];

    updateBackend({
      players: nextRoundPlayerOrder,
      currentRound: tournament.currentRound + 1,
      history: newHistory,
    });
  }, [
    playerScores,
    sitovers,
    allMatchesHaveScores,
    matches,
    tournament,
    updateBackend,
  ]);

  const handleFinishTournament = () => {
    fetch(`/api/tournaments/${tournamentId}/finish`, { method: "POST" }).then(
      () => navigate("/finished")
    );
  };

  const updateTeamPoints = useCallback(
    (team: Player[], opponentTeam: Player[], newPoints: number) => {
      if (!tournament) return;
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

      const updatedPlayers = tournament.players.map((player) =>
        updates.has(player.id)
          ? { ...player, ...updates.get(player.id) }
          : player
      );

      updateBackend({ players: updatedPlayers });
      setIsDialogOpen(false);
    },
    [tournament, updateBackend]
  );

  const openDialog = useCallback((team: Player[], opponent: Player[]) => {
    setCurrentTeam(team);
    setOpponentTeam(opponent);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  if (!tournament) {
    return <div className="text-center text-xl p-8">Loading tournament...</div>;
  }

  return (
    <>
      <div
        className={`min-h-screen -mt-20 fixed inset-0 z-50 bg-gray-500 bg-opacity-90 flex items-center justify-center ${
          exitDialogVisible ? "" : "hidden"
        }`}
      >
        <ExitDialog
          handleConfirm={handleFinishTournament}
          onCancel={() => setExitDialogVisible(false)}
        />
      </div>
      <div className="flex justify-between p-2 fixed inset-0 h-fit z-10">
        <ArrowLeftStartOnRectangleIcon
          className="h-8 w-8 cursor-pointer"
          onClick={() => setExitDialogVisible(true)}
        />
      </div>
      <Animation>
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-[75%_25%]">
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
                    : "text-gray-600 cursor-not-allowed"
                }`}
                onClick={allMatchesHaveScores ? handleNextRound : undefined}
                aria-disabled={!allMatchesHaveScores}
              />
            </div>
            <div
              className={`mx-1 gap-x-1.5 gap-y-10 mt-4 top-4 grid grid-cols-1 ${
                matches.length > 12
                  ? "grid-cols-3"
                  : matches.length > 8
                  ? "lg:grid-cols-3"
                  : matches.length > 4
                  ? "md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {matches.map((match, index) => {
                  const matchKey = match.map((p) => p.id).join("-");
                  const courtName = "Bane " + (index + 1);
                  return (
                    <MatchCard
                      key={matchKey}
                      match={match}
                      courtName={courtName}
                      onOpenDialog={openDialog}
                      isSpecialLayout={false}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <div
              className={`${
                leaderboardVisible
                  ? "fixed inset-0 bg-black/60 z-20 flex items-start justify-center p-4"
                  : "hidden"
              } md:hidden`}
            >
              <div className="bg-gray-900 rounded-lg shadow-xl h-[85vh] w-full max-w-md flex flex-col relative p-2 mt-8">
                <Leaderboard players={playerScores} />
                <button
                  className="absolute top-2 right-2 z-30 bg-red-500 rounded-full p-1 shadow-lg"
                  onClick={() => setLeaderboardVisible(false)}
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <Leaderboard players={playerScores} />
            </div>
          </div>
        </div>
      </Animation>
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
              <div className="flex justify-end mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={closeDialog}
                >
                  Annuller
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
