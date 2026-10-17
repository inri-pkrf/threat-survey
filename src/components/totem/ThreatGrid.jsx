import React, { useLayoutEffect, useRef } from "react";
import { Clock } from "lucide-react";
import ThreatCard from "./ThreatCard";
import { THREATS } from "@/lib/threats";

const BY_ID = Object.fromEntries(THREATS.map((t) => [t.id, t]));

// order: מערך מזהי איומים בסדר התצוגה (משתנה אקראית אחרי כל הצבעה)
// closed / openTime / closeTime: מחוץ לשעות הפעילות מציגים הודעה וחוסמים הצבעה
export default function ThreatGrid({ counts, highlights, onVote, order, closed = false, openTime = "", closeTime = "" }) {
  const ids = order && order.length ? order : THREATS.map((t) => t.id);
  const refs = useRef({});
  const prevRects = useRef(null);

  // אנימציית החלפת מקומות (FLIP). נעשית ידנית כי הבד מוקטן ב-transform,
  // והחישוב מתחשב ביחס ההקטנה.
  useLayoutEffect(() => {
    const prev = prevRects.current;
    if (!prev) return;
    ids.forEach((id) => {
      const el = refs.current[id];
      const a = prev[id];
      if (!el || !a) return;
      const b = el.getBoundingClientRect();
      const s = el.offsetWidth ? b.width / el.offsetWidth : 1;
      const dx = (a.left - b.left) / s;
      const dy = (a.top - b.top) / s;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }],
        { duration: 650, easing: "cubic-bezier(0.22, 0.8, 0.26, 1)" }
      );
    });
  }, [ids.join(",")]);

  // שומרים את המיקומים אחרי כל רינדור, כדי להשוות בפעם הבאה שהסדר משתנה
  useLayoutEffect(() => {
    const rects = {};
    ids.forEach((id) => {
      const el = refs.current[id];
      if (el) rects[id] = el.getBoundingClientRect();
    });
    prevRects.current = rects;
  });

  return (
    <div className="relative flex flex-1 flex-col">
      <div className={`grid flex-1 grid-cols-2 grid-rows-6 gap-4 transition-opacity duration-500 ${closed ? "pointer-events-none opacity-30" : ""}`}>
        {ids.map((id) => (
          <div key={id} ref={(el) => { refs.current[id] = el; }} className="min-h-0">
            <ThreatCard threat={BY_ID[id]} highlighted={!!highlights[id]} onVote={onVote} />
          </div>
        ))}
      </div>
      {closed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-14 py-10 text-center shadow-2xl">
            <Clock className="h-16 w-16 text-foreground" />
            <p className="font-display text-[64px] font-bold leading-tight text-foreground">הסקר סגור כעת</p>
            <p className="font-heading text-[34px] text-muted-foreground">ניתן להצביע מהשעה <span dir="ltr">{openTime}</span> עד השעה <span dir="ltr">{closeTime}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
