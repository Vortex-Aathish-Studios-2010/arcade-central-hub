import { useParams, useNavigate } from "react-router-dom";
import { entertainmentGames } from "@/lib/entertainmentData";
import { ChessGame } from "@/components/games/ChessGame";
import { ArcheryGame } from "@/components/games/ArcheryGame";
import { BasketballGame } from "@/components/games/BasketballGame";
import { BoxingGame } from "@/components/games/BoxingGame";
import { PenaltyKickGame } from "@/components/games/PenaltyKickGame";
import { RacingGame } from "@/components/games/RacingGame";
import { SimpleGame } from "@/components/games/SimpleGame";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const gameComponents: Record<string, React.ComponentType<{ onComplete?: (score: number) => void }>> = {
  chess: ChessGame,
  archery: ArcheryGame,
  basketball: BasketballGame,
  boxing: BoxingGame,
  penalty: PenaltyKickGame,
  racing: RacingGame,
};

const EntertainmentGamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = entertainmentGames.find((g) => g.id === id);
  const GameComponent = id ? gameComponents[id] : null;

  if (!game) {
    navigate("/entertainment");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="entertainment-theme fixed inset-0 flex flex-col"
      style={{ background: "hsl(var(--sport-bg))" }}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => navigate("/entertainment")}
          className="flex items-center gap-2 font-display text-xs tracking-wider"
          style={{ color: "hsl(var(--sport-muted))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        <span className="font-sport text-sm tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>
          {game.name.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {GameComponent ? (
          <GameComponent />
        ) : (
          <SimpleGame game={game} onBack={() => navigate("/entertainment")} />
        )}
      </div>
    </motion.div>
  );
};

export default EntertainmentGamePage;
