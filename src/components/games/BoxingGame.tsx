import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { addEntertainmentPoints } from "@/lib/streaks";
import { sfx } from "@/lib/sounds";

type Action = "jab" | "hook" | "dodge";

export const BoxingGame = ({ onComplete }: { onComplete?: (score: number) => void }) => {
  const [playerHp, setPlayerHp] = useState(100);
  const [botHp, setBotHp] = useState(100);
  const [playerAction, setPlayerAction] = useState<Action | null>(null);
  const [botAction, setBotAction] = useState<Action | null>(null);
  const [message, setMessage] = useState("Ready to fight!");
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const cooldown = useRef(false);

  const attack = useCallback((action: Action) => {
    if (cooldown.current || gameOver) return;
    cooldown.current = true;
    sfx.click();
    setPlayerAction(action);

    const botActs: Action[] = ["jab", "hook", "dodge"];
    const bot = botActs[Math.floor(Math.random() * botActs.length)];
    setBotAction(bot);

    let playerDmg = 0;
    let botDmg = 0;
    let msg = "";

    if (action === "dodge") {
      if (bot === "dodge") { msg = "Both dodged! No action."; setCombo(0); }
      else { msg = `You dodged the ${bot}! Counter opportunity!`; setCombo(prev => prev + 1); }
    } else {
      const baseDmg = action === "jab" ? 8 : 15;
      const comboBonus = Math.min(combo * 3, 15);
      if (bot === "dodge") { msg = `Bot dodged your ${action}!`; setCombo(0); }
      else { playerDmg = baseDmg + comboBonus; setCombo(prev => prev + 1); msg = `Your ${action} hit for ${playerDmg} damage!`; }
      if (bot !== "dodge") {
        botDmg = bot === "jab" ? 5 + Math.floor(Math.random() * 5) : 10 + Math.floor(Math.random() * 8);
        msg += ` Bot ${bot} hits for ${botDmg}!`;
      }
    }

    setMessage(msg);

    if (playerDmg > 0) {
      setBotHp(prev => {
        const next = Math.max(0, prev - playerDmg);
        if (next <= 0) { setGameOver(true); setMessage("🏆 KNOCKOUT! You win!"); addEntertainmentPoints(100 - (100 - playerHp)); sfx.levelComplete(); onComplete?.(100); }
        return next;
      });
    }

    if (botDmg > 0) {
      setPlayerHp(prev => {
        const next = Math.max(0, prev - botDmg);
        if (next <= 0) { setGameOver(true); setMessage("💀 You got knocked out!"); sfx.error(); onComplete?.(0); }
        return next;
      });
    }

    setTimeout(() => { setPlayerAction(null); setBotAction(null); cooldown.current = false; }, 500);
  }, [gameOver, combo, playerHp, onComplete]);

  const restart = () => { setPlayerHp(100); setBotHp(100); setGameOver(false); setMessage("Ready to fight!"); setCombo(0); };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* HP Bars */}
      <div className="w-full max-w-sm flex gap-4">
        <div className="flex-1">
          <div className="text-xs font-sport mb-1" style={{ color: "hsl(var(--sport-text))" }}>YOU</div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: playerHp > 30 ? "hsl(var(--sport-primary))" : "#ef4444" }} animate={{ width: `${playerHp}%` }} transition={{ type: "spring", stiffness: 200 }} />
          </div>
          <div className="text-xs font-sport mt-0.5" style={{ color: "hsl(var(--sport-muted))" }}>{playerHp}</div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs font-sport mb-1" style={{ color: "hsl(var(--sport-text))" }}>BOT</div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-destructive" animate={{ width: `${botHp}%` }} transition={{ type: "spring", stiffness: 200 }} />
          </div>
          <div className="text-xs font-sport mt-0.5" style={{ color: "hsl(var(--sport-muted))" }}>{botHp}</div>
        </div>
      </div>

      {/* Ring */}
      <div className="relative w-64 h-48 rounded-xl" style={{ background: "hsl(var(--sport-card))", border: "2px solid hsl(var(--sport-border))" }}>
        <div className="absolute top-2 left-2 right-2 h-1 rounded" style={{ background: "hsl(var(--sport-primary))" }} />
        <div className="absolute bottom-2 left-2 right-2 h-1 rounded" style={{ background: "hsl(var(--sport-primary))" }} />
        <div className="absolute inset-0 flex items-center justify-around px-8">
          <motion.div animate={playerAction === "jab" ? { x: 20 } : playerAction === "hook" ? { x: 30, rotate: -15 } : playerAction === "dodge" ? { y: 20 } : {}} className="text-center">
            <div className="text-4xl">🥊</div>
            <div className="text-[10px] font-sport" style={{ color: "hsl(var(--sport-text))" }}>YOU</div>
          </motion.div>
          <motion.div animate={botAction === "jab" ? { x: -20 } : botAction === "hook" ? { x: -30, rotate: 15 } : botAction === "dodge" ? { y: 20 } : {}} className="text-center">
            <div className="text-4xl">🥊</div>
            <div className="text-[10px] font-sport" style={{ color: "hsl(var(--sport-text))" }}>BOT</div>
          </motion.div>
        </div>
        {combo > 1 && (
          <div className="absolute top-3 right-3 text-xs font-sport font-bold" style={{ color: "hsl(var(--sport-accent))" }}>{combo}x COMBO!</div>
        )}
      </div>

      <p className="text-sm font-sport text-center" style={{ color: "hsl(var(--sport-text))" }}>{message}</p>

      {!gameOver && (
        <div className="flex gap-2">
          <button onClick={() => attack("jab")} className="px-5 py-3 rounded-xl font-sport tracking-wider text-sm transition-all" style={{ background: "hsl(var(--sport-primary) / 0.2)", border: "1px solid hsl(var(--sport-primary) / 0.5)", color: "hsl(var(--sport-primary))" }}>👊 JAB</button>
          <button onClick={() => attack("hook")} className="px-5 py-3 rounded-xl font-sport tracking-wider text-sm transition-all" style={{ background: "hsl(var(--sport-accent) / 0.2)", border: "1px solid hsl(var(--sport-accent) / 0.5)", color: "hsl(var(--sport-accent))" }}>💥 HOOK</button>
          <button onClick={() => attack("dodge")} className="px-5 py-3 rounded-xl font-sport tracking-wider text-sm transition-all" style={{ background: "hsl(var(--sport-secondary) / 0.2)", border: "1px solid hsl(var(--sport-secondary) / 0.5)", color: "hsl(var(--sport-secondary))" }}>🛡️ DODGE</button>
        </div>
      )}

      {gameOver && (
        <button onClick={restart} className="px-6 py-2 rounded-xl font-sport text-sm" style={{ background: "hsl(var(--sport-primary))", color: "hsl(var(--sport-bg))" }}>FIGHT AGAIN</button>
      )}
    </div>
  );
};
