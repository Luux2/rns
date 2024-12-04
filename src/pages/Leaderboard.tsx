import Header from "../components/Header.tsx";
import { usePlayerContext } from "../context/PlayerContext.tsx";
import Animation from "../components/Animation.tsx";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

const Leaderboard = () => {
    const { players } = usePlayerContext();
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    const handleNavigateBack = () => {
        window.history.back();
    }

    return (
        <Animation>
            <Header />
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center mb-4">
                    <ArrowLeftCircleIcon 
                        className="h-10 w-10 cursor-pointer text-gray-600 hover:text-gray-900" 
                        onClick={handleNavigateBack}
                    />
                    <h1 className="text-2xl font-bold ml-4">Leaderboard</h1>
                </div>
                
                <div className="grid grid-cols-4 font-bold border-b pb-2">
                    <div>Rank</div>
                    <div>Name</div>
                    <div>W-D-L</div>
                    <div>Points</div>
                </div>
                
                {sortedPlayers.map((player, index) => (
                    <div 
                        key={player.name} 
                        className="grid grid-cols-4 py-2 border-b items-center"
                    >
                        <div>{index + 1}.</div>
                        <div>{player.name}</div>
                        <div>{player.wins}-{player.draws}-{player.losses}</div>
                        <div>{player.points}</div>
                    </div>
                ))}
            </div>
        </Animation>
    );
};

export default Leaderboard;