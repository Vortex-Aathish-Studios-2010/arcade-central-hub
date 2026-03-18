import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

type SplashPhase = "title" | "founder" | "cofounder" | "aka" | "done";

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<SplashPhase>("title");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Title for 3s
    timers.push(setTimeout(() => setPhase("founder"), 3000));
    // Founder for 3.5s
    timers.push(setTimeout(() => setPhase("cofounder"), 6500));
    // Co-founder for 3.5s
    timers.push(setTimeout(() => setPhase("aka"), 10000));
    // AKA for 4s (they need time to read it)
    timers.push(setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800);
    }, 14000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const cinematic = {
    initial: { opacity: 0, scale: 0.8, filter: "blur(20px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.1, filter: "blur(30px)" },
  };

  const slowTransition = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, hsl(230 25% 12%), hsl(230 25% 4%))" }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(185 100% 50% / ${Math.random() * 0.3})`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Phase 1: ARCADE.IO Title */}
            {phase === "title" && (
              <motion.div
                key="title"
                {...cinematic}
                transition={slowTransition}
                className="text-center relative"
              >
                <motion.h1
                  className="font-display text-7xl sm:text-9xl font-black tracking-widest text-glow-primary"
                  style={{ color: "hsl(185 100% 50%)" }}
                  animate={{ 
                    textShadow: [
                      "0 0 20px hsl(185 100% 50% / 0.6)",
                      "0 0 60px hsl(185 100% 50% / 0.8)",
                      "0 0 20px hsl(185 100% 50% / 0.6)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ARCADE
                </motion.h1>
                <motion.span
                  className="font-display text-5xl sm:text-7xl font-black tracking-widest"
                  style={{ color: "hsl(300 80% 60%)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  .IO
                </motion.span>
                <motion.div
                  className="mt-6 h-1 mx-auto rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(185 100% 50%), hsl(300 80% 60%), transparent)" }}
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                />
              </motion.div>
            )}

            {/* Phase 2: Founder */}
            {phase === "founder" && (
              <motion.div
                key="founder"
                {...cinematic}
                transition={slowTransition}
                className="text-center flex flex-col items-center gap-8"
              >
                <motion.div
                  className="text-sm font-display tracking-[0.3em] uppercase"
                  style={{ color: "hsl(185 100% 50% / 0.6)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Founded by
                </motion.div>
                {/* Photo placeholder - user will provide */}
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: "hsl(185 100% 50% / 0.5)", background: "hsl(230 20% 15%)" }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <span className="text-5xl">👤</span>
                </motion.div>
                <motion.h2
                  className="font-display text-3xl sm:text-5xl font-bold tracking-wider"
                  style={{ color: "hsl(185 100% 50%)" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Aathish Kannayil Ajesh
                </motion.h2>
              </motion.div>
            )}

            {/* Phase 3: Co-Founder */}
            {phase === "cofounder" && (
              <motion.div
                key="cofounder"
                {...cinematic}
                transition={slowTransition}
                className="text-center flex flex-col items-center gap-8"
              >
                <motion.div
                  className="text-sm font-display tracking-[0.3em] uppercase"
                  style={{ color: "hsl(300 80% 60% / 0.6)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Co-Founded by
                </motion.div>
                {/* Photo placeholder - user will provide */}
                <motion.div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: "hsl(300 80% 60% / 0.5)", background: "hsl(230 20% 15%)" }}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <span className="text-5xl">👤</span>
                </motion.div>
                <motion.h2
                  className="font-display text-3xl sm:text-5xl font-bold tracking-wider"
                  style={{ color: "hsl(300 80% 60%)" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Aagney Kannayil Ajesh
                </motion.h2>
              </motion.div>
            )}

            {/* Phase 4: A.K.A Kannayil Brothers */}
            {phase === "aka" && (
              <motion.div
                key="aka"
                {...cinematic}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center"
              >
                <motion.div
                  className="text-sm font-display tracking-[0.3em] uppercase mb-6"
                  style={{ color: "hsl(45 100% 60% / 0.6)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  A.K.A
                </motion.div>
                <motion.h2
                  className="font-display text-4xl sm:text-7xl font-black tracking-wider leading-tight"
                  style={{ color: "hsl(45 100% 60%)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: [0.5, 1.05, 1],
                    textShadow: [
                      "0 0 10px hsl(45 100% 60% / 0.3)",
                      "0 0 40px hsl(45 100% 60% / 0.6)",
                      "0 0 20px hsl(45 100% 60% / 0.4)",
                    ]
                  }}
                  transition={{ delay: 0.5, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  THE KANNAYIL
                  <br />
                  BROTHERS
                </motion.h2>
                <motion.div
                  className="mt-8 h-1 mx-auto rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(45 100% 60%), hsl(185 100% 50%), transparent)" }}
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
