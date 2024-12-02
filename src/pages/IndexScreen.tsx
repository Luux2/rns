import Header from "../components/Header.tsx";
import { useState, useRef, useEffect } from "react";
import {PlusIcon, UserIcon, ViewColumnsIcon, XMarkIcon} from "@heroicons/react/24/outline";

export const IndexScreen = () => {
    const [players, setPlayers] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState<string>("");
    const [counter, setCounter] = useState<number>(0);
    const [courts, setCourts] = useState<number>(0);

    const listRef = useRef<HTMLDivElement>(null); // Ref til spillerlisten

    const addPlayer = () => {
        if (playerName.trim()) {
            const newPlayerCount = players.length + 1;
            setPlayers([...players, playerName]);
            setCounter(counter + 1);
            setCourts(Math.ceil(newPlayerCount / 4));
            setPlayerName("");
        }
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

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [players]);

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
                        className="h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border
                        border-red-500 bg-red-500 px-2 py-3 transition-colors hover:bg-transparent focus:outline-none focus:ring"
                        onClick={() => resetGame()}
                    >
                        <span
                            className="font-medium transition-colors group-hover:text-red-500 group-active:text-red-500"
                        >
                            Nulstil
                        </span>
                        <span
                            className="shrink-0 rounded-full border border-current bg-white p-2 text-red-500 group-active:text-red-500">
                            🗑
                        </span>
                    </a>
                    <a
                        className="h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border border-sky-500 bg-sky-500 px-2 py-3 transition-colors hover:bg-transparent focus:outline-none focus:ring"
                        href="#"
                    >
                        <span
                            className="font-medium transition-colors group-hover:text-sky-500 group-active:text-sky-500"
                        >
                            Start turnering
                        </span>
                        <span
                            className="shrink-0 rounded-full border border-current bg-white p-2 text-sky-500 group-active:text-sky-500">
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
                {players.map((player, index) => (
                    <div className="flex justify-between border-b mb-2 p-2 text-xl" key={index}>
                        {player}
                        <XMarkIcon className="text-red-500 h-8 w-8 cursor-pointer" onClick={() => removePlayer(index)}/>
                    </div>
                ))}
            </div>

            {/* Inputfeltet fast i bunden */}
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
                            onClick={addPlayer}
                        />
                    </div>
                </label>
            </div>
        </>
    );
};

export default IndexScreen;
