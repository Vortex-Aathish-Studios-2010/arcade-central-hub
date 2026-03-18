import React from "react";

export interface EntertainmentGameInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  color: "sport-primary" | "sport-secondary" | "sport-accent";
  available: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  tutorial: string[];
}

export const entertainmentGames: EntertainmentGameInfo[] = [
  {
    id: "chess", name: "Chess", description: "The classic strategy board game",
    icon: <span className="text-6xl">♟️</span>, emoji: "♟️", color: "sport-primary", available: true, difficulty: "Hard",
    tutorial: ["Choose to play against a bot or a friend locally.", "Click a piece to select it, then click a highlighted square to move.", "Put the opponent's king in checkmate to win!"],
  },
  {
    id: "archery", name: "Archery", description: "Aim for the bullseye",
    icon: <span className="text-6xl">🏹</span>, emoji: "🏹", color: "sport-accent", available: true, difficulty: "Medium",
    tutorial: ["A moving crosshair bounces across the target.", "Tap SHOOT when the crosshair is closest to the bullseye.", "You get 5 arrows per round!"],
  },
  {
    id: "penalty", name: "Penalty Kick", description: "Score past the goalkeeper",
    icon: <span className="text-6xl">⚽</span>, emoji: "⚽", color: "sport-accent", available: true, difficulty: "Easy",
    tutorial: ["Click a zone on the goal to aim your kick.", "The goalkeeper will dive to try to save it.", "Score as many goals as you can in 5 attempts!"],
  },
  {
    id: "basketball", name: "Basketball", description: "Shoot hoops and score points",
    icon: <span className="text-6xl">🏀</span>, emoji: "🏀", color: "sport-primary", available: true, difficulty: "Medium",
    tutorial: ["Drag to set the angle and power of your shot.", "Release to throw the ball towards the hoop.", "Score as many baskets as you can in 30 seconds!"],
  },
  {
    id: "boxing", name: "Boxing", description: "Punch and dodge to victory",
    icon: <span className="text-6xl">🥊</span>, emoji: "🥊", color: "sport-secondary", available: true, difficulty: "Medium",
    tutorial: ["Tap the punch buttons to attack.", "Watch for incoming punches and tap DODGE.", "Reduce the opponent's HP to zero to win."],
  },
  {
    id: "racing", name: "Racing", description: "Dodge obstacles and race to the finish",
    icon: <span className="text-6xl">🏎️</span>, emoji: "🏎️", color: "sport-primary", available: true, difficulty: "Easy",
    tutorial: ["Use left/right controls to steer.", "Dodge obstacles and collect coins.", "Survive as long as possible!"],
  },
  {
    id: "tennis", name: "Tennis", description: "Rally and smash to win",
    icon: <span className="text-6xl">🎾</span>, emoji: "🎾", color: "sport-primary", available: true, difficulty: "Medium",
    tutorial: ["Coming soon!"],
  },
  {
    id: "cricket", name: "Cricket", description: "Hit sixes and take wickets",
    icon: <span className="text-6xl">🏏</span>, emoji: "🏏", color: "sport-secondary", available: true, difficulty: "Hard",
    tutorial: ["Coming soon!"],
  },
  {
    id: "obstacle", name: "Obstacle Race", description: "Jump, duck and dash to the finish",
    icon: <span className="text-6xl">🏃</span>, emoji: "🏃", color: "sport-primary", available: true, difficulty: "Medium",
    tutorial: ["Coming soon!"],
  },
  {
    id: "hideseek", name: "Hide & Seek", description: "Find or hide before time runs out",
    icon: <span className="text-6xl">👀</span>, emoji: "👀", color: "sport-secondary", available: true, difficulty: "Easy",
    tutorial: ["Coming soon!"],
  },
];
