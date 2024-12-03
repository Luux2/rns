import Header from "../components/Header.tsx";
import { useState, useRef, useEffect } from "react";
import {PlusIcon, UserIcon, ViewColumnsIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "react-router-dom";
import {usePlayerContext} from "../context/PlayerContext.tsx";

export const IndexScreen = () => {
    const navigate = useNavigate();
    const {players, setPlayers} = usePlayerContext();
    const [playerName, setPlayerName] = useState<string>("");
    const [counter, setCounter] = useState<number>(0);
    const [courts, setCourts] = useState<number>(0);

    const listRef = useRef<HTMLDivElement>(null);

    const addPlayer = (playerName: string) => {
        if (playerName === "") {
            return;
        }
        setPlayers([...players, playerName]);
        setCounter(counter + 1);
        setCourts(Math.ceil((counter + 1) / 4));
        setPlayerName("");
    };

    const removePlayer = (index: number) => {
        const newPlayers = players.filter((_, i) => i !== index);
        setPlayers(newPlayers);
        setCounter(counter - 1);
        setCourts(Math.ceil(newPlayers.length / 4));
    }

    const resetGame = () => {
        setPlayers([]);
        setCounter(0);
        setCourts(0);
        setPlayerName("");
    }

    const shufflePlayers = () => {
        const shuffledPlayers = players.sort(() => Math.random() - 0.5);
        setPlayers(shuffledPlayers);
    }

    const startTournament = () => {
        shufflePlayers();
        navigate("/turnering");
    }

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [players]);

    useEffect(() => {
        resetGame();
    }, []);

    return (
        <>
            <Header />
            <div className="mb-4 flex justify-between">
            <div className="flex p-4">
                <UserIcon className="h-8 w-8" />
                <h1 className="ml-1 text-2xl">{counter}</h1>
                <ViewColumnsIcon className="ml-10 h-8 w-8" />
                <h1 className="ml-1 text-2xl">{courts}</h1>
            </div>

                <div className="flex justify-end space-x-4">
                    <a
                        className={`"h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border
                        px-2 py-3 transition-colors ${players.length < 1 ? "bg-gray-400 border-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-transparent border-red-500 focus:outline-none focus:ring"}`}
                        onClick={() => resetGame()}
                        aria-disabled={players.length < 1}
                    >
                        <span
                            className={`font-medium ${
                                players.length < 4 ? "text-gray-600" : "group-hover:text-red-500 group-active:text-red-500"
                            }`}
                        >
                            Nulstil
                        </span>
                        <span
                            className={`shrink-0 rounded-full border p-2 ${players.length < 1 ? "border-gray-600 text-gray-600" : "border-current bg-white text-red-500 group-active:text-red-500"}`}>
                            🗑
                        </span>
                    </a>
                    <a
                        className={`h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border px-2 py-3 transition-colors ${
                            players.length < 4 ? "bg-gray-400 border-gray-400 cursor-not-allowed" : "bg-sky-500 border-sky-500 hover:bg-transparent focus:outline-none focus:ring"
                        }`}
                        onClick={players.length >= 4 ? () => startTournament() : undefined}
                        aria-disabled={players.length < 4}
                    >
    <span
        className={`font-medium ${
            players.length < 4 ? "text-gray-600" : "group-hover:text-sky-500 group-active:text-sky-500"
        }`}
    >
        Start turnering
    </span>
                        <span
                            className={`shrink-0 rounded-full border p-2 ${
                                players.length < 4 ? "border-gray-600 text-gray-600" : "border-current bg-white text-sky-500 group-active:text-sky-500"
                            }`}
                        >
        🎾
    </span>
                    </a>


                </div>
            </div>

            <div
                ref={listRef}
                className="flex-col p-4 overflow-y-auto pb-4"
                style={{maxHeight: "calc(100vh - 370px)"}}
            >
                {players.map((player: any, index: any) => (
                    <div className="flex justify-between border-b mb-2 p-2 text-xl" key={index}>
                        {player}
                        <XMarkIcon className="text-red-500 h-8 w-8 cursor-pointer" onClick={() => removePlayer(index)}/>
                    </div>
                ))}
            </div>


            <div className="fixed bottom-0 left-0 w-full p-4 bg-gray-900">
                <label
                    htmlFor="playername"
                    className="flex justify-between relative overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                >
                    <input
                        type="text"
                        id="playername"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="playername"
                        className="peer h-8 w-full mt-2 border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 text-xl"
                    />
                    <span
                        className="absolute start-3 top-3 -translate-y-1/2 text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs"
                    >
                        Indtast navn
                    </span>
                    <div>
                        <PlusIcon
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => addPlayer(playerName)}
                        />
                    </div>
                </label>
            </div>
        </>
    );
};

export default IndexScreen;
