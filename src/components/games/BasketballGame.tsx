import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { addEntertainmentPoints } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";

const COURT_W = 300;
const COURT_H = 400;

export const BasketballGame = ({ onComplete }: { onComplete?: (score: number) => void }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hoopX, setHoopX] = useState(150);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [throwing, setThrowing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [lastResult, setLastResult] = useState<"score" | "miss" | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hoopDir = useRef(1);

  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      setHoopX(prev => {
        if (prev >= 240) hoopDir.current = -1;
        if (prev <= 60) hoopDir.current = 1;
        return prev + hoopDir.current * 2;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          addEntertainmentPoints(score);
          sfx.levelComplete();
          onComplete?.(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [gameOver, score, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (throwing || gameOver) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerUp = () => {
    if (!dragStart || !dragCurrent || throwing || gameOver) {
      setDragStart(null); setDragCurrent(null); return;
    }
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    if (Math.abs(dy) < 20) { setDragStart(null); setDragCurrent(null); return; }

    setThrowing(true);
    sfx.click();

    const startX = 150, startY = 350;
    const targetX = startX + dx * 0.5;
    const hoopAtArrival = hoopX + hoopDir.current * 2 * 10;
    const dist = Math.abs(targetX - hoopAtArrival);
    const isScore = dist < 35;

    setBallPos({ x: startX, y: startY });

    const frames = 15;
    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame / frames;
      const x = startX + (targetX - startX) * t;
      const y = startY - 300 * t + 200 * t * t;
      setBallPos({ x, y });
      if (frame < frames) {
        requestAnimationFrame(animate);
      } else {
        if (isScore) { setScore(prev => prev + 10); setLastResult("score"); sfx.place(); }
        else { setLastResult("miss"); sfx.error(); }
        setTimeout(() => { setThrowing(false); setBallPos(null); setLastResult(null); setDragStart(null); setDragCurrent(null); }, 600);
      }
    };
    requestAnimationFrame(animate);
  };

  const restart = () => { setScore(0); setTimeLeft(30); setGameOver(false); setThrowing(false); setBallPos(null); setLastResult(null); };

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex gap-4 text-sm font-sport" style={{ color: "hsl(var(--sport-text))" }}>
        <span>⏱️ {timeLeft}s</span>
        <span>Score: {score}</span>
      </div>
      <div ref={canvasRef} className="relative rounded-xl overflow-hidden touch-none" style={{ width: COURT_W, height: COURT_H, background: "hsl(var(--sport-card))" }}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        {/* Court lines */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "hsl(var(--sport-primary))" }} />

        {/* Backboard & Hoop */}
        <div className="absolute" style={{ left: hoopX - 20, top: 60, width: 40, height: 30, border: "2px solid hsl(var(--sport-primary))", borderBottom: "none" }} />
        <div className="absolute rounded-full" style={{ left: hoopX - 15, top: 88, width: 30, height: 6, background: "hsl(var(--sport-accent))" }} />

        {/* Ball */}
        {ballPos ? (
          <div className="absolute rounded-full" style={{ left: ballPos.x - 8, top: ballPos.y - 8, width: 16, height: 16, background: "hsl(var(--sport-accent))" }} />
        ) : !throwing && (
          <div className="absolute rounded-full" style={{ left: 142, top: 340, width: 16, height: 16, background: "hsl(var(--sport-accent))" }} />
        )}

        {/* Drag indicator */}
        {dragStart && dragCurrent && (
          <line x1={dragStart.x} y1={dragStart.y} x2={dragCurrent.x} y2={dragCurrent.y} />
        )}

        {/* Result */}
        {lastResult && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-sport font-bold" style={{ color: lastResult === "score" ? "hsl(var(--sport-accent))" : "hsl(var(--sport-muted))" }}>
              {lastResult === "score" ? "🏀 SWISH!" : "MISS!"}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs font-sport" style={{ color: "hsl(var(--sport-muted))" }}>Drag up to shoot the ball toward the hoop</p>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <span className="font-sport text-lg" style={{ color: "hsl(var(--sport-text))" }}>Score: {score}!</span>
          <button onClick={restart} className="px-6 py-2 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}>PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
};
