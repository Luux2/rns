import { usePlayerContext } from "../context/PlayerContext.tsx";

const Leaderboard = () => {
    const { players } = usePlayerContext();

    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    return (
        <>


            <div className="mt-4 pr-2 items-center flex justify-end border rounded-lg border-gray-500">
                <div className="flex space-x-6">
                    <h2 className="text-lg font-bold">V-U-T</h2>
                    <h2 className="text-lg font-bold">Point</h2>
                </div>
            </div>

            <div className="mt-2 space-y-2">
                {sortedPlayers.map((player, index) => (

                    <div
                        key={player.id}
                        className={`flex justify-between items-center px-2 rounded-lg shadow-md h-8 ${
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-white" : "bg-white"} ${index === 1 ? "bg-gradient-to-r from-slate-500 to-white" : "bg-white"}
                             ${index === 2 ? "bg-gradient-to-r from-yellow-700 to-white" : "bg-white"} `}
                    >
                        <div>
                            <h3 className="text-black font-semibold">{index + 1}. {player.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-9">
                            <h3 className="text-black">
                                {player.wins}-{player.draws}-{player.losses}
                            </h3>
                            <h3 className="text-black font-semibold text-right">
                                {player.points}
                            </h3>
                        </div>

                    </div>
                ))}
            </div>
        </>
    );
};

export default Leaderboard;
