import { useEffect, useRef, useState, useMemo } from "react";
import { usePlayerContext } from "../context/PlayerContext.tsx";

const Leaderboard = () => {
  const { players } = usePlayerContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number>();
  const scrollDirectionRef = useRef<"up" | "down">("down");
  const [isScrolling, setIsScrolling] = useState(true);

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
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
    if (!scrollContainer || !isScrolling) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }

    let lastTime: number | null = null;
    const scrollSpeed = 150;

    const autoScroll = (currentTime: number) => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      if (scrollHeight <= clientHeight) {
        return;
      }

      if (lastTime === null) {
        lastTime = currentTime;
        animationFrameIdRef.current = requestAnimationFrame(autoScroll);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      const scrollAmount = scrollSpeed * deltaTime;

      if (scrollDirectionRef.current === "down") {
        if (scrollTop + clientHeight >= scrollHeight - 1) {
          scrollDirectionRef.current = "up";
        } else {
          containerRef.current.scrollTop += scrollAmount;
        }
      } else {
        if (scrollTop <= 1) {
          scrollDirectionRef.current = "down";
        } else {
          containerRef.current.scrollTop -= scrollAmount;
        }
      }

      lastTime = currentTime;
      animationFrameIdRef.current = requestAnimationFrame(autoScroll);
    };

    animationFrameIdRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isScrolling, sortedPlayers]);

  const toggleScrolling = () => {
    setIsScrolling((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-200px)] w-full overflow-y-auto cursor-pointer"
      onClick={toggleScrolling}
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
            <h3 className="text-black text-center">{player.points}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
