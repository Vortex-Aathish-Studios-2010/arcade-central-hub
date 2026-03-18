import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GameInfo } from "@/lib/gameData";
import { getGameLevel } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";

const colorMap = {
  primary: "border-primary/40 hover:border-primary/80 hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]",
  secondary: "border-secondary/40 hover:border-secondary/80 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.25)]",
  accent: "border-accent/40 hover:border-accent/80 hover:shadow-[0_0_30px_hsl(var(--accent)/0.25)]",
};

const bgGradients = {
  primary: "from-primary/20 to-primary/5",
  secondary: "from-secondary/20 to-secondary/5",
  accent: "from-accent/20 to-accent/5",
};

const glowColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
};

const HIDE_LEVEL_IDS = new Set(["tetris", "snake", "konoodle", "tictactoe"]);

export const GameCard = ({ game, index }: { game: GameInfo; index: number }) => {
  const navigate = useNavigate();
  const level = getGameLevel(game.id);
  const showLevel = !HIDE_LEVEL_IDS.has(game.id);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    sfx.click();
    setTimeout(() => navigate(`/game/${game.id}`), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={handleClick}
      className={`relative rounded-2xl border-2 cursor-pointer overflow-hidden transition-all aspect-square bg-gradient-to-br ${bgGradients[game.color]} ${colorMap[game.color]}`}
    >
      {/* Expanding glow ring on click */}
      <AnimatePresence>
        {clicked && (
          <>
            <motion.div
              className="absolute inset-0 rounded-2xl z-10"
              initial={{ boxShadow: `0 0 0px ${glowColors[game.color]}` }}
              animate={{ boxShadow: `0 0 80px ${glowColors[game.color]}`, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              style={{ background: `radial-gradient(circle, ${glowColors[game.color]}40 0%, transparent 70%)` }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ICON fills entire card */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="text-[8rem] sm:text-[10rem] leading-none select-none">
          {game.emoji}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end p-4 text-center">
        <div className="text-4xl mb-2">{game.emoji}</div>
        <h3 className="font-display text-sm sm:text-base font-bold text-foreground tracking-wide">
          {game.name}
        </h3>
        <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{game.description}</p>
        {showLevel && level > 1 && (
          <span className="mt-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-display">
            LVL {level}
          </span>
        )}
      </div>
    </motion.div>
  );
};
