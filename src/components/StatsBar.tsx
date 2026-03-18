import { Star } from "lucide-react";
import { getPoints } from "@/lib/streaks";
import { useEffect, useState } from "react";

export const StatsBar = () => {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getPoints());
    const interval = setInterval(() => setPoints(getPoints()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-sm font-display">
      <Star className="w-4 h-4 text-accent" />
      <span className="text-muted-foreground">Points</span>
      <span className="text-accent font-bold">{points}</span>
    </div>
  );
};
