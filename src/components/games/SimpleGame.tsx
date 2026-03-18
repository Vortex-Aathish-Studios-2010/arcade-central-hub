// Simple placeholder game component for games that haven't been fully ported yet
import { motion } from "framer-motion";

interface SimpleGameProps {
  game: { name: string; emoji: string; description: string; icon: React.ReactNode };
  onBack: () => void;
}

export const SimpleGame = ({ game, onBack }: SimpleGameProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-6">
      <motion.div
        className="text-8xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {game.emoji}
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-foreground">{game.name}</h2>
      <p className="text-muted-foreground">{game.description}</p>
      <p className="text-muted-foreground text-sm">Game is loading... Connect to your original project for full gameplay.</p>
      <button
        onClick={onBack}
        className="px-6 py-3 rounded-lg bg-primary/20 border border-primary/50 text-primary font-display text-sm hover:bg-primary/30 transition-all"
      >
        GO BACK
      </button>
    </div>
  );
};
