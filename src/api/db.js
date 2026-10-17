import { supabase } from "@/lib/supabase";

// שכבת הנתונים של הטוטם (מחליפה את base44.entities).
// כל הגישה למסד הנתונים עוברת מכאן.

export async function fetchRound() {
  const { data, error } = await supabase
    .from("round_state")
    .select("reveal_at, round_started_at")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCounts() {
  const { data, error } = await supabase.from("vote_counts").select("threat_id, count");
  if (error) throw error;
  return data || [];
}

export async function fetchVotingWindow() {
  const { data, error } = await supabase
    .from("voting_window")
    .select("open_time, close_time")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function castVote(threatId) {
  const { error } = await supabase.rpc("cast_vote", { p_threat_id: threatId });
  if (error) throw error;
}

export async function verifyAdminCode(code) {
  const { data, error } = await supabase.rpc("verify_admin_code", { p_code: code });
  if (error) throw error;
  return data === true;
}

export async function resetRound(code, revealAt) {
  const { error } = await supabase.rpc("reset_round", {
    p_code: code,
    p_reveal_at: revealAt.toISOString(),
  });
  if (error) throw error;
}

// מנוי לשינויים בזמן אמת. מחזיר פונקציית ביטול.
export function subscribeToChanges({ onRound, onVote }) {
  const channel = supabase
    .channel("totem-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "round_state" }, () => onRound())
    .on("postgres_changes", { event: "*", schema: "public", table: "vote_counts" }, (payload) => onVote(payload))
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
