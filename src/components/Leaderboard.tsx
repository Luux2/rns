import { useEffect, useRef, useState, useMemo } from "react";
import { Player } from "../interfaces/interfaces.ts";

const Leaderboard = ({ players }: { players: Player[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  const sortedPlayers = useMemo(
    () =>
      [...players]
        .map((p) => ({
          ...p,
          // Calculate live points for sorting and display
          livePoints: p.points + p.roundPoints,
        }))
        .sort((a, b) => {
          if (b.livePoints !== a.livePoints) {
            return b.livePoints - a.livePoints;
          }
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses;
          }
          return b.draws - a.draws;
        }),
    [players]
  );

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer || !isScrolling) return;

    let animationFrameId: number;
    let lastTime: number | null = null;
    const scrollSpeed = 0.05;

    const autoScroll = (currentTime: number) => {
      if (!containerRef.current) return;
      if (lastTime === null) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }

      const deltaTime = currentTime - lastTime;
      const scrollAmount = scrollSpeed * deltaTime;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const isAtTop = scrollTop <= 1;

      const direction = containerRef.current.dataset.scrollDirection || "down";

      if (direction === "down") {
        if (isAtBottom) {
          containerRef.current.dataset.scrollDirection = "up";
        } else {
          containerRef.current.scrollTop += scrollAmount;
        }
      } else {
        if (isAtTop) {
          containerRef.current.dataset.scrollDirection = "down";
        } else {
          containerRef.current.scrollTop -= scrollAmount;
        }
      }

      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScrolling]);

  const toggleScrolling = () => {
    setIsScrolling((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto cursor-pointer md:h-[calc(100vh-120px)] md:mr-1"
      onClick={toggleScrolling}
      data-scroll-direction="down"
    >
      <div className="grid grid-cols-[55%_30%_15%] rounded border border-gray-500 sticky top-0 bg-gray-900 z-10">
        <div></div>
        <h2 className="text-lg text-center font-bold">V-U-T</h2>
        <h2 className="text-lg text-center font-bold pl-2">P</h2>
      </div>

      <div className="mt-2 space-y-2 p-1">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`grid grid-cols-[55%_30%_15%] items-center rounded-lg shadow-md h-10 ${
              index === 0 ? "bg-gradient-to-r from-yellow-400 to-white" : ""
            } ${
              index === 1 ? "bg-gradient-to-r from-slate-400 to-white" : ""
            } ${
              index === 2 ? "bg-gradient-to-r from-yellow-700 to-white" : ""
            } ${index > 2 ? "bg-white" : ""}`}
          >
            <div>
              <h3 className="col-span-1 text-black rounded truncate pl-1">
                {index + 1}. {player.name}
              </h3>
            </div>
            <h3 className="text-black text-center">
              {player.wins}-{player.draws}-{player.losses}
            </h3>
            <h3 className="text-black text-center">{player.livePoints}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
