import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { addEntertainmentPoints } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";
import { useDevice } from "@/lib/DeviceContext";

const LANES = 3;
const GAME_H = 400;

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: "car" | "cone" | "coin";
}

export const RacingGame = ({ onComplete }: { onComplete?: (score: number) => void }) => {
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const nextId = useRef(0);
  const gameLoop = useRef(0);
  const spawnTimer = useRef(0);
  const { device } = useDevice();

  const moveLeft = useCallback(() => { if (!gameOver) setLane(prev => Math.max(0, prev - 1)); }, [gameOver]);
  const moveRight = useCallback(() => { if (!gameOver) setLane(prev => Math.min(LANES - 1, prev + 1)); }, [gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (!started && (e.key === " " || e.key === "Enter")) setStarted(true);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveLeft, moveRight, started]);

  useEffect(() => {
    if (!started || gameOver) return;

    const loop = () => {
      spawnTimer.current++;
      if (spawnTimer.current % Math.max(15, 40 - score / 5) === 0) {
        const obsLane = Math.floor(Math.random() * LANES);
        const type = Math.random() < 0.25 ? "coin" : Math.random() < 0.5 ? "cone" : "car";
        setObstacles(prev => [...prev, { id: nextId.current++, lane: obsLane, y: -40, type }]);
      }

      setObstacles(prev => {
        const currentSpeed = 3 + score * 0.05;
        return prev.map(o => ({ ...o, y: o.y + currentSpeed })).filter(o => o.y < GAME_H + 40);
      });

      setObstacles(prev => {
        let hit = false;
        let coinCollected = false;
        const remaining = prev.filter(o => {
          const laneMatch = o.lane === lane;
          const yHit = o.y > GAME_H - 80 && o.y < GAME_H - 30;
          if (laneMatch && yHit) {
            if (o.type === "coin") { coinCollected = true; return false; }
            hit = true;
          }
          return true;
        });
        if (coinCollected) { setScore(prev => prev + 5); sfx.place(); }
        if (hit) { setGameOver(true); sfx.error(); addEntertainmentPoints(score); onComplete?.(score); }
        return remaining;
      });

      setScore(prev => prev + 1);
      gameLoop.current = requestAnimationFrame(loop);
    };

    gameLoop.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoop.current);
  }, [started, gameOver, lane, score, onComplete]);

  const restart = () => { setLane(1); setScore(0); setObstacles([]); setGameOver(false); setStarted(true); spawnTimer.current = 0; };

  const laneX = (l: number) => (l * 100) / LANES + 100 / LANES / 2;

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex gap-4 text-sm font-sport" style={{ color: "hsl(var(--sport-text))" }}>
        <span>🏎️ Racing</span>
        <span>Score: {score}</span>
      </div>
      <div className="relative w-72 rounded-xl overflow-hidden" style={{ height: GAME_H, background: "#333" }}>
        {/* Road lines */}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`l1-${i}`} className="absolute w-0.5 bg-yellow-400/50" style={{ left: "33%", top: `${i * 10}%`, height: "5%", animation: "scroll 0.5s linear infinite" }} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`l2-${i}`} className="absolute w-0.5 bg-yellow-400/50" style={{ left: "66%", top: `${i * 10}%`, height: "5%" }} />
        ))}

        {/* Obstacles */}
        {obstacles.map(o => (
          <motion.div key={o.id} className="absolute text-2xl" style={{ left: `${laneX(o.lane)}%`, top: o.y, transform: "translateX(-50%)" }}>
            {o.type === "car" ? "🚗" : o.type === "cone" ? "🔶" : "🪙"}
          </motion.div>
        ))}

        {/* Player car */}
        <motion.div className="absolute text-3xl" animate={{ left: `${laneX(lane)}%` }} transition={{ type: "spring", stiffness: 300 }} style={{ bottom: 40, transform: "translateX(-50%)" }}>
          🏎️
        </motion.div>

        {/* Start overlay */}
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
            <button onClick={() => setStarted(true)} className="px-6 py-3 rounded-xl font-sport text-lg tracking-wider" style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}>
              START RACE
            </button>
          </div>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(0,0,0,0.8)" }}>
            <span className="text-2xl font-sport font-bold" style={{ color: "hsl(var(--sport-accent))" }}>CRASH!</span>
            <span className="font-sport" style={{ color: "hsl(var(--sport-text))" }}>Score: {score}</span>
            <button onClick={restart} className="px-6 py-2 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}>RACE AGAIN</button>
          </div>
        )}
      </div>

      {device !== "laptop" && started && !gameOver && (
        <div className="flex gap-4">
          <button onClick={moveLeft} className="px-6 py-3 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary) / 0.2)", border: "1px solid hsl(var(--sport-primary) / 0.5)", color: "hsl(var(--sport-primary))" }}>
            ← LEFT
          </button>
          <button onClick={moveRight} className="px-6 py-3 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary) / 0.2)", border: "1px solid hsl(var(--sport-primary) / 0.5)", color: "hsl(var(--sport-primary))" }}>
            RIGHT →
          </button>
        </div>
      )}
    </div>
  );
};
