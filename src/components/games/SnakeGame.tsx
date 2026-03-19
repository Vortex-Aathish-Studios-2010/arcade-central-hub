import { useState, useEffect, useCallback, useRef } from "react";
import { addPoints, updateStreak, addLoss } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";
import { toast } from "sonner";
import { useDevice } from "@/lib/DeviceContext";

const COLS = 25;
const ROWS = 20;
const INITIAL_SPEED = 140;
type Pos = [number, number];

const randomFood = (snake: Pos[], obstacles: Set<string>): Pos => {
  const occupied = new Set([...snake.map(([r, c]) => `${r},${c}`), ...obstacles]);
  let pos: Pos;
  do { pos = [Math.floor(Math.random() * ROWS), Math.floor(Math.random() * COLS)]; } while (occupied.has(`${pos[0]},${pos[1]}`));
  return pos;
};

const generateObstacles = (count: number, snake: Pos[], food: Pos): Set<string> => {
  const occupied = new Set(snake.map(([r, c]) => `${r},${c}`));
  occupied.add(`${food[0]},${food[1]}`);
  const obs = new Set<string>();
  let attempts = 0;
  while (obs.size < count && attempts < 500) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const key = `${r},${c}`;
    if (!occupied.has(key) && !obs.has(key)) obs.add(key);
    attempts++;
  }
  return obs;
};

interface Props {
  level?: number;
  onComplete?: (score: number) => void;
}

export const SnakeGame = ({ onComplete }: Props) => {
  const initialSnake: Pos[] = [[10, 12], [10, 11], [10, 10]];
  const [snake, setSnake] = useState<Pos[]>(initialSnake);
  const [food, setFood] = useState<Pos>(() => randomFood(initialSnake, new Set()));
  const [dir, setDir] = useState<number[]>([0, 1]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const dirRef = useRef([0, 1]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const { device } = useDevice();

  const getPointsPerFood = () => 10 + Math.floor(snake.length / 5) * 5;

  const tick = useCallback(() => {
    setSnake((prev) => {
      const d = dirRef.current;
      const head: Pos = [prev[0][0] + d[0], prev[0][1] + d[1]];
      if (head[0] < 0 || head[0] >= ROWS || head[1] < 0 || head[1] >= COLS) {
        setGameOver(true);
        sfx.gameOver();
        setScore((s) => { addPoints(s); updateStreak("snake"); addLoss("snake"); toast.info(`Game Over! +${s} points`); onComplete?.(s); return s; });
        return prev;
      }
      if (prev.some(([r, c]) => r === head[0] && c === head[1])) {
        setGameOver(true);
        sfx.gameOver();
        setScore((s) => { addPoints(s); updateStreak("snake"); addLoss("snake"); toast.info(`Game Over! +${s} points`); onComplete?.(s); return s; });
        return prev;
      }
      if (obstacles.has(`${head[0]},${head[1]}`)) {
        setGameOver(true);
        sfx.gameOver();
        setScore((s) => { addPoints(s); updateStreak("snake"); addLoss("snake"); toast.info(`Hit obstacle! +${s} points`); onComplete?.(s); return s; });
        return prev;
      }
      const newSnake: Pos[] = [head, ...prev];
      if (head[0] === food[0] && head[1] === food[1]) {
        const pts = getPointsPerFood();
        setScore((s) => s + pts);
        sfx.eat();
        if (newSnake.length % 5 === 0) {
          const newObs = generateObstacles(2, newSnake, food);
          setObstacles((o) => new Set([...o, ...newObs]));
        }
        setFood(randomFood(newSnake, obstacles));
      } else newSnake.pop();
      return newSnake;
    });
  }, [food, obstacles]);

  useEffect(() => {
    if (!started || gameOver) { clearInterval(intervalRef.current); return; }
    const speed = Math.max(INITIAL_SPEED - (snake.length - 3) * 3, 50);
    intervalRef.current = setInterval(tick, speed);
    return () => clearInterval(intervalRef.current);
  }, [tick, gameOver, started, snake.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number[]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (map[e.key]) {
        e.preventDefault();
        sfx.move();
        if (!started) setStarted(true);
        const [dr, dc] = map[e.key];
        if (dirRef.current[0] + dr !== 0 || dirRef.current[1] + dc !== 0) { dirRef.current = [dr, dc]; setDir([dr, dc]); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started]);

  useEffect(() => {
    let sx = 0, sy = 0;
    const onStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (!started) setStarted(true);
      let nd: Pos;
      if (Math.abs(dx) > Math.abs(dy)) nd = dx > 0 ? [0, 1] : [0, -1];
      else nd = dy > 0 ? [1, 0] : [-1, 0];
      if (dirRef.current[0] + nd[0] !== 0 || dirRef.current[1] + nd[1] !== 0) { dirRef.current = nd; setDir(nd); }
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [started]);

  const reset = () => {
    sfx.click();
    setSnake(initialSnake); setFood(randomFood(initialSnake, new Set())); dirRef.current = [0, 1]; setDir([0, 1]); setGameOver(false); setScore(0); setStarted(false); setObstacles(new Set());
  };

  const snakeSet = new Set(snake.map(([r, c]) => `${r},${c}`));
  const speed = Math.max(INITIAL_SPEED - (snake.length - 3) * 3, 50);

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <div className="flex gap-4 text-sm font-display text-muted-foreground">
        <span>Score: {score}</span>
        <span>Length: {snake.length}</span>
        <span>Speed: {Math.round((1 - speed / INITIAL_SPEED) * 100)}%</span>
      </div>
      {obstacles.size > 0 && (
        <div className="flex items-center gap-1 text-xs text-accent">
          <span>⚠ {obstacles.size} obstacles</span>
        </div>
      )}

      <div className="border border-border/30 rounded-lg overflow-hidden">
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className="flex">
            {Array.from({ length: COLS }, (_, c) => {
              const key = `${r},${c}`;
              const isHead = snake[0][0] === r && snake[0][1] === c;
              const isSnake = snakeSet.has(key);
              const isFood = food[0] === r && food[1] === c;
              const isObstacle = obstacles.has(key);
              return (
                <div
                  key={c}
                  className={`w-3 h-3 ${
                    isHead ? "bg-primary rounded-sm" :
                    isSnake ? "bg-primary/60" :
                    isFood ? "bg-accent rounded-full" :
                    isObstacle ? "bg-destructive/60" :
                    "bg-background/20"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {!started && !gameOver && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {(!device || device === "laptop") ? "Press any arrow key or swipe to start" : "Use virtual controls or swipe to start"}
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {(!device || device === "laptop") ? "Arrow keys or swipe" : "Virtual controls" } · Obstacles appear as you grow!
      </p>

      {gameOver && (
        <button onClick={reset} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-display text-sm">
          PLAY AGAIN
        </button>
      )}
    </div>
  );
};
