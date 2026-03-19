import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPoints, updateStreak, addWin } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";
import { toast } from "sonner";
import { Shuffle, Eye, RotateCw } from "lucide-react";
import { PIECES, BOARD_ROWS, BOARD_COLS, createEmptyBoard, solvePuzzle, type PieceDef, type BoardState, type Placement } from "@/lib/konoodleSolver";

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const PiecePreview = ({
  piece, selected, onClick, onDragStart,
}: {
  piece: PieceDef; selected: boolean; onClick: () => void; onDragStart?: (e: React.DragEvent) => void;
}) => {
  const cells = piece.orientations[0];
  const maxR = Math.max(...cells.map(([r]) => r));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));
  const touch = isTouchDevice();

  return (
    <div
      className={`p-1 rounded-lg cursor-pointer transition-all border-2 ${selected ? "border-primary bg-primary/10" : "border-transparent hover:border-border"}`}
      onClick={onClick}
      draggable={!touch}
      onDragStart={onDragStart}
    >
      {Array.from({ length: maxR + 1 }, (_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: maxC + 1 }, (_, c) => (
            <div key={c} className={`w-5 h-5 rounded-sm ${cellSet.has(`${r},${c}`) ? piece.color : "bg-transparent"}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

interface Props {
  level?: number;
  onComplete?: (score: number) => void;
}

export const KonoodleGame = ({ onComplete }: Props) => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard);
  const [placed, setPlaced] = useState<Map<string, [number, number][]>>(new Map());
  const [selectedPiece, setSelectedPiece] = useState<PieceDef | null>(null);
  const [rotation, setRotation] = useState(0);
  const [lastPlacedId, setLastPlacedId] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [showingSolution, setShowingSolution] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [removingPieces, setRemovingPieces] = useState<Set<string>>(new Set());
  const shuffledPieceIdRef = useRef<string | null>(null);
  const cachedSolutionRef = useRef<Placement[] | null>(null);
  const [dragOverCell, setDragOverCell] = useState<[number, number] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const placedIds = new Set(placed.keys());

  const getRotatedCells = (piece: PieceDef, rot: number) => {
    return piece.orientations[rot % piece.orientations.length];
  };

  const canPlace = (cells: number[][], r: number, c: number, boardState: BoardState = board) =>
    cells.every(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      return nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS && !boardState[nr][nc];
    });

  const doPlace = (piece: PieceDef, cells: number[][], r: number, c: number, currentBoard: BoardState, currentPlaced: Map<string, [number, number][]>) => {
    const newBoard = currentBoard.map((row) => [...row]);
    const placedCells: [number, number][] = [];
    cells.forEach(([dr, dc]) => {
      newBoard[r + dr][c + dc] = piece.id;
      placedCells.push([r + dr, c + dc]);
    });
    const newPlaced = new Map(currentPlaced);
    newPlaced.set(piece.id, placedCells);
    return { newBoard, newPlaced, placedCells };
  };

  const placePiece = (r: number, c: number) => {
    if (!selectedPiece || placedIds.has(selectedPiece.id)) return;
    const cells = getRotatedCells(selectedPiece, rotation);
    if (!canPlace(cells, r, c)) { sfx.error(); return; }
    sfx.place();
    const { newBoard, newPlaced } = doPlace(selectedPiece, cells, r, c, board, placed);
    setBoard(newBoard);
    setPlaced(newPlaced);
    setLastPlacedId(selectedPiece.id);
    setSelectedPiece(null);
    setRotation(0);
    setShowingSolution(false);
    setDragOverCell(null);
    checkWin(newBoard);
  };

  const checkWin = (b: BoardState) => {
    if (b.every((row) => row.every((cell) => cell !== null))) {
      sfx.levelComplete();
      addPoints(200);
      updateStreak("konoodle");
      addWin("konoodle");
      onComplete?.(200);
    }
  };

  const removePiece = (id: string) => {
    if (showingSolution) return;
    sfx.click();
    setBoard(board.map((row) => row.map((cell) => (cell === id ? null : cell))));
    const newPlaced = new Map(placed);
    newPlaced.delete(id);
    setPlaced(newPlaced);
    if (lastPlacedId === id) setLastPlacedId(null);
  };

  const reset = () => {
    sfx.click();
    setBoard(createEmptyBoard());
    setPlaced(new Map());
    setSelectedPiece(null);
    setRotation(0);
    setLastPlacedId(null);
    setShowingSolution(false);
    setShuffling(false);
    setHasShuffled(false);
    setRemovingPieces(new Set());
    shuffledPieceIdRef.current = null;
  };

  const handleDragStart = (e: React.DragEvent, piece: PieceDef) => {
    const isNewPiece = selectedPiece?.id !== piece.id;
    if (isNewPiece) { setSelectedPiece(piece); setRotation(0); }
    e.dataTransfer.setData("text/plain", piece.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBoardDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell([r, c]);
  };

  const handleBoardDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    if (selectedPiece) {
      if (placed.has(selectedPiece.id)) {
        const newPlaced = new Map(placed);
        newPlaced.delete(selectedPiece.id);
        setPlaced(newPlaced);
      }
      placePiece(r, c);
    }
    setDragOverCell(null);
  };

  const handleBoardDragLeave = () => { setDragOverCell(null); };

  const dragPreviewCells = dragOverCell && selectedPiece ? (() => {
    const cells = getRotatedCells(selectedPiece, rotation);
    const [r, c] = dragOverCell;
    const valid = canPlace(cells, r, c);
    return { cells: cells.map(([dr, dc]) => [r + dr, c + dc] as [number, number]), valid };
  })() : null;
  const dragPreviewSet = new Set(dragPreviewCells?.cells.map(([r, c]) => `${r},${c}`) || []);

  const shakeLastPiece = useCallback(() => {
    if (!lastPlacedId) return;
    const piece = PIECES.find(p => p.id === lastPlacedId);
    if (!piece) return;

    setShuffling(true);
    sfx.shake();

    setTimeout(() => {
      const boardWithout = board.map(row => row.map(cell => cell === lastPlacedId ? null : cell));
      type Candidate = { cells: number[][]; r: number; c: number };
      const candidates: Candidate[] = [];
      for (const orientation of piece.orientations) {
        for (let r = 0; r < BOARD_ROWS; r++)
          for (let c = 0; c < BOARD_COLS; c++)
            if (canPlace(orientation, r, c, boardWithout))
              candidates.push({ cells: orientation, r, c });
      }

      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      let foundBoard: BoardState | null = null;
      let foundCells: [number, number][] = [];

      if (candidates.length > 0) {
        for (const cand of candidates) {
          const testBoard = boardWithout.map(row => [...row]);
          const pc: [number, number][] = [];
          cand.cells.forEach(([dr, dc]) => {
            testBoard[cand.r + dr][cand.c + dc] = lastPlacedId;
            pc.push([cand.r + dr, cand.c + dc]);
          });
          const currentPlacedIds = new Set(placed.keys());
          const sol = solvePuzzle(testBoard, currentPlacedIds, 500000);
          if (sol !== null) {
            foundBoard = testBoard;
            foundCells = pc;
            cachedSolutionRef.current = sol;
            break;
          }
        }
      }

      if (foundBoard) {
        setBoard(foundBoard);
        const newPlaced = new Map(placed);
        newPlaced.set(lastPlacedId, foundCells);
        setPlaced(newPlaced);
      }

      setTimeout(() => {
        setShuffling(false);
        setHasShuffled(true);
        shuffledPieceIdRef.current = lastPlacedId;
        sfx.place();
      }, 400);
    }, 400);
  }, [board, placed, lastPlacedId]);

  const handleSolve = useCallback(() => {
    setSolving(true);
    const shuffledId = shuffledPieceIdRef.current;
    const playerPieceIds = Array.from(placed.keys()).filter(id => id !== shuffledId);

    if (playerPieceIds.length > 0) {
      setRemovingPieces(new Set(playerPieceIds));
      setTimeout(() => {
        setBoard(prev => {
          const b = prev.map(r => [...r]);
          for (let r = 0; r < BOARD_ROWS; r++)
            for (let c = 0; c < BOARD_COLS; c++)
              if (b[r][c] && playerPieceIds.includes(b[r][c]!)) b[r][c] = null;
          return b;
        });
        setPlaced(prev => {
          const p = new Map(prev);
          playerPieceIds.forEach(id => p.delete(id));
          return p;
        });
        setRemovingPieces(new Set());
        setTimeout(() => startSolving(), 200);
      }, 600);
    } else {
      startSolving();
    }
  }, [placed]);

  const startSolving = useCallback(() => {
    let solution = cachedSolutionRef.current;
    if (!solution || solution.length === 0) {
      setBoard(currentBoard => {
        const currentPlacedIds = new Set<string>();
        for (let r = 0; r < BOARD_ROWS; r++)
          for (let c = 0; c < BOARD_COLS; c++)
            if (currentBoard[r][c]) currentPlacedIds.add(currentBoard[r][c]!);
        solution = solvePuzzle(currentBoard, currentPlacedIds, 20000000);

        if (solution && solution.length > 0) {
          setSolving(false);
          cachedSolutionRef.current = null;
          setShowingSolution(true);
          solution.forEach((step, i) => {
            setTimeout(() => {
              setBoard(prev => {
                const b = prev.map(r => [...r]);
                step.cells.forEach(([r, c]) => { b[r][c] = step.pieceId; });
                return b;
              });
              setPlaced(prev => {
                const p = new Map(prev);
                p.set(step.pieceId, step.cells);
                return p;
              });
              sfx.place();
              if (i === solution!.length - 1) setTimeout(() => sfx.levelComplete(), 200);
            }, (i + 1) * 350);
          });
        } else {
          setSolving(false);
          cachedSolutionRef.current = null;
        }
        return currentBoard;
      });
    } else {
      setSolving(false);
      cachedSolutionRef.current = null;
      setShowingSolution(true);
      solution.forEach((step, i) => {
        setTimeout(() => {
          setBoard(prev => {
            const b = prev.map(r => [...r]);
            step.cells.forEach(([r, c]) => { b[r][c] = step.pieceId; });
            return b;
          });
          setPlaced(prev => {
            const p = new Map(prev);
            p.set(step.pieceId, step.cells);
            return p;
          });
          sfx.place();
          if (i === solution!.length - 1) setTimeout(() => sfx.levelComplete(), 200);
        }, (i + 1) * 350);
      });
    }
  }, []);

  const pieceColor = (id: string) => PIECES.find((p) => p.id === id)?.color || "bg-muted";

  const rotatedPreview = selectedPiece ? (() => {
    const cells = getRotatedCells(selectedPiece, rotation);
    const maxR = Math.max(...cells.map(([r]) => r));
    const maxC = Math.max(...cells.map(([, c]) => c));
    const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-display text-muted-foreground">PLACING</span>
        <div>
          {Array.from({ length: maxR + 1 }, (_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: maxC + 1 }, (_, c) => (
                <div key={c} className={`w-5 h-5 rounded-sm ${cellSet.has(`${r},${c}`) ? selectedPiece.color : "bg-transparent"}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  })() : null;

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <p className="text-xs text-muted-foreground font-display">
        {PIECES.length} pieces · {BOARD_ROWS * BOARD_COLS} cells · Fill the entire board!
      </p>

      <div className="relative" ref={boardRef}>
        <div className={`${shuffling ? "blur-sm scale-95" : ""} transition-all duration-300`}>
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const isRemoving = cell ? removingPieces.has(cell) : false;
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    animate={isRemoving ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => cell && !isRemoving ? removePiece(cell) : placePiece(r, c)}
                    onDragOver={(e) => !isTouchDevice() ? handleBoardDragOver(e as any, r, c) : undefined}
                    onDrop={(e) => !isTouchDevice() ? handleBoardDrop(e as any, r, c) : undefined}
                    onDragLeave={!isTouchDevice() ? handleBoardDragLeave : undefined}
                    className={`w-7 h-7 border border-border/20 rounded-sm transition-colors ${
                      cell ? `${isTouchDevice() ? 'cursor-pointer' : 'cursor-grab'} ${pieceColor(cell)} shadow-[0_0_6px_rgba(0,0,0,0.15)]`
                      : dragPreviewSet.has(`${r},${c}`)
                      ? (dragPreviewCells?.valid ? "bg-primary/20 border-primary/40 cursor-pointer" : "bg-destructive/20 border-destructive/40")
                      : "bg-background/30 hover:bg-muted/50 cursor-pointer"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <AnimatePresence>
          {shuffling && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
              <Shuffle className="w-8 h-8 text-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(hasShuffled || placed.size === 0) && (
        <div className="flex flex-wrap gap-1 justify-center max-w-sm">
          {PIECES.filter((p) => !placedIds.has(p.id)).map((piece) => (
            <PiecePreview key={piece.id} piece={piece} selected={selectedPiece?.id === piece.id}
              onClick={() => { setSelectedPiece(piece); setRotation(0); sfx.click(); }}
              onDragStart={(e) => handleDragStart(e, piece)}
            />
          ))}
        </div>
      )}

      {selectedPiece && (
        <div className="flex items-center gap-3">
          {rotatedPreview}
          <button onClick={() => { setRotation((r) => r + 1); sfx.rotate(); }} className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-secondary/50 transition-all flex items-center gap-1.5">
            <RotateCw className="w-3 h-3" />
            ROTATE
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {lastPlacedId && !showingSolution && (
          <button onClick={shakeLastPiece} disabled={shuffling} className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg font-display text-xs hover:bg-accent/20 transition-all flex items-center gap-1.5">
            <Shuffle className="w-3 h-3" />
            SHUFFLE "{lastPlacedId}"
          </button>
        )}
        {hasShuffled && (
          <button onClick={handleSolve} disabled={solving || showingSolution} className="px-4 py-2 bg-secondary/10 border border-secondary/30 text-secondary rounded-lg font-display text-xs hover:bg-secondary/20 transition-all flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            {solving ? "SOLVING..." : "SHOW SOLUTION"}
          </button>
        )}
        <button onClick={reset} className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-display text-xs hover:border-primary/50 transition-all">
          RESET
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Drag pieces onto the board or click to place · Tap placed pieces to remove
      </p>
    </div>
  );
};
