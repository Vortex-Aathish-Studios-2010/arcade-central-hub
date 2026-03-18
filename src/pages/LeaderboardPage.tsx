import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Medal, Crown, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTotalWins, getTotalLosses, getPlayerName, setPlayerName } from "@/lib/streaks";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  wins: number;
  losses: number;
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(() => getPlayerName());
  const [showSubmit, setShowSubmit] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase.from("leaderboard").select("*").order("wins", { ascending: false }).limit(50);
    if (error) {
      toast.error("Failed to load leaderboard");
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    const channel = supabase.channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, () => fetchLeaderboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmitScore = async () => {
    if (!name.trim()) { toast.error("Enter your name"); return; }
    setSubmitting(true);
    setNameError(false);

    const wins = getTotalWins();
    const losses = getTotalLosses();

    // Check if name already exists and belongs to someone else
    const { data: existing } = await supabase
      .from("leaderboard")
      .select("id, wins, losses, player_name")
      .eq("player_name", name.trim())
      .maybeSingle();

    const currentName = getPlayerName();

    if (existing && currentName !== name.trim()) {
      // Name taken by someone else - show shake animation
      setNameError(true);
      toast.error("Screen name already used! Choose another.");
      setSubmitting(false);
      setTimeout(() => setNameError(false), 600);
      return;
    }

    if (existing) {
      await supabase.from("leaderboard").update({ wins, losses, updated_at: new Date().toISOString() }).eq("id", existing.id);
      toast.success("Score updated!");
    } else {
      const { error } = await supabase.from("leaderboard").insert({ player_name: name.trim(), wins, losses });
      if (error) {
        if (error.code === "23505") {
          setNameError(true);
          toast.error("Screen name already used!");
          setTimeout(() => setNameError(false), 600);
        } else {
          toast.error("Failed to submit score");
        }
        setSubmitting(false);
        return;
      }
      toast.success("Registered!");
    }

    setPlayerName(name.trim());
    setSubmitting(false);
    setShowSubmit(false);
    fetchLeaderboard();
  };

  const handleDeleteEntry = async (entryId: string) => {
    setDeleting(entryId);
    const { error } = await supabase.from("leaderboard").delete().eq("id", entryId);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      setPlayerName("");
      fetchLeaderboard();
    }
    setDeleting(null);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-accent" />;
    if (index === 1) return <Medal className="w-5 h-5 text-foreground/70" />;
    if (index === 2) return <Medal className="w-5 h-5 text-accent/60" />;
    return <span className="w-5 text-center text-muted-foreground text-sm font-display">{index + 1}</span>;
  };

  const currentPlayerName = getPlayerName();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/?mode=select")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-display text-sm">
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
          {currentPlayerName ? (
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 font-display text-xs text-primary">
              SYNCING AS {currentPlayerName.toUpperCase()}
            </div>
          ) : (
            <button
              onClick={() => setShowSubmit(!showSubmit)}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-xl font-display text-xs hover:border-accent/60 transition-all"
            >
              <Plus className="w-3 h-3" />
              JOIN LEADERBOARD
            </button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <Trophy className="w-10 h-10 text-accent mx-auto mb-2" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            WORLD <span className="text-accent">LEADERBOARD</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Top players ranked by wins</p>
        </div>

        {/* Submit form */}
        {showSubmit && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Your stats: {getTotalWins()}W / {getTotalLosses()}L
            </p>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className={`flex-1 bg-background border rounded-lg px-3 py-2 text-foreground font-display text-sm focus:border-primary outline-none transition-all ${
                  nameError ? "border-destructive animate-shake" : "border-border"
                }`}
              />
              <button
                onClick={handleSubmitScore}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "..." : "SUBMIT"}
              </button>
            </div>
            {nameError && (
              <p className="text-destructive text-xs font-display mt-2 animate-shake">
                ⚠️ Screen name already taken! Choose a different one.
              </p>
            )}
          </div>
        )}

        {/* Leaderboard table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse-glow text-primary font-display">Loading...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-display">No scores yet!</p>
            <p className="text-muted-foreground text-sm mt-1">Be the first to submit your score.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isCurrentPlayer = entry.player_name === currentPlayerName;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isCurrentPlayer ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                  }`}
                >
                  <div className="w-8 flex justify-center">{getRankIcon(i)}</div>
                  <span className="flex-1 font-display text-sm text-foreground truncate">{entry.player_name}</span>
                  <div className="flex items-center gap-2 text-xs font-display">
                    <span className="text-primary">{entry.wins}W</span>
                    <span className="text-destructive">{entry.losses}L</span>
                    <span className="text-muted-foreground">
                      {entry.wins + entry.losses > 0
                        ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
                        : 0}%
                    </span>
                  </div>
                  {/* Delete button - only for current player's entry */}
                  {isCurrentPlayer && (
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      disabled={deleting === entry.id}
                      className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive/60 hover:text-destructive transition-all"
                      title="Delete your entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LeaderboardPage;
