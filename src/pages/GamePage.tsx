import { useParams, useNavigate } from "react-router-dom";
import { games } from "@/lib/gameData";
import { MemoryGame } from "@/components/games/MemoryGame";
import { SlidingPuzzle } from "@/components/games/SlidingPuzzle";
import { BlockStack } from "@/components/games/BlockStack";
import { SudokuGame } from "@/components/games/SudokuGame";
import { KonoodleGame } from "@/components/games/KonoodleGame";
import { WordSearchGame } from "@/components/games/WordSearchGame";
import { SnakeGame } from "@/components/games/SnakeGame";
import { TicTacToeGame } from "@/components/games/TicTacToeGame";
import { OnScreenControls } from "@/components/OnScreenControls";
import { SimpleGame } from "@/components/games/SimpleGame";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { isTutorialShown, markTutorialShown, getGameLevel } from "@/lib/streaks";
import { GameTutorial } from "@/components/GameTutorial";

const HIDE_LEVEL_IDS = new Set(["tetris", "snake", "konoodle", "tictactoe"]);

const gameComponents: Record<string, React.ComponentType<{ level?: number; onComplete?: (score: number) => void }>> = {
  memory: MemoryGame,
  sliding: SlidingPuzzle,
  tetris: BlockStack,
  sudoku: SudokuGame,
  konoodle: KonoodleGame,
  wordsearch: WordSearchGame,
  snake: SnakeGame,
  tictactoe: TicTacToeGame,
};

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = games.find((g) => g.id === id);
  const [showTutorial, setShowTutorial] = useState(() => id ? !isTutorialShown(id) : false);
  const level = id ? getGameLevel(id) : 1;

  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false);
    if (id) markTutorialShown(id);
  }, [id]);

  if (!game) {
    navigate("/");
    return null;
  }

  const showLevel = id && !HIDE_LEVEL_IDS.has(id);
  const GameComponent = id ? gameComponents[id] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col bg-background"
    >
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => navigate("/?mode=brain")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-display text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        <div className="flex items-center gap-3">
          {showLevel && (
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-display text-xs">
              LVL {level}
            </span>
          )}
          <button onClick={() => setShowTutorial(true)} className="text-muted-foreground hover:text-foreground p-1.5">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 pb-2">
        {game.icon}
        <h1 className="font-display text-xl font-bold text-foreground">{game.name}</h1>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4">
        {GameComponent ? (
          <GameComponent level={level} onComplete={() => {}} />
        ) : (
          <SimpleGame game={game} onBack={() => navigate("/?mode=brain")} />
        )}
      </div>

      <OnScreenControls gameId={id} />

      {showTutorial && (
        <GameTutorial game={game} open={showTutorial} onClose={handleTutorialClose} />
      )}
    </motion.div>
  );
};

export default GamePage;
