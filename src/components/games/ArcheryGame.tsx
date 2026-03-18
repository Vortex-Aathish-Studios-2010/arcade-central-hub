import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addEntertainmentPoints } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";

export const ArcheryGame = ({ onComplete }: { onComplete?: (score: number) => void }) => {
  const [arrows, setArrows] = useState(5);
  const [score, setScore] = useState(0);
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [shooting, setShooting] = useState(false);
  const [hitPos, setHitPos] = useState<{ x: number; y: number; ring: number } | null>(null);
  const [hits, setHits] = useState<{ x: number; y: number; ring: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (gameOver || shooting) return;
    const speed = 0.03;
    const animate = () => {
      timeRef.current += speed;
      const t = timeRef.current;
      const x = 50 + 35 * Math.sin(t * 1.3) * Math.cos(t * 0.7);
      const y = 50 + 35 * Math.cos(t * 1.1) * Math.sin(t * 0.9);
      setCrosshairPos({ x, y });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameOver, shooting]);

  const shoot = useCallback(() => {
    if (shooting || gameOver || arrows <= 0) return;
    setShooting(true);
    sfx.click();

    const dx = crosshairPos.x - 50;
    const dy = crosshairPos.y - 50;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let ring: number;
    let points: number;
    if (dist < 5) { ring = 0; points = 100; }
    else if (dist < 10) { ring = 1; points = 80; }
    else if (dist < 18) { ring = 2; points = 60; }
    else if (dist < 26) { ring = 3; points = 40; }
    else if (dist < 34) { ring = 4; points = 20; }
    else { ring = 5; points = 10; }

    const hit = { x: crosshairPos.x, y: crosshairPos.y, ring };
    setHitPos(hit);
    setHits(prev => [...prev, hit]);
    setScore(prev => prev + points);
    setArrows(prev => prev - 1);

    setTimeout(() => {
      setShooting(false);
      setHitPos(null);
      if (arrows - 1 <= 0) {
        setGameOver(true);
        const finalScore = score + points;
        addEntertainmentPoints(Math.round(finalScore / 10));
        sfx.levelComplete();
        onComplete?.(finalScore);
      }
    }, 800);
  }, [shooting, gameOver, arrows, crosshairPos, score, onComplete]);

  const restart = () => {
    setArrows(5);
    setScore(0);
    setHits([]);
    setGameOver(false);
    setShooting(false);
    setHitPos(null);
  };

  // Enhanced ring colors with gradients
  const ringGradients = [
    { fill: "url(#goldGrad)", stroke: "#FFD700" },    // Bullseye - gold
    { fill: "url(#redGrad1)", stroke: "#FF3333" },     // Red inner
    { fill: "url(#redGrad2)", stroke: "#CC2222" },     // Red outer
    { fill: "url(#blueGrad1)", stroke: "#4488FF" },    // Blue inner
    { fill: "url(#blueGrad2)", stroke: "#3366CC" },    // Blue outer
    { fill: "url(#whiteGrad)", stroke: "#CCCCCC" },    // White outer
  ];

  const ringRadii = [5, 10, 18, 26, 34, 42];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-4">
      {/* Stats bar */}
      <div className="flex justify-between w-full font-sport tracking-wider text-lg">
        <span style={{ color: "hsl(var(--sport-text))" }}>🏹 {arrows} arrows</span>
        <span style={{ color: "hsl(var(--sport-accent))" }}>Score: {score}</span>
      </div>

      {/* Target with enhanced visuals */}
      <div className="relative w-full aspect-square max-w-[400px]">
        <svg viewBox="0 0 100 100" className="w-full h-full" onClick={shoot}>
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="goldGrad">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="100%" stopColor="#FFB800" />
            </radialGradient>
            <radialGradient id="redGrad1">
              <stop offset="0%" stopColor="#FF6666" />
              <stop offset="100%" stopColor="#CC0000" />
            </radialGradient>
            <radialGradient id="redGrad2">
              <stop offset="0%" stopColor="#FF4444" />
              <stop offset="100%" stopColor="#990000" />
            </radialGradient>
            <radialGradient id="blueGrad1">
              <stop offset="0%" stopColor="#66AAFF" />
              <stop offset="100%" stopColor="#2266CC" />
            </radialGradient>
            <radialGradient id="blueGrad2">
              <stop offset="0%" stopColor="#4488FF" />
              <stop offset="100%" stopColor="#1144AA" />
            </radialGradient>
            <radialGradient id="whiteGrad">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DDDDDD" />
            </radialGradient>
            {/* Bloom glow filter */}
            <filter id="bloom">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="arrowGlow">
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in="SourceGraphic" />
            </filter>
          </defs>

          {/* Background - dark grass */}
          <rect x="0" y="0" width="100" height="100" fill="#1a2e1a" rx="8" />

          {/* Target stand */}
          <rect x="46" y="85" width="8" height="12" fill="#5C3A1E" rx="1" />
          <rect x="40" y="93" width="20" height="4" fill="#4A2E16" rx="2" />

          {/* Target board with glow */}
          <circle cx="50" cy="50" r="44" fill="#2a1810" stroke="#3a2820" strokeWidth="1" filter="url(#bloom)" />

          {/* Target rings - reversed order for proper layering */}
          {[...ringRadii].reverse().map((radius, idx) => {
            const ringIdx = ringRadii.length - 1 - idx;
            return (
              <circle
                key={ringIdx}
                cx="50" cy="50" r={radius}
                fill={ringGradients[ringIdx].fill}
                stroke={ringGradients[ringIdx].stroke}
                strokeWidth="0.5"
                style={{ filter: ringIdx === 0 ? "url(#bloom)" : undefined }}
              />
            );
          })}

          {/* Bloom effect on bullseye */}
          <circle cx="50" cy="50" r="6" fill="none" stroke="#FFD70060" strokeWidth="3" filter="url(#bloom)" />

          {/* Previous hits - arrows with glow */}
          {hits.map((h, i) => (
            <g key={i}>
              <circle cx={h.x} cy={h.y} r="2" fill="#FF440080" filter="url(#arrowGlow)" />
              <circle cx={h.x} cy={h.y} r="1" fill="#FF4400" stroke="#FFaa00" strokeWidth="0.3" />
              <line x1={h.x} y1={h.y} x2={h.x} y2={h.y - 6} stroke="#8B4513" strokeWidth="0.5" />
              <polygon points={`${h.x},${h.y - 6} ${h.x - 1.5},${h.y - 4} ${h.x + 1.5},${h.y - 4}`} fill="#4a9" />
            </g>
          ))}

          {/* Current hit flash with bloom */}
          {hitPos && (
            <motion.circle
              cx={hitPos.x} cy={hitPos.y} r="3"
              fill="#FFFF00"
              filter="url(#bloom)"
              initial={{ opacity: 1, r: 2 }}
              animate={{ opacity: 0, r: 8 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Crosshair with glow */}
          {!shooting && !gameOver && (
            <g filter="url(#arrowGlow)">
              <circle cx={crosshairPos.x} cy={crosshairPos.y} r="3" fill="none" stroke="#00FF88" strokeWidth="0.8" />
              <line x1={crosshairPos.x - 5} y1={crosshairPos.y} x2={crosshairPos.x + 5} y2={crosshairPos.y} stroke="#00FF88" strokeWidth="0.5" />
              <line x1={crosshairPos.x} y1={crosshairPos.y - 5} x2={crosshairPos.x} y2={crosshairPos.y + 5} stroke="#00FF88" strokeWidth="0.5" />
            </g>
          )}
        </svg>
      </div>

      {/* Shoot button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={shoot}
        disabled={shooting || gameOver}
        className="w-full max-w-xs py-4 rounded-xl font-sport text-2xl tracking-widest transition-all disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, hsl(35 95% 45%), hsl(35 95% 60%))",
          color: "hsl(var(--sport-bg))",
          boxShadow: "0 4px 20px hsl(35 95% 55% / 0.4)",
        }}
      >
        🏹 SHOOT
      </motion.button>

      {/* Game over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="font-sport text-3xl tracking-wider" style={{ color: "hsl(var(--sport-accent))" }}>
            Final Score: {score}
          </p>
          <p className="font-sport-body" style={{ color: "hsl(var(--sport-text))" }}>
            {score >= 400 ? "🎯 Sharpshooter!" : score >= 250 ? "👏 Great aim!" : "Keep practicing!"}
          </p>
          <button
            onClick={restart}
            className="px-8 py-3 rounded-xl font-sport text-xl tracking-wider"
            style={{
              background: "linear-gradient(135deg, hsl(145 70% 40%), hsl(145 70% 55%))",
              color: "hsl(var(--sport-bg))",
              boxShadow: "0 4px 20px hsl(145 70% 50% / 0.4)",
            }}
          >
            PLAY AGAIN
          </button>
        </motion.div>
      )}
    </div>
  );
};
