import React from "react";
import ThreatCard from "./ThreatCard";
import { THREATS } from "@/lib/threats";

export default function ThreatGrid({ counts, highlights, onVote }) {
  return (
    <div className="grid flex-1 grid-cols-2 grid-rows-6 gap-4">
      {THREATS.map((t) => (
        <ThreatCard key={t.id} threat={t} highlighted={!!highlights[t.id]} onVote={onVote} />
      ))}
    </div>
  );
}