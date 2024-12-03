import { usePlayerContext } from "../context/PlayerContext";
import Header from "../components/Header.tsx";
import { useState, useEffect } from "react";
import { Button } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import Animation from "../components/Animation.tsx";
import {ArrowLeftIcon, ArrowLeftStartOnRectangleIcon, ArrowRightIcon} from "@heroicons/react/24/outline";
import {Player} from "../interfaces/interfaces.ts";

export const TournamentScreen = () => {
    const navigate = useNavigate();
    const { players, setPlayers } = usePlayerContext();
    const [currentRound, setCurrentRound] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Player[]>([]); // Det hold, der skal opdateres
    const [opponentTeam, setOpponentTeam] = useState<Player[]>([]); // Det hold, der skal opdateres



    const [playerScores, setPlayerScores] = useState<Player[]>(
        players.map((player) => ({ ...player, roundPoints: 0 }))
    );



    const matches: Player[][] = [];
    for (let i = 0; i < playerScores.length; i += 4) {
        const matchPlayers = playerScores.slice(i, i + 4);
        if (matchPlayers.length === 4) {
            matches.push(matchPlayers);
        }
    }

    const updateTeamPoints = (team: Player[], opponentTeam: Player[], newPoints: number) => {
        setPlayerScores((prevScores) =>
            prevScores.map((player) => {
                if (team.some((teammate) => teammate.id === player.id)) {
                    // Opdater valgte holds point
                    return { ...player, points: newPoints };
                } else if (opponentTeam.some((opponent) => opponent.id === player.id)) {
                    // Opdater modstanderholdets point
                    return { ...player, points: 32 - newPoints };
                }
                return player; // Ingen ændringer for andre spillere
            })
        );
        closeDialog(); // Luk dialogen efter opdatering
    };


    const remainingPlayers = playerScores.slice(matches.length * 4);

    useEffect(() => {
        const updatedScores = playerScores.map((player) => ({
            ...player,
            score: remainingPlayers.some((rp) => rp.id === player.id) ? player.points + 16 : player.points,
        }));
        setPlayerScores(updatedScores);
    }, []);

    useEffect(() => {
        setPlayers(playerScores); // Synkroniser `playerScores` med context
    }, [playerScores, setPlayers]);



    // Navigation
    const handleNextRound = () => {
        setCurrentRound(currentRound + 1);
        // Implementer eventuelt logik for næste runde her
    };

    const handlePreviousRound = () => {
        if (currentRound > 1) {
            setCurrentRound(currentRound - 1);
        }
    };

    const handleLeaderboard = () => navigate("/leaderboard");
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
                if (currentTeam.some((teammate) => teammate.id === player.id)) {
                    return { ...player, points: 0 };
                } else if (opponentTeam.some((opponent) => opponent.id === player.id)) {
                    return { ...player, points: 0 };
                }
                return player;
            })
        );
        closeDialog();
    }



    return (
        <>
            <Animation>
                <Header />

                <div className="mt-4 mb-3 mx-5 border p-2 rounded-lg border-gray-500 grid grid-cols-3">
                    <h1 className="p-4 text-xl font-semibold">🔝 Venstre par server først</h1>
                    <h1 className="text-center p-4 text-xl font-semibold">☕️ Altid gratis kaffe</h1>
                    <Button
                        className="bg-gradient-to-b from-yellow-700 to-yellow-300 justify-self-end w-fit h-14 p-4 rounded-lg text-xl font-semibold"
                        onClick={handleLeaderboard}
                    >
                        📊 Se tabellen
                    </Button>
                </div>
                <div className="flex justify-between px-6">
                    <ArrowLeftIcon
                        className="h-8 w-8 text-white cursor-pointer"
                        onClick={handlePreviousRound}
                    />
                    <h1 className="text-center text-2xl font-bold mb-3">Runde {currentRound}</h1>
                    <ArrowRightIcon
                        className="h-8 w-8 text-white cursor-pointer"
                        onClick={handleNextRound}
                    />
                </div>


                <div className="mx-5 grid grid-cols-3 gap-4 mt-4">
                    {matches.map((match, index) => (
                        <div
                            key={index}
                            className="relative mb-6 p-4 grid grid-cols-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-200"
                        >
                            <div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-full shadow-md">
                                <h2 className="text-sm font-bold text-black">Bane {courtNumber[index % courtNumber.length]}</h2>
                            </div>

                            <div>
                                {[0, 2].map((idx) =>
                                    match[idx] ? (
                                        <div
                                            key={idx}
                                            className="whitespace-nowrap overflow-x-hidden text-xl text-black"
                                        >
                                            <h1>{match[idx].name}</h1>
                                        </div>
                                    ) : null
                                )}
                            </div>

                            <div className="flex justify-center items-center text-3xl text-black">
                                <span className="cursor-pointer font-mono" onClick={() => openDialog([match[0], match[2]].filter(Boolean), [match[1], match[3]].filter(Boolean))}>
                                    {match[0]?.points || 0}
                                </span>
                                <h1 className="font-mono mx-2">-</h1>
                                <span
                                    className="cursor-pointer font-mono"
                                    onClick={() =>
                                        openDialog([match[1], match[3]].filter(Boolean), [match[0], match[2]].filter(Boolean))}>
                                    {match[1]?.points || 0}
                                </span>
                            </div>


                            <div>
                                {[1, 3].map((idx) =>
                                    match[idx] ? (
                                        <div
                                            key={idx}
                                            className="whitespace-nowrap overflow-x-hidden text-end text-xl text-black"
                                        >
                                            <h1>{match[idx].name}</h1>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Animation>

            {isDialogOpen && currentTeam.length > 0 && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white text-black p-4 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">
                            Vælg point for hold: {currentTeam.map((player) => player.name).join(" & ")}
                        </h2>
                        <div className="grid grid-cols-11 gap-2">
                            {Array.from({length: 33}, (_, i) => (
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
                <div className="fixed bottom-0 right-0 p-4 flex">
                    <h2 className="text-lg font-bold text-red-500">Sidder over (16 point): </h2>
                    <p className="text-xl ml-2">
                        {remainingPlayers.map((player) => player.name).join(', ')}
                    </p>
                </div>
            )}


            <div className="fixed bottom-0 left-0 p-4">
                <ArrowLeftStartOnRectangleIcon className="h-8 w-8 cursor-pointer" onClick={handleExit}/>
            </div>
        </>
    );
};

export default TournamentScreen;
