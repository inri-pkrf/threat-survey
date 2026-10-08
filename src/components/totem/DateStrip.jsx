import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function DateStrip({ days, selectedIndex, onSelect }) {
  const ref = useRef(null);
  const scroll = (distance) => ref.current.scrollBy({ left: distance, behavior: "smooth" });
  const arrowClass = "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary";

  return (
    <div dir="rtl" className="flex items-center gap-3">
      <button type="button" aria-label="גלילה לתאריכים הקודמים" onClick={() => scroll(320)} className={arrowClass}>
        <ChevronRight className="h-6 w-6" />
      </button>
      <div ref={ref} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain py-1">
        {days.map((day, index) => (
          <button key={day.getTime()} type="button" aria-pressed={index === selectedIndex} onClick={() => onSelect(index)}
            className={`shrink-0 rounded-xl border px-5 py-3 text-center font-heading ${index === selectedIndex ? "border-ring bg-primary/25 text-foreground" : "border-border bg-card text-muted-foreground"}`}>
            <div className="whitespace-nowrap text-2xl font-bold">{format(day, "d MMM", { locale: he })}</div>
            <div className="whitespace-nowrap text-lg">{format(day, "EEEE", { locale: he })}</div>
          </button>
        ))}
      </div>
      <button type="button" aria-label="גלילה לתאריכים הבאים" onClick={() => scroll(-320)} className={arrowClass}>
        <ChevronLeft className="h-6 w-6" />
      </button>
    </div>
  );
}