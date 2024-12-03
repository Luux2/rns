import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import {useState} from "react";
import { Button } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import { ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export const TournamentScreen = () => {
    const navigate = useNavigate();
    const { players } = usePlayerContext();

    const [playerScores] = useState(
        players.map((player) => ({ id: player.id, name: player.name, score: 0 }))
    );


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

    const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);

    const matches = [];
    for (let i = 0; i < sortedPlayers.length; i += 4) {
        const matchPlayers = sortedPlayers.slice(i, i + 4);
        matches.push(matchPlayers);
    }

    const handleLeaderboard = () => {
        navigate("/leaderboard");
    };

    const handleExit = () => {
        navigate("/");
    }


    const courtNumber = ["8", "9", "10", "11", "12", "2", "3", "4", "7"];



    return (
        <>
            <Animation>
                <Header />
                <div className="mt-4 mb-3 mx-5 border p-2 rounded-lg border-gray-500 grid grid-cols-3">
                    <h1 className="p-4 text-xl font-bold">🔝 Venstre par server først</h1>
                    <h1 className="text-center p-4 text-xl font-bold">☕️ Altid gratis kaffe</h1>
                    <Button
                        className="bg-gradient-to-b from-yellow-700 to-yellow-300 justify-self-end w-fit h-14 p-4 rounded-lg text-xl font-bold"
                        onClick={handleLeaderboard}
                    >
                        📊 Se tabellen
                    </Button>
                </div>
                <div className="flex justify-between px-6">
                    <ArrowLeftIcon className="h-8 w-8 text-white" />
                    <h1 className="text-center text-2xl font-bold mb-3">Runde 1</h1>
                    <ArrowRightIcon className="h-8 w-8 text-white" />
                </div>
                <div className="mx-5 grid grid-cols-3 gap-4 mt-4">
                    {matches.map((match, index) => {
                        const column1 = [match[0]?.name, match[2]?.name].filter(Boolean); // Spillere 0 og 2
                        const column2 = [match[1]?.name, match[3]?.name].filter(Boolean); // Spillere 1 og 3

                        return (
                            <div
                                key={index}
                                className="relative mb-6 p-4 grid grid-cols-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-200"
                            >
                                <div
                                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-full shadow-md"
                                >
                                    <h2 className="text-sm font-bold text-black">Bane {courtNumber[index]}</h2>
                                </div>
                                {/* Kolonne 1 */}
                                <div>
                                    {column1.map((player, idx) => (
                                        <div key={idx} className="whitespace-nowrap overflow-x-hidden text-xl text-black">
                                            <h1>{player}</h1>
                                        </div>
                                    ))}
                                </div>
                                {/* Point mellem kolonner */}
                                <div
                                    className="flex justify-center items-center text-3xl text-black cursor-pointer"
                                >
                                    <h1 className="font-mono">0</h1>
                                    <h1 className="font-mono">-</h1>
                                    <h1 className="font-mono">0</h1>
                                </div>

                                {/* Kolonne 2 */}
                                <div>
                                    {column2.map((player, idx) => (
                                        <div key={idx} className="whitespace-nowrap overflow-x-hidden text-end text-xl text-black">
                                            <h1>{player}</h1>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Animation>

            <div className="fixed bottom-0 left-0 p-4">
                <ArrowLeftStartOnRectangleIcon className="h-8 w-8" onClick={handleExit}/>
            </div>
        </>
    );
};

export default TournamentScreen;
