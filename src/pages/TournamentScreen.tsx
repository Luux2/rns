import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState } from "react";

export const TournamentScreen = () => {
    const { players } = usePlayerContext();

    // Introducer state til at holde styr på point for hver spiller
    const [playerScores, setPlayerScores] = useState(
        players.map((player) => ({ name: player, score: 0 }))
    );

    // Validering: Sørg for, at der er mindst 4 spillere
    if (players.length < 4) {
        return (
            <div>
                <Header />
                <h1 className="text-center text-xl text-red-500">
                    Du skal have mindst 4 spillere for at starte turneringen!
                </h1>
            </div>
        );
    }

    // Sortér spillerne efter deres score (faldende rækkefølge)
    const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);

    // Del spillerne i grupper af 4
    const matches = [];
    for (let i = 0; i < sortedPlayers.length; i += 4) {
        const matchPlayers = sortedPlayers.slice(i, i + 4); // Tag 4 spillere ad gangen
        matches.push(matchPlayers);
    }

    return (
        <>
            <Header />
            <div className="flex justify-between border-b-2">
                <h1 className="p-4 text-xl font-bold">🔝 Parret til venstre starter med serven</h1>
                <h1 className="p-4 text-xl font-bold">☕️ Gratis kaffe</h1>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                {matches.map((match, index) => {
                    const column1 = [match[0]?.name, match[2]?.name].filter(Boolean); // Spillere 0 og 2
                    const column2 = [match[1]?.name, match[3]?.name].filter(Boolean); // Spillere 1 og 3

                    return (
                        <div
                            key={index}
                            className="p-4 flex justify-between items-center rounded-lg bg-gradient-to-r from-sky-500 to-sky-200"
                        >
                            {/* Kolonne 1 */}
                            <div>
                                {column1.map((player, index) => (
                                    <div key={index} className="text-xl text-black">
                                        <h1>{player}</h1>
                                    </div>
                                ))}
                            </div>
                            {/* Point mellem kolonner */}
                            <div className="flex items-center space-x-4 text-4xl text-black">
                                <h1 className="font-mono">{match[0]?.score || 0}</h1>
                                <h1 className="font-mono">-</h1>
                                <h1 className="font-mono">{match[1]?.score || 0}</h1>
                            </div>
                            {/* Kolonne 2 */}
                            <div>
                                {column2.map((player, index) => (
                                    <div key={index} className="text-xl text-black">
                                        <h1>{player}</h1>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default TournamentScreen;
