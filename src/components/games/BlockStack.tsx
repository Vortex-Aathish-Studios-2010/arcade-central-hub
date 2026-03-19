import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { addPoints, updateStreak, addLoss } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";
import { toast } from "sonner";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useDevice } from "@/lib/DeviceContext";

const COLS = 10;
const ROWS = 20;
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

const COLORS = [
  "bg-primary", "bg-secondary", "bg-accent",
  "bg-primary/70", "bg-secondary/70", "bg-accent/70", "bg-primary/50",
];

const SPEED_LEVELS = [
  { label: "1", ms: 600, multiplier: 1 },
  { label: "2", ms: 450, multiplier: 1.2 },
  { label: "3", ms: 350, multiplier: 1.5 },
  { label: "4", ms: 250, multiplier: 2 },
  { label: "5", ms: 180, multiplier: 2.5 },
  { label: "6", ms: 120, multiplier: 3 },
  { label: "7", ms: 80, multiplier: 4 },
  { label: "8", ms: 50, multiplier: 5 },
];

type Board = number[][];
type Piece = { shape: number[][]; x: number; y: number; color: number };

const createBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const rotate = (shape: number[][]): number[][] => {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
};

const collides = (board: Board, piece: Piece): boolean => {
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nr = piece.y + r, nc = piece.x + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true;
      if (board[nr][nc]) return true;
    }
  return false;
};

const merge = (board: Board, piece: Piece): Board => {
  const b = board.map((r) => [...r]);
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) b[piece.y + r][piece.x + c] = piece.color + 1;
  return b;
};

const clearLines = (board: Board): [Board, number] => {
  const remaining = board.filter((row) => row.some((v) => v === 0));
  const cleared = ROWS - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return [[...newRows, ...remaining], cleared];
};

const randomPiece = (): Piece => {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], x: Math.floor(COLS / 2) - 1, y: 0, color: idx };
};

interface Props {
  level?: number;
  onComplete?: (score: number) => void;
}

export const BlockStack = ({ onComplete }: Props) => {
  const [board, setBoard] = useState<Board>(createBoard);
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const { device } = useDevice();

  const currentSpeed = SPEED_LEVELS[speedLevel];

  const changeSpeed = (delta: number) => {
    setSpeedLevel(prev => {
      const next = Math.max(0, Math.min(SPEED_LEVELS.length - 1, prev + delta));
      if (next !== prev) sfx.click();
      return next;
    });
  };

  const drop = useCallback(() => {
    setPiece((prev) => {
      const next = { ...prev, y: prev.y + 1 };
      if (!collides(board, next)) return next;
      sfx.place();
      const merged = merge(board, prev);
      const [cleared, clearedLines] = clearLines(merged);
      setBoard(cleared);
      const pts = Math.round(clearedLines * clearedLines * 100 * currentSpeed.multiplier);
      if (pts > 0) {
        sfx.clear();
        setScore((s) => s + pts);
        setLines((l) => l + clearedLines);
      }
      const np = nextPiece;
      setNextPiece(randomPiece());
      if (collides(cleared, np)) {
        setGameOver(true);
        sfx.gameOver();
        setScore((s) => {
          const total = s + pts;
          addPoints(total);
          updateStreak("tetris");
          addLoss("tetris");
          toast.info(`Game Over! +${total} points (${currentSpeed.multiplier}x speed bonus)`);
          onComplete?.(total);
          return total;
        });
      }
      return np;
    });
  }, [board, nextPiece, currentSpeed.multiplier]);

  useEffect(() => {
    if (gameOver) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(drop, currentSpeed.ms);
    return () => clearInterval(intervalRef.current);
  }, [drop, gameOver, currentSpeed.ms]);

  const movePiece = useCallback((dx: number, dy: number, rot = false) => {
    if (gameOver) return;
    setPiece((prev) => {
      let next = { ...prev };
      if (rot) { next = { ...next, shape: rotate(prev.shape) }; sfx.rotate(); }
      else { next = { ...next, x: prev.x + dx, y: prev.y + dy }; sfx.move(); }
      return collides(board, next) ? prev : next;
    });
  }, [board, gameOver]);

  const hardDrop = useCallback(() => {
    if (gameOver) return;
    sfx.drop();
    setPiece((prev) => {
      let y = prev.y;
      while (!collides(board, { ...prev, y: y + 1 })) y++;
      return { ...prev, y };
    });
    setTimeout(drop, 10);
  }, [board, gameOver, drop]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, () => void> = {
        ArrowLeft: () => movePiece(-1, 0),
        ArrowRight: () => movePiece(1, 0),
        ArrowDown: () => movePiece(0, 1),
        ArrowUp: () => movePiece(0, 0, true),
        " ": hardDrop,
      };
      if (map[e.key]) { e.preventDefault(); map[e.key](); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [movePiece, hardDrop]);

  const reset = () => { setBoard(createBoard()); setPiece(randomPiece()); setNextPiece(randomPiece()); setScore(0); setLines(0); setGameOver(false); };

  const renderBoard = () => {
    const display = board.map((r) => [...r]);
    let ghostY = piece.y;
    while (!collides(board, { ...piece, y: ghostY + 1 })) ghostY++;
    if (ghostY !== piece.y) {
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++)
          if (piece.shape[r][c]) {
            const nr = ghostY + r, nc = piece.x + c;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !display[nr][nc])
              display[nr][nc] = -1;
          }
    }
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const nr = piece.y + r, nc = piece.x + c;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) display[nr][nc] = piece.color + 1;
        }
    return display;
  };

  const renderNext = () => {
    const s = nextPiece.shape;
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-display text-muted-foreground tracking-wider">NEXT</span>
        <div className="p-1">
          {s.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <div key={c} className={`w-4 h-4 rounded-sm ${cell ? COLORS[nextPiece.color] : "bg-transparent"}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <div className="flex gap-4 text-sm font-display text-muted-foreground">
        <span>Score: {score}</span>
        <span>Lines: {lines}</span>
      </div>

      <div className="flex items-center gap-2 text-xs font-display text-muted-foreground">
        <span>SPEED</span>
        <button onClick={() => changeSpeed(-1)} disabled={speedLevel === 0} className="p-1 rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-30">
          <ChevronDown className="w-3 h-3" />
        </button>
        <div className="flex gap-0.5">
          {SPEED_LEVELS.map((s, i) => (
            <div key={i} className={`w-2 h-3 rounded-sm ${i <= speedLevel ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <button onClick={() => changeSpeed(1)} disabled={speedLevel === SPEED_LEVELS.length - 1} className="p-1 rounded-lg border border-border hover:border-primary/50 transition-colors disabled:opacity-30">
          <ChevronUp className="w-3 h-3" />
        </button>
        <span className="text-primary">{currentSpeed.multiplier}x pts</span>
      </div>

      <div className="flex gap-3">
        <div className="border border-border/30 rounded-lg overflow-hidden">
          {renderBoard().map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className={`w-5 h-5 border border-border/10 ${
                    cell === -1 ? "bg-primary/10 border-primary/20"
                    : cell > 0 ? `${COLORS[cell - 1]} shadow-[0_0_6px_hsl(var(--primary)/0.3)]`
                    : "bg-background/30"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {renderNext()}
        </div>
      </div>

      {(!device || device === "laptop") && (
        <>
          <div className="flex gap-1">
            <button onClick={() => movePiece(-1, 0)} className="px-3 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-primary/50 transition-colors">←</button>
            <button onClick={() => movePiece(0, 0, true)} className="px-3 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-secondary/50 transition-colors">↻</button>
            <button onClick={() => movePiece(1, 0)} className="px-3 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-primary/50 transition-colors">→</button>
            <button onClick={() => movePiece(0, 1)} className="px-3 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-accent/50 transition-colors">↓</button>
            <button onClick={hardDrop} className="px-3 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-accent/50 transition-colors">DROP</button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Arrow keys + Space to drop · ↑↓ buttons to change speed</p>
        </>
      )}
      {gameOver && (
        <button onClick={reset} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-display text-sm">
          PLAY AGAIN
        </button>
      )}
    </div>
  );
};
