import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Play, Trophy, X } from "lucide-react";
import { ensurePlayer, createRoom, joinRoom, startGame, reportScore, subscribeToRoom } from "@/lib/multiplayer";
import { getPlayerName, addWin, addLoss } from "@/lib/streaks";
import { toast } from "sonner";

interface MultiplayerLobbyProps {
  gameId: string;
  onStartMultiplayer: (roomId: string, playerId: string, difficulty: number) => void;
  onClose: () => void;
}

export const MultiplayerLobby = ({ gameId, onStartMultiplayer, onClose }: MultiplayerLobbyProps) => {
  const [step, setStep] = useState<"name" | "choice" | "create" | "join" | "waiting">("name");
  const [name, setName] = useState(getPlayerName() || "");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [roomStatus, setRoomStatus] = useState("waiting");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const fetchPlayers = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: ps } = await supabase.from("room_players").select("*, players(display_name)").eq("room_id", roomId);
      const { data: room } = await supabase.from("game_rooms").select("status").eq("id", roomId).single();
      if (ps) setPlayers(ps);
      if (room) setRoomStatus(room.status || "waiting");
    };
    fetchPlayers();
    const unsub = subscribeToRoom(roomId, (ps, status) => {
      setPlayers(ps);
      setRoomStatus(status);
      if (status === "playing" && !isHost) {
        onStartMultiplayer(roomId, playerId!, 1);
      }
    });
    return unsub;
  }, [roomId, isHost, playerId]);

  const handleSetName = async () => {
    if (!name.trim()) return;
    try { const id = await ensurePlayer(name.trim()); setPlayerId(id); setStep("choice"); }
    catch { toast.error("Failed to set up player"); }
  };

  const handleCreate = async () => {
    if (!playerId) return;
    try { const room = await createRoom(playerId, gameId); setRoomCode(room.code); setRoomId(room.id); setIsHost(true); setStep("waiting"); }
    catch { toast.error("Failed to create room"); }
  };

  const handleJoin = async () => {
    if (!playerId || !joinCode.trim()) return;
    try {
      const room = await joinRoom(playerId, joinCode.trim());
      if (!room) { toast.error("Room not found or game already started"); return; }
      setRoomId(room.id); setRoomCode(joinCode.trim().toUpperCase()); setIsHost(false); setStep("waiting");
    } catch { toast.error("Failed to join room"); }
  };

  const handleStart = async () => {
    await startGame(roomId);
    onStartMultiplayer(roomId, playerId!, 1);
  };

  const copyCode = () => { navigator.clipboard.writeText(roomCode); toast.success("Code copied!"); };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display text-lg text-foreground mb-4">Multiplayer</h2>

        {step === "name" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Enter your display name:</p>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSetName()} placeholder="Your name" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-display text-sm focus:border-primary outline-none" autoFocus />
            <button onClick={handleSetName} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-display text-sm">CONTINUE</button>
          </div>
        )}

        {step === "choice" && (
          <div className="flex flex-col gap-3">
            <button onClick={handleCreate} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-display text-sm">CREATE ROOM</button>
            <div className="text-center text-xs text-muted-foreground">OR</div>
            <div className="flex gap-2">
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={6} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground font-display text-sm text-center tracking-widest focus:border-secondary outline-none" />
              <button onClick={handleJoin} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-display text-sm">JOIN</button>
            </div>
          </div>
        )}

        {step === "waiting" && (
          <div className="flex flex-col gap-3 items-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Room Code</p>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl tracking-widest text-primary">{roomCode}</span>
                <button onClick={copyCode} className="text-muted-foreground hover:text-primary"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">PLAYERS ({players.length})</div>
            {players.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-foreground"><Users className="w-3 h-3" />{p.players?.display_name || "Player"}</div>
            ))}
            {players.length < 2 && <p className="text-xs text-muted-foreground animate-pulse">Waiting for players...</p>}
            {isHost && players.length >= 2 && (
              <button onClick={handleStart} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-display text-sm flex items-center gap-1.5"><Play className="w-3 h-3" /> START GAME</button>
            )}
            {!isHost && roomStatus === "waiting" && <p className="text-xs text-muted-foreground">Waiting for host to start...</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface MultiplayerResultProps {
  roomId: string;
  playerId: string;
  gameId: string;
  onClose: () => void;
}

export const MultiplayerResult = ({ roomId, playerId, gameId, onClose }: MultiplayerResultProps) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, (ps, status) => {
      setPlayers(ps);
      if (status === "finished") {
        setAllDone(true);
        const me = ps.find((p: any) => p.player_id === playerId);
        if (me?.is_winner) addWin(gameId);
        else addLoss(gameId);
      }
    });
    const fetch = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.from("room_players").select("*, players(display_name)").eq("room_id", roomId);
      if (data) setPlayers(data);
    };
    fetch();
    return unsub;
  }, [roomId, playerId, gameId]);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const me = players.find((p: any) => p.player_id === playerId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
        <h2 className="font-display text-lg text-foreground mb-4 text-center">
          {allDone ? (me?.is_winner ? "YOU WON! 🎉" : "YOU LOST") : "Waiting for others..."}
        </h2>
        {sorted.map((p: any, i) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">#{i + 1}</span>
              <span className="font-display text-sm text-foreground">{p.players?.display_name || "Player"}</span>
              {p.is_winner && <Trophy className="w-3 h-3 text-accent" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm text-primary">{p.score}</span>
              {p.finished ? <span className="text-xs text-accent">✓</span> : <span className="text-xs text-muted-foreground">playing</span>}
            </div>
          </div>
        ))}
        {allDone && (
          <button onClick={onClose} className="w-full mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-display text-sm">DONE</button>
        )}
      </div>
    </motion.div>
  );
};
