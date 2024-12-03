import Header from "../components/Header.tsx";
import { usePlayerContext } from "../context/PlayerContext.tsx";
import Animation from "../components/Animation.tsx";
import {ArrowLeftCircleIcon} from "@heroicons/react/24/outline";

const LeaderboardScreen = () => {
    const { players } = usePlayerContext();

    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    const handleNavigateBack = () => {
        window.history.back();
    }

    return (
        <>
            <Animation>
            <Header />

            {/* Table header */}
            <div className="m-6 pr-2 items-center flex justify-between border-b pb-2">
                <div>
                    <ArrowLeftCircleIcon className="h-10" onClick={handleNavigateBack}/>
                </div>
                <div className="flex space-x-10">
                    <h2 className="text-lg font-bold">V-U-T</h2>
                    <h2 className="text-lg font-bold">Point</h2>
                </div>
            </div>

            {/* Player data */}
            <div className="m-6 space-y-2 overflow-y-scroll max-h-[60vh]">
                {sortedPlayers.map((player, index) => (

                    <div
                        key={player.id}
                        className={`flex justify-between items-center px-2 rounded-lg shadow-md h-8 ${
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-white" : "bg-white"} ${index === 1 ? "bg-gradient-to-r from-slate-500 to-white" : "bg-white"}
                             ${index === 2 ? "bg-gradient-to-r from-yellow-700 to-white" : "bg-white"} `}
                    >
                        <div>
                            <h3 className="text-black font-semibold">{index +1}. {player.name }</h3>
                        </div>
                        <div className="flex space-x-16">
                            <h3 className="text-black">
                                {player.wins}-{player.draws}-{player.losses}
                            </h3>
                            <h3 className="text-black font-semibold text-right">{player.points}</h3>
                        </div>
                    </div>
                ))}
            </div>
            </Animation>
        </>
    );
};

export default LeaderboardScreen;
