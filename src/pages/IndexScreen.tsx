import Header from "../components/Header.tsx";
import { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  UserIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { usePlayerContext } from "../context/PlayerContext.tsx";
import { Player } from "../interfaces/interfaces.ts";

export const IndexScreen = () => {
  const navigate = useNavigate();
  const { players, setPlayers, playerIdCounter, setPlayerIdCounter } =
    usePlayerContext();
  const [playerName, setPlayerName] = useState<string>("");

  const listRef = useRef<HTMLDivElement>(null);

  const saveToLocalStorage = (players: Player[], counter: number) => {
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("playerIdCounter", counter.toString());
  };

  const addPlayer = (playerName: string) => {
    if (playerName === "") return;

    const uniqueName = generateUniqueName(playerName, players);

    const newPlayer: Player = {
      id: playerIdCounter,
      name: uniqueName,
      roundPoints: 0,
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentRoundScore: 0,
      isRoundFinalized: false,
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    setPlayerIdCounter(playerIdCounter + 1);
    saveToLocalStorage(updatedPlayers, playerIdCounter + 1);
    setPlayerName("");
  };

  const removePlayer = (id: number) => {
    const updatedPlayers = players.filter((player) => player.id !== id);
    setPlayers(updatedPlayers);
    saveToLocalStorage(updatedPlayers, playerIdCounter);
  };

  const generateUniqueName = (name: string, players: Player[]): string => {
    let newName = name;
    let count = 1;

    while (players.some((player) => player.name === newName)) {
      newName = `${name} (${count})`;
      count++;
    }

    return newName;
  };

  const resetGame = () => {
    setPlayers([]);
    setPlayerIdCounter(0);
    saveToLocalStorage([], 0);
  };

  const shufflePlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled);
    saveToLocalStorage(shuffled, playerIdCounter);
  };

  const startTournament = () => {
    shufflePlayers();
    navigate("/turnering");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && playerName.trim() !== "") {
      addPlayer(playerName.trim());
    }
  };

  useEffect(() => {
    const storedPlayers = localStorage.getItem("players");
    const storedCounter = localStorage.getItem("playerIdCounter");

    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    }

    if (storedCounter) {
      setPlayerIdCounter(Number(storedCounter));
    }
  }, []);

  return (
    <>
      <Header />
      <div className="my-4 flex justify-between mx-5">
        <div className="flex p-4">
          <UserIcon className="h-8 w-8" />
          <h1 className="ml-1 text-2xl">{players.length}</h1>
          <ViewColumnsIcon className="ml-10 h-8 w-8" />
          <h1 className="ml-1 text-2xl">{Math.floor(players.length / 4)}</h1>
        </div>

        <div className="flex justify-end space-x-4">
          <a
            className={`"cursor-pointer h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border
                        px-2 py-3 transition-colors ${
                          players.length < 1
                            ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-transparent border-red-500 focus:outline-none focus:ring"
                        }`}
            onClick={() => resetGame()}
            aria-disabled={players.length < 1}
          >
            <span
              className={`font-medium ${
                players.length < 1
                  ? "text-gray-600"
                  : "cursor-pointer group-hover:text-red-500 group-active:text-red-500"
              }`}
            >
              Nulstil
            </span>
            <span
              className={`shrink-0 rounded-full border p-2 ${
                players.length < 1
                  ? "border-gray-600 text-gray-600"
                  : "border-current bg-white text-red-500 group-active:text-red-500"
              }`}
            >
              🗑
            </span>
          </a>
          <a
            className={`h-16 w-48 group flex items-center justify-between gap-4 rounded-lg border px-2 py-3 transition-colors ${
              players.length < 4
                ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                : "cursor-pointer bg-sky-500 border-sky-500 hover:bg-transparent focus:outline-none focus:ring"
            }`}
            onClick={players.length >= 4 ? () => startTournament() : undefined}
            aria-disabled={players.length < 4}
          >
            <span
              className={`font-medium ${
                players.length < 4
                  ? " text-gray-600"
                  : "cursor-pointer group-hover:text-sky-500 group-active:text-sky-500"
              }`}
            >
              Start turnering
            </span>
            <span
              className={`shrink-0 rounded-full border p-2 ${
                players.length < 4
                  ? "border-gray-600 text-gray-600"
                  : "border-current bg-white text-sky-500 group-active:text-sky-500"
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
        style={{ maxHeight: "calc(100vh - 370px)" }}
      >
        {players.map((player) => (
          <div
            className="flex justify-between border-b mb-2 p-2 text-xl"
            key={player.id}
          >
            {player.name}
            <XMarkIcon
              className="text-red-500 h-8 w-8 cursor-pointer"
              onClick={() => removePlayer(player.id)}
            />
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
            onKeyPress={handleKeyPress}
            placeholder="playername"
            className="peer h-8 w-full mt-2 border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 text-xl"
          />
          <span className="absolute start-3 top-3 -translate-y-1/2 text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs">
            Indtast navn
          </span>
          <div>
            <PlusIcon
              className={`h-8 w-8 cursor-pointer ${
                playerName === "" ? "text-gray-400" : ""
              }`}
              onClick={
                playerName !== ""
                  ? () => addPlayer(playerName.trim())
                  : undefined
              }
            />
          </div>
        </label>
      </div>
    </>
  );
};

export default IndexScreen;
