import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Player } from "../interfaces/interfaces";
import Header from "../components/Header";

interface RoundSnapshot {
  round: number;
  matches: Player[][];
  sitovers: Player[];
}

interface Tournament {
  id: string;
  createdAt: string;
  players: Player[];
  status: "active" | "finished";
  history: RoundSnapshot[];
}

const FinishedTournamentsScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((data) => {
        const finished = data.filter(
          (t: Tournament) => t.status === "finished"
        );
        setTournaments(finished);
      });
  }, []);

  return (
    <div>
      <Header />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Finished Tournaments
        </h1>
        <div className="space-y-6">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">
                Tournament from{" "}
                {new Date(tournament.createdAt).toLocaleString()}
              </h2>

              {tournament.history &&
                tournament.history.map((round) => (
                  <div key={round.round} className="mb-4">
                    <h3 className="font-bold text-xl mb-2">
                      Round {round.round}
                    </h3>
                    {round.matches.map((match, index) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-700 p-2 rounded mb-1"
                      >
                        <p className="font-semibold">Court {index + 1}</p>
                        <p>
                          {match[0].name} & {match[2].name} (
                          {match[0].roundPoints}) vs
                          {match[1].name} & {match[3].name} (
                          {match[1].roundPoints})
                        </p>
                      </div>
                    ))}
                    {round.sitovers.length > 0 && (
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Sitovers:</span>{" "}
                        {round.sitovers.map((p) => p.name).join(", ")}
                      </p>
                    )}
                  </div>
                ))}

              <div className="mt-4">
                <h3 className="font-bold text-xl">Final Leaderboard:</h3>
                <ul className="list-decimal list-inside">
                  {tournament.players
                    .sort((a, b) => b.points - a.points)
                    .map((player) => (
                      <li key={player.id}>
                        {player.name}: {player.points} points
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/"
          className="text-sky-400 hover:text-sky-500 mt-4 inline-block"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default FinishedTournamentsScreen;
