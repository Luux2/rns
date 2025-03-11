import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "../context/PlayerContext.tsx";

const Leaderboard = () => {
    const { players } = usePlayerContext();
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
    const [isScrolling, setIsScrolling] = useState(true);

    useEffect(() => {
        const scrollContainer = containerRef.current;
        if (!scrollContainer || !isScrolling) return;

        let scrollInterval: number;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (!scrollContainer) return;

                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

                if (scrollDirection === "down") {
                    if (scrollTop + clientHeight >= scrollHeight) {
                        setScrollDirection("up");
                    } else {
                        scrollContainer.scrollTop += 1;
                    }
                } else {
                    if (scrollTop <= 0) {
                        setScrollDirection("down");
                    } else {
                        scrollContainer.scrollTop -= 1;
                    }
                }
            }, 25); // Hastighed
        };

        startAutoScroll();

        return () => clearInterval(scrollInterval);
    }, [scrollDirection, isScrolling]);


    const toggleScrolling = () => {
        setIsScrolling((prev) => !prev);
    };

    return (
        <div
            ref={containerRef}
            className="h-[calc(100vh-180px)] mr-1 overflow-y-auto cursor-pointer"
            onClick={toggleScrolling}
        >
            <div className="grid grid-cols-[55%_30%_15%] rounded border border-gray-500 sticky top-0 bg-gray-900">
                <div></div>
                <h2 className="text-lg text-center font-bold">V-U-T</h2>
                <h2 className="text-lg text-center font-bold pl-2">P</h2>
            </div>

            <div className="mt-2 space-y-2">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`grid grid-cols-[55%_30%_15%] items-center rounded-lg shadow-md h-10 ${
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-white" : "bg-white"
                        } ${
                            index === 1 ? "bg-gradient-to-r from-slate-500 to-white" : "bg-white"
                        } ${
                            index === 2 ? "bg-gradient-to-r from-yellow-700 to-white" : "bg-white"
                        }`}
                    >
                        <div>
                            <h3 className="col-span-1 text-black rounded truncate pl-1">
                                {index + 1}. {player.name}
                            </h3>
                        </div>
                        <h3 className="text-black text-center">
                            {player.wins}-{player.draws}-{player.losses}
                        </h3>
                        <h3 className="text-black text-center">{player.points}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
