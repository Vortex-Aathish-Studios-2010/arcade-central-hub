import React from "react";

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  color: "primary" | "secondary" | "accent";
  available: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  tutorial: string[];
}

export const games: GameInfo[] = [
  {
    id: "memory", name: "Memory Match", description: "Flip cards and find matching pairs",
    icon: <span className="text-6xl">🧠</span>, emoji: "🧠", color: "primary", available: true, difficulty: "Easy",
    tutorial: ["Tap a card to flip it over and reveal the emoji underneath.", "Tap a second card to try to find a matching pair.", "If both cards match, they stay face up. If not, they flip back.", "Try to match all pairs in as few moves as possible!", "Fewer moves = more points earned."],
  },
  {
    id: "sliding", name: "Sliding Puzzle", description: "Arrange numbered tiles in order",
    icon: <span className="text-6xl">🧩</span>, emoji: "🧩", color: "accent", available: true, difficulty: "Hard",
    tutorial: ["Click or drag a tile adjacent to the empty space to slide it.", "Arrange all numbers from 1-15 in order.", "The empty space should end up in the bottom-right corner.", "Fewer moves = more points!"],
  },
  {
    id: "tetris", name: "Block Stack", description: "Stack falling blocks to clear lines",
    icon: <span className="text-6xl">🟦</span>, emoji: "🟦", color: "primary", available: true, difficulty: "Medium",
    tutorial: ["Blocks fall from the top of the board.", "Use ← → arrow keys to move blocks.", "Press ↑ to rotate a block.", "Complete a full horizontal line to clear it!"],
  },
  {
    id: "sudoku", name: "Sudoku", description: "Fill the grid with numbers 1-9",
    icon: <span className="text-6xl">🔢</span>, emoji: "🔢", color: "secondary", available: true, difficulty: "Hard",
    tutorial: ["Fill every empty cell with a number from 1 to 9.", "Each row must contain all numbers 1-9 without repeats.", "Each column and 3×3 box too.", "Complete the puzzle to win!"],
  },
  {
    id: "konoodle", name: "Konoodle", description: "Fit puzzle pieces into the board",
    icon: <span className="text-6xl">🔲</span>, emoji: "🔲", color: "accent", available: true, difficulty: "Hard",
    tutorial: ["Place pieces on the board to fill all spaces.", "Use ROTATE to change orientation.", "Stuck? Hit SHOW SOLUTION!"],
  },
  {
    id: "wordsearch", name: "Word Search", description: "Find hidden words in the grid",
    icon: <span className="text-6xl">🔤</span>, emoji: "🔤", color: "primary", available: true, difficulty: "Easy",
    tutorial: ["Words are hidden in the letter grid.", "Click and drag across letters to highlight a word.", "Find all words to complete the puzzle!"],
  },
  {
    id: "snake", name: "Snake", description: "Grow the snake by eating food",
    icon: <span className="text-6xl">🐍</span>, emoji: "🐍", color: "secondary", available: true, difficulty: "Medium",
    tutorial: ["Use arrow keys to control the snake.", "Eat food to grow longer and score points.", "Don't crash into the walls or your own tail!"],
  },
  {
    id: "tictactoe", name: "Tic Tac Toe", description: "Get three in a row to win",
    icon: <span className="text-6xl">❌</span>, emoji: "❌", color: "secondary", available: true, difficulty: "Easy",
    tutorial: ["Take turns placing your mark on the 3×3 grid.", "Get three in a row to win!", "If all squares are filled with no winner, it's a draw."],
  },
];
