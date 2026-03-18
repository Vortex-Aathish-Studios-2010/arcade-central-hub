import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { entertainmentGames } from "@/lib/entertainmentData";
import { EntertainmentCard } from "@/components/EntertainmentCard";
import { getEntertainmentPoints } from "@/lib/streaks";

const EntertainmentPage = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getEntertainmentPoints());
    const interval = setInterval(() => setPoints(getEntertainmentPoints()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="entertainment-theme min-h-screen p-6"
      style={{ background: "hsl(var(--sport-bg))" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="font-display text-sm tracking-wider" style={{ color: "hsl(var(--sport-muted))" }}>
            ← BACK
          </button>
          <div className="font-display text-sm" style={{ color: "hsl(var(--sport-accent))" }}>⭐ {points} pts</div>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏟️</div>
          <h2 className="font-sport text-4xl tracking-wider" style={{ color: "hsl(var(--sport-text))" }}>GAME ON!</h2>
          <p className="font-sport-body text-sm mt-1" style={{ color: "hsl(var(--sport-muted))" }}>Sports & action games</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {entertainmentGames.map((game, i) => (
            <EntertainmentCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EntertainmentPage;
