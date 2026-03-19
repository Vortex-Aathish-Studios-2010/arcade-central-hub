import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addEntertainmentPoints } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";

type Zone = "TL" | "TC" | "TR" | "BL" | "BC" | "BR";

const ZONES: { id: Zone; label: string; x: number; y: number }[] = [
  { id: "TL", label: "↖", x: 15, y: 25 },
  { id: "TC", label: "↑", x: 50, y: 20 },
  { id: "TR", label: "↗", x: 85, y: 25 },
  { id: "BL", label: "↙", x: 15, y: 65 },
  { id: "BC", label: "↓", x: 50, y: 70 },
  { id: "BR", label: "↘", x: 85, y: 65 },
];

const GK_DIVE_ZONES: Zone[] = ["TL", "TC", "TR", "BL", "BC", "BR"];

export const PenaltyKickGame = ({ onComplete }: { onComplete?: (score: number) => void }) => {
  const [kicks, setKicks] = useState(5);
  const [goals, setGoals] = useState(0);
  const [saves, setSaves] = useState(0);
  const [kicking, setKicking] = useState(false);
  const [lastResult, setLastResult] = useState<"goal" | "save" | null>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [gkDive, setGkDive] = useState<Zone | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const kick = useCallback((zone: Zone) => {
    if (kicking || gameOver) return;
    setKicking(true);
    sfx.click();

    const gkZone = GK_DIVE_ZONES[Math.floor(Math.random() * GK_DIVE_ZONES.length)];
    setGkDive(gkZone);

    const target = ZONES.find(z => z.id === zone)!;
    setBallPos({ x: target.x, y: target.y });

    const isGoal = gkZone !== zone;

    setTimeout(() => {
      if (isGoal) { setGoals(prev => prev + 1); setLastResult("goal"); sfx.levelComplete(); }
      else { setSaves(prev => prev + 1); setLastResult("save"); sfx.error(); }

      setTimeout(() => {
        setKicking(false); setBallPos(null); setGkDive(null); setLastResult(null);
        const remaining = kicks - 1;
        setKicks(remaining);
        if (remaining <= 0) {
          setGameOver(true);
          const finalGoals = isGoal ? goals + 1 : goals;
          addEntertainmentPoints(finalGoals * 20);
          onComplete?.(finalGoals * 20);
        }
      }, 1200);
    }, 500);
  }, [kicking, gameOver, kicks, goals, onComplete]);

  const restart = () => { setKicks(5); setGoals(0); setSaves(0); setGameOver(false); setKicking(false); setLastResult(null); setBallPos(null); setGkDive(null); };

  const gkX = gkDive ? (ZONES.find(z => z.id === gkDive)?.x ?? 50) : 50;

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex gap-4 text-sm font-sport" style={{ color: "hsl(var(--sport-text))" }}>
        <span>⚽ {kicks} kicks left</span>
        <span>Goals: {goals}/{goals + saves}</span>
      </div>

      {/* Goal */}
      <div className="relative w-72 h-48 rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(var(--sport-card)) 60%, #2d5a27 100%)" }}>
        {/* Goal frame */}
        <div className="absolute" style={{ left: "10%", right: "10%", top: "15%", bottom: "30%", border: "3px solid white", borderBottom: "none" }} />

        {/* Goalkeeper */}
        <motion.div className="absolute text-3xl" animate={{ left: `${gkX}%`, top: "40%" }} transition={{ type: "spring", stiffness: 200 }} style={{ transform: "translateX(-50%)" }}>
          🧤
        </motion.div>

        {/* Ball */}
        {ballPos && (
          <motion.div className="absolute text-xl" initial={{ left: "50%", top: "85%" }} animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }} transition={{ duration: 0.4 }}>
            ⚽
          </motion.div>
        )}

        {/* Clickable zones */}
        {!kicking && !gameOver && (
          <div className="absolute inset-0" style={{ left: "10%", right: "10%", top: "15%", bottom: "30%" }}>
            <div className="grid grid-cols-3 grid-rows-2 w-full h-full">
              {ZONES.map(zone => (
                <button key={zone.id} onClick={() => kick(zone.id)} className="hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 rounded flex items-center justify-center text-white/30 hover:text-white/60 font-sport text-lg">
                  {zone.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result overlay */}
        <AnimatePresence>
          {lastResult && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-sport font-bold" style={{ color: lastResult === "goal" ? "hsl(var(--sport-accent))" : "hsl(var(--sport-primary))" }}>
                {lastResult === "goal" ? "GOAL! ⚽" : "SAVED! 🧤"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs font-sport" style={{ color: "hsl(var(--sport-muted))" }}>Click a zone on the goal to aim your kick</p>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-sport text-lg" style={{ color: "hsl(var(--sport-text))" }}>{goals}/5 Goals!</span>
          <span className="text-xs font-sport" style={{ color: "hsl(var(--sport-muted))" }}>
            {goals >= 4 ? "🏆 Legend!" : goals >= 3 ? "👏 Great shooting!" : "Keep practicing!"}
          </span>
          <button onClick={restart} className="px-6 py-2 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}>PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
};
