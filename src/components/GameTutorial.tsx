import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GameInfo } from "@/lib/gameData";

interface GameTutorialProps {
  game: GameInfo;
  open: boolean;
  onClose: () => void;
}

export const GameTutorial = ({ game, open, onClose }: GameTutorialProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-xl">
            {game.icon} How to Play {game.name}
          </DialogTitle>
          <DialogDescription>{game.description}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3 mt-4">
          {game.tutorial.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className="font-display text-primary font-bold">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold tracking-wider hover:opacity-90 transition-opacity"
        >
          GOT IT!
        </button>
      </DialogContent>
    </Dialog>
  );
};
