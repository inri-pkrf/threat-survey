import React from "react";
import { THREATS } from "@/lib/threats";
import ResultCard from "@/components/totem/ResultCard";
import ResultRow from "@/components/totem/ResultRow";

export default function ResultsBoard({ counts, totalVotes }) {
  const rows = THREATS.map((threat) => ({
    ...threat,
    count: counts[threat.id] || 0,
    pct: totalVotes ? Math.round(((counts[threat.id] || 0) / totalVotes) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const [leader, ...rest] = rows;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ResultCard threat={leader} index={0} />
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {rest.map((threat, index) => (
          <ResultRow key={threat.id} threat={threat} rank={index + 2} index={index} />
        ))}
      </div>
    </div>
  );
}