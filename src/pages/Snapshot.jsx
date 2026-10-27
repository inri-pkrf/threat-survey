import React, { useRef } from "react";
import KioskScaler from "@/components/totem/KioskScaler";
import TotemHeader from "@/components/totem/TotemHeader";
import ResultsBoard from "@/components/totem/ResultsBoard";
import { THREATS } from "@/lib/threats";

// דף לצפייה בלבד: מציג את מסך התוצאות כפי שהוא נראה בטוטם, עם נתונים שמוזרקים
// על ידי סקריפט הצילום היומי (scripts/send-snapshot.mjs). אין בו הצבעה ואין גישה למסד נתונים.
export default function Snapshot() {
  const counterRef = useRef(null);
  const injected = (typeof window !== "undefined" && window.__SNAPSHOT__) || {};
  const counts = Object.fromEntries(THREATS.map((t) => [t.id, Number((injected.counts || {})[t.id]) || 0]));
  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <KioskScaler>
      <div dir="rtl" className="relative h-full w-full select-none overflow-hidden bg-background text-foreground">
        <div className="relative z-10 flex h-full w-full flex-col px-10 pb-16 pt-8">
          <TotemHeader isResults targetMs={Date.now()} totalVotes={totalVotes} counterRef={counterRef} />
          <ResultsBoard counts={counts} totalVotes={totalVotes} />
        </div>
      </div>
    </KioskScaler>
  );
}
