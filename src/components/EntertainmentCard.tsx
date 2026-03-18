import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EntertainmentGameInfo } from "@/lib/entertainmentData";
import { Lock } from "lucide-react";
import { sfx } from "@/lib/sounds";

const colorMap = {
  "sport-primary": "border-[hsl(var(--sport-primary))]/40 hover:border-[hsl(var(--sport-primary))]/80 hover:shadow-[0_0_30px_hsl(var(--sport-primary)/0.3)]",
  "sport-secondary": "border-[hsl(var(--sport-secondary))]/40 hover:border-[hsl(var(--sport-secondary))]/80 hover:shadow-[0_0_30px_hsl(var(--sport-secondary)/0.3)]",
  "sport-accent": "border-[hsl(var(--sport-accent))]/40 hover:border-[hsl(var(--sport-accent))]/80 hover:shadow-[0_0_30px_hsl(var(--sport-accent)/0.3)]",
};

const bgGradients = {
  "sport-primary": "from-[hsl(var(--sport-primary))]/20 to-[hsl(var(--sport-primary))]/5",
  "sport-secondary": "from-[hsl(var(--sport-secondary))]/20 to-[hsl(var(--sport-secondary))]/5",
  "sport-accent": "from-[hsl(var(--sport-accent))]/20 to-[hsl(var(--sport-accent))]/5",
};

const glowColors = {
  "sport-primary": "hsl(145 70% 40%)",
  "sport-secondary": "hsl(210 90% 55%)",
  "sport-accent": "hsl(35 95% 55%)",
};

export const EntertainmentCard = ({ game, index }: { game: EntertainmentGameInfo; index: number }) => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (!game.available || clicked) return;
    setClicked(true);
    sfx.click();
    setTimeout(() => navigate(`/entertainment/${game.id}`), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={handleClick}
      className={`entertainment-theme relative rounded-2xl border-2 cursor-pointer overflow-hidden transition-all aspect-square bg-gradient-to-br ${bgGradients[game.color]} ${colorMap[game.color]}`}
    >
      {/* Glow effect on click */}
      <AnimatePresence>
        {clicked && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            style={{ background: `radial-gradient(circle, ${glowColors[game.color]}40 0%, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      {/* Coming soon overlay for unavailable games */}
      {!game.available && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 rounded-2xl">
          <Lock className="w-8 h-8 text-muted-foreground" />
          <span className="ml-2 font-display text-sm text-muted-foreground">COMING SOON</span>
        </div>
      )}

      {/* ICON fills entire card - edge to edge */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="text-[8rem] sm:text-[10rem] leading-none select-none">
          {game.emoji}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end p-4 text-center">
        <div className="text-4xl mb-2">{game.emoji}</div>
        <h3 className="font-sport text-lg sm:text-xl font-bold tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>
          {game.name}
        </h3>
        <p className="text-xs mt-1 line-clamp-1" style={{ color: "hsl(var(--sport-muted))" }}>{game.description}</p>
      </div>
    </motion.div>
  );
};
