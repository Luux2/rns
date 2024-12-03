import React, {createContext, useState, useContext, ReactNode, FC, Dispatch, SetStateAction} from "react";
import {Player} from "../interfaces/interfaces.ts";

type PlayerContextType = {
    players: Player[];
    setPlayers: Dispatch<React.SetStateAction<Player[]>>;
    playerIdCounter: number;
    setPlayerIdCounter: Dispatch<SetStateAction<number>>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerIdCounter, setPlayerIdCounter] = useState<number>(0);

    return (
        <PlayerContext.Provider value={{ players, setPlayers, playerIdCounter, setPlayerIdCounter }}>
            {children}
        </PlayerContext.Provider>
    );
};




export const usePlayerContext = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayerContext must be used within a PlayerProvider");
    }
    return context;
};
