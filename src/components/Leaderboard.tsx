import { usePlayerContext } from "../context/PlayerContext.tsx";

const Leaderboard = () => {
  const { players } = usePlayerContext();

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <>
        <div className="h-[calc(100vh-180px)] mr-1 overflow-y-auto">
      <div className="mt-4 grid grid-cols-[50%_35%_15%] rounded border border-gray-500 sticky top-0 bg-gray-900">
        <div></div>
        <h2 className="text-lg text-center font-bold">V-U-T</h2>
        <h2 className="text-lg text-center font-bold pl-2">P</h2>
      </div>

      <div className="mt-2 space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`grid grid-cols-[50%_35%_15%] items-center rounded-lg shadow-md h-10 ${
              index === 0
                ? "bg-gradient-to-r from-yellow-400 to-white"
                : "bg-white"
            } ${
              index === 1
                ? "bg-gradient-to-r from-slate-500 to-white"
                : "bg-white"
            }
                             ${
                               index === 2
                                 ? "bg-gradient-to-r from-yellow-700 to-white"
                                 : "bg-white"
                             } `}
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
    </>
  );
};

export default Leaderboard;
