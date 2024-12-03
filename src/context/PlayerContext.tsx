import React, { createContext, useState, useContext } from "react";

type PlayerContextType = {
    players: string[];
    setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<string[]>([]);

    return (
        <PlayerContext.Provider value={{ players, setPlayers }}>
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
