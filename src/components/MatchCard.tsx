import React from "react";
import { motion } from "framer-motion";
import { Player } from "../interfaces/interfaces.ts";
//import gif from "../assets/fire.gif";
import christmasGif from "../assets/christmasgif2.gif";

interface MatchCardProps {
  match: Player[];
  courtName: string;
  onOpenDialog: (team: Player[], opponentTeam: Player[]) => void;
  isSpecialLayout: boolean;
}

const matchVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const playerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

const transitionSettings = { duration: 0.5, ease: "easeInOut" };

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  courtName,
  onOpenDialog,
  isSpecialLayout,
}) => {
  const team1Score = match[0]?.currentRoundScore ?? 0;
  const team2Score = match[1]?.currentRoundScore ?? 0;
  const isHighScore = team1Score >= 24 || team2Score >= 24;

  const team1 = [match[0], match[2]].filter(Boolean);
  const team2 = [match[1], match[3]].filter(Boolean);

  return (
    <motion.div
      layout
      variants={matchVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transitionSettings}
      className={`relative h-20 grid grid-cols-3 rounded-lg bg-gradient-to-t 
      {/*from-orange-500 via-yellow-300 to-sky-300*/} from-white via-red-300 to-red-600
      ${isSpecialLayout ? "col-span-3 text-xl py-2 px-2" : "py-4 pr-0.5"}`}
      style={
        isHighScore
          ? {
              backgroundImage: `url(${christmasGif})`,
              backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
              backgroundPosition: "50% 35%",
            }
          : {}
      }
    >
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md">
        <div className="font-bold text-black text-center bg-transparent border-none focus:outline-none focus:ring-0 w-24 py-1">
          {courtName}
        </div>
      </div>
      <div>
        {team1.map((player) => (
          <motion.div
            key={player.id}
            className="text-black"
            variants={playerVariants}
          >
            <h1
              className={`truncate ${
                isHighScore ? "text-white" : "text-black"
              }`}
            >
              {player.name}
            </h1>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center items-center text-2xl">
        <span
          className="min-w-8 cursor-pointer font-mono bg-gray-900 rounded-full text-center"
          onClick={() => onOpenDialog(team1, team2)}
        >
          {team1Score}
        </span>
        <h1 className="font-mono mx-1 text-black">-</h1>
        <span
          className="min-w-8 cursor-pointer font-mono bg-gray-900 rounded-full text-center"
          onClick={() => onOpenDialog(team2, team1)}
        >
          {team2Score}
        </span>
      </div>
      <div>
        {team2.map((player) => (
          <motion.div
            key={player.id}
            className="text-black text-right"
            variants={playerVariants}
          >
            <h1
              className={`pl-1 truncate ${
                isHighScore ? "text-white" : "text-black"
              }`}
            >
              {player.name}
            </h1>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(MatchCard);
