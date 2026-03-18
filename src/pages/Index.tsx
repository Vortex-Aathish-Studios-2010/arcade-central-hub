import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { games } from "@/lib/gameData";
import { GameCard } from "@/components/GameCard";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, Gamepad2 } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";
import { getTotalWins, getTotalLosses, getPoints } from "@/lib/streaks";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "brain" ? "brain" : "select";
  const [mode, setMode] = useState<"select" | "brain">(initialMode);

  const pageVariants = {
    initial: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.04, filter: "blur(12px)" },
  };
  const pageTransition = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

  return (
    <AnimatePresence mode="wait">
      {mode === "select" ? (
        <motion.div key="select" {...pageVariants} transition={pageTransition} className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-widest text-glow-primary" style={{ color: "hsl(185 100% 50%)" }}>
            ARCADE.IO
          </h1>
          <p className="text-muted-foreground font-display text-sm tracking-widest">Choose your arena</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode("brain")}
              className="relative rounded-2xl border-2 border-primary/40 bg-card p-8 text-center hover:border-primary hover:glow-primary transition-all aspect-square flex flex-col items-center justify-center gap-4"
            >
              <Brain className="w-16 h-16 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">Brain Arcade</h2>
              <p className="text-muted-foreground text-sm">Puzzles & strategy games</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/entertainment")}
              className="relative rounded-2xl border-2 border-accent/40 bg-card p-8 text-center hover:border-accent hover:glow-accent transition-all aspect-square flex flex-col items-center justify-center gap-4 overflow-hidden"
            >
              <Gamepad2 className="w-16 h-16 text-accent" />
              <h2 className="font-display text-xl font-bold text-foreground">Entertainment Arcade</h2>
              <p className="text-muted-foreground text-sm">Sports & action games</p>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/leaderboard")}
            className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl border border-accent/40 bg-card hover:border-accent hover:glow-accent transition-all font-display text-sm"
          >
            <Trophy className="w-5 h-5 text-accent" />
            WORLDWIDE LEADERBOARD
          </motion.button>
        </motion.div>
      ) : (
        <motion.div key="brain" {...pageVariants} transition={pageTransition} className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setMode("select")} className="text-muted-foreground hover:text-foreground transition-colors font-display text-sm">
                ← BACK
              </button>
              <StatsBar />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Choose Your Challenge</h2>
            <p className="text-muted-foreground text-sm mb-6">Pick a puzzle to test your brain power.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {games.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
