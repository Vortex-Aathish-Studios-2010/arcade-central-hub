import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simplified chess types
type PieceColor = "white" | "black";
type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
interface Piece { type: PieceType; color: PieceColor; }
type Board = (Piece | null)[][];
type Position = [number, number];

const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: "black" };
    board[1][c] = { type: "pawn", color: "black" };
    board[6][c] = { type: "pawn", color: "white" };
    board[7][c] = { type: backRow[c], color: "white" };
  }
  return board;
};

type Mode = "select" | "color-select" | "playing";

export const ChessGame = () => {
  const [mode, setMode] = useState<Mode>("select");
  const [playerColor, setPlayerColor] = useState<PieceColor>("white");
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [selected, setSelected] = useState<Position | null>(null);
  const [turn, setTurn] = useState<PieceColor>("white");

  const resetGame = (color: PieceColor) => {
    setPlayerColor(color);
    setBoard(createInitialBoard());
    setSelected(null);
    setTurn("white");
    setMode("playing");
  };

  const handleSquareClick = (r: number, c: number) => {
    const piece = board[r][c];
    if (selected) {
      // Move piece
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = newBoard[selected[0]][selected[1]];
      newBoard[selected[0]][selected[1]] = null;
      setBoard(newBoard);
      setSelected(null);
      setTurn(turn === "white" ? "black" : "white");
      return;
    }
    if (piece && piece.color === turn) {
      setSelected([r, c]);
    }
  };

  if (mode === "select") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6">
        <motion.div className="text-7xl" animate={{ rotateY: [0, 360] }} transition={{ duration: 3, repeat: Infinity }}>
          ♚
        </motion.div>
        <h2 className="font-sport text-3xl tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>CHESS</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMode("color-select")}
            className="px-8 py-4 rounded-xl font-sport-body font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}
          >
            🤖 vs Bot
          </button>
          <button
            onClick={() => setMode("color-select")}
            className="px-8 py-4 rounded-xl font-sport-body font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            style={{ background: "hsl(var(--sport-secondary))", color: "hsl(var(--sport-bg))" }}
          >
            👥 vs Friend
          </button>
        </div>
      </div>
    );
  }

  // COLOR SELECTION SCREEN - NEW FEATURE
  if (mode === "color-select") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6">
        <h2 className="font-sport text-3xl tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>
          CHOOSE YOUR SIDE
        </h2>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => resetGame("white")}
            className="aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-4 transition-all"
            style={{
              background: "#F0D9B5",
              borderColor: "hsl(var(--sport-primary))",
              boxShadow: "0 0 30px hsl(var(--sport-primary) / 0.3)",
            }}
          >
            <span className="text-7xl">♔</span>
            <span className="font-sport text-2xl tracking-wider text-gray-900">WHITE</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => resetGame("black")}
            className="aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-4 transition-all"
            style={{
              background: "#4A3728",
              borderColor: "hsl(var(--sport-secondary))",
              boxShadow: "0 0 30px hsl(var(--sport-secondary) / 0.3)",
            }}
          >
            <span className="text-7xl">♚</span>
            <span className="font-sport text-2xl tracking-wider text-gray-100">BLACK</span>
          </motion.button>
        </div>
        <button
          onClick={() => setMode("select")}
          className="font-display text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to mode selection
        </button>
      </div>
    );
  }

  const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="font-sport text-lg tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>
        {turn === "white" ? "White" : "Black"}'s turn
        {playerColor !== turn && " (opponent)"}
      </div>

      {/* Chess Board */}
      <div className="relative w-full max-w-[min(90vw,400px)] aspect-square">
        <div className="grid grid-cols-8 w-full h-full rounded-lg overflow-hidden border-2" style={{ borderColor: "hsl(var(--sport-border))" }}>
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isLight = (r + c) % 2 === 0;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  className="relative flex items-center justify-center cursor-pointer select-none aspect-square"
                  style={{
                    background: isSelected
                      ? isLight ? "#F7EC7D" : "#DAC34B"
                      : isLight ? "#F0D9B5" : "#B58863",
                  }}
                >
                  {piece && (
                    <span className={`text-2xl sm:text-3xl ${piece.color === "white" ? "drop-shadow-md" : ""}`}
                      style={{ color: piece.color === "white" ? "#fff" : "#000", textShadow: piece.color === "white" ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(255,255,255,0.3)" }}
                    >
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setBoard(createInitialBoard()); setSelected(null); setTurn("white"); }}
          className="px-4 py-2 rounded-lg font-sport-body font-bold text-sm"
          style={{ background: "hsl(var(--sport-card))", border: "1px solid hsl(var(--sport-border))", color: "hsl(var(--sport-text))" }}
        >
          🔄 New Game
        </button>
        <button
          onClick={() => setMode("select")}
          className="px-4 py-2 rounded-lg font-sport-body font-bold text-sm"
          style={{ background: "hsl(var(--sport-card))", border: "1px solid hsl(var(--sport-border))", color: "hsl(var(--sport-text))" }}
        >
          🔙 Change Mode
        </button>
      </div>
    </div>
  );
};
