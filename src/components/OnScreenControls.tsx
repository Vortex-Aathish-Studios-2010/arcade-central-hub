import { useDevice } from "@/lib/DeviceContext";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export const OnScreenControls = ({ gameId }: { gameId?: string }) => {
  const { device } = useDevice();
  const touchRefs = useRef<{ [key: string]: boolean }>({});

  if (!device || device === "laptop" || !gameId || !["snake", "tetris"].includes(gameId)) return null;

  const dispatchKey = (type: "keydown" | "keyup", key: string) => {
    const event = new KeyboardEvent(type, {
      key,
      code: key === " " ? "Space" : key,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const handleStart = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (touchRefs.current[key]) return;
    touchRefs.current[key] = true;
    dispatchKey("keydown", key);
  };

  const handleEnd = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!touchRefs.current[key]) return;
    touchRefs.current[key] = false;
    dispatchKey("keyup", key);
  };

  const isTablet = device === "tablet";
  const btnSize = isTablet ? "w-14 h-14" : "w-12 h-12";
  const iconSize = isTablet ? "w-6 h-6" : "w-5 h-5";

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-around items-end px-4 z-50 pointer-events-none">
      {/* D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1">
        <div />
        <button className={`${btnSize} bg-card/80 border border-border rounded-xl flex items-center justify-center active:bg-primary/20`}
          onTouchStart={handleStart("ArrowUp")} onTouchEnd={handleEnd("ArrowUp")} onMouseDown={handleStart("ArrowUp")} onMouseUp={handleEnd("ArrowUp")}>
          <ChevronUp className={iconSize} />
        </button>
        <div />
        <button className={`${btnSize} bg-card/80 border border-border rounded-xl flex items-center justify-center active:bg-primary/20`}
          onTouchStart={handleStart("ArrowLeft")} onTouchEnd={handleEnd("ArrowLeft")} onMouseDown={handleStart("ArrowLeft")} onMouseUp={handleEnd("ArrowLeft")}>
          <ChevronLeft className={iconSize} />
        </button>
        <button className={`${btnSize} bg-card/80 border border-border rounded-xl flex items-center justify-center active:bg-primary/20`}
          onTouchStart={handleStart("ArrowDown")} onTouchEnd={handleEnd("ArrowDown")} onMouseDown={handleStart("ArrowDown")} onMouseUp={handleEnd("ArrowDown")}>
          <ChevronDown className={iconSize} />
        </button>
        <button className={`${btnSize} bg-card/80 border border-border rounded-xl flex items-center justify-center active:bg-primary/20`}
          onTouchStart={handleStart("ArrowRight")} onTouchEnd={handleEnd("ArrowRight")} onMouseDown={handleStart("ArrowRight")} onMouseUp={handleEnd("ArrowRight")}>
          <ChevronRight className={iconSize} />
        </button>
      </div>

      {/* Action Buttons (Only for Tetris) */}
      {gameId === "tetris" && (
        <div className="pointer-events-auto flex gap-2">
          <button className={`${btnSize} bg-secondary/20 border border-secondary/50 rounded-xl flex items-center justify-center font-display text-xs text-secondary active:bg-secondary/30`}
            onTouchStart={handleStart("ArrowUp")} onTouchEnd={handleEnd("ArrowUp")} onMouseDown={handleStart("ArrowUp")} onMouseUp={handleEnd("ArrowUp")}>
            FLIP
          </button>
          <button className={`${btnSize} bg-accent/20 border border-accent/50 rounded-xl flex items-center justify-center font-display text-xs text-accent active:bg-accent/30`}
            onTouchStart={handleStart(" ")} onTouchEnd={handleEnd(" ")} onMouseDown={handleStart(" ")} onMouseUp={handleEnd(" ")}>
            DROP
          </button>
        </div>
      )}
    </div>
  );
};
