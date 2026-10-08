import React from "react";
import { THREATS } from "@/lib/threats";
import ResultCard from "@/components/totem/ResultCard";

export default function ResultsBoard({ counts, totalVotes }) {
  const rows = THREATS.map((threat) => ({
    ...threat,
    count: counts[threat.id] || 0,
    pct: totalVotes ? Math.round(((counts[threat.id] || 0) / totalVotes) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-6 gap-4">
      {rows.map((threat, index) => <ResultCard key={threat.id} threat={threat} index={index} />)}
    </div>
  );
}