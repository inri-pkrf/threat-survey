import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { he } from "date-fns/locale";

export default function DateTimePicker({ onConfirm }) {
  const base = new Date();
  const days = Array.from({ length: 30 }, (_, i) => addDays(base, i));
  const [dayIdx, setDayIdx] = useState(0);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const listRef = useRef(null);

  const scrollList = (dir) => {
    if (listRef.current) listRef.current.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  const Stepper = ({ label, value, min, max, onChange }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="font-heading text-xl text-slate-400">{label}</span>
      <button
        type="button"
        onClick={() => onChange(value === max ? min : value + 1)}
        className="flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
        aria-label="הוספה"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
      <div className="w-40 rounded-xl border border-amber-400/40 bg-amber-400/10 py-2 text-center font-heading text-5xl font-extrabold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={() => onChange(value === min ? max : value - 1)}
        className="flex h-14 w-40 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
        aria-label="הפחתה"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
    </div>
  );

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollList(-1)}
          aria-label="קדימה"
          className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
        <div ref={listRef} className="flex flex-1 gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {days.map((d, i) => {
            const selected = i === dayIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setDayIdx(i)}
                className={`shrink-0 rounded-xl border px-5 py-3 text-center font-heading transition-colors ${
                  selected
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-white/15 bg-white/5 text-slate-300"
                }`}
              >
                <div className="whitespace-nowrap text-2xl font-bold">{format(d, "d MMM", { locale: he })}</div>
                <div className="whitespace-nowrap text-lg">{format(d, "EEEE", { locale: he })}</div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollList(1)}
          aria-label="אחורה"
          className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      </div>
      <div className="mt-6 flex items-start justify-center gap-12">
        <Stepper label="שעה" value={hour} min={0} max={23} onChange={setHour} />
        <Stepper label="דקות" value={minute} min={0} max={59} onChange={setMinute} />
      </div>
      <button
        type="button"
        onClick={() => onConfirm(setHours(setMinutes(days[dayIdx], minute), hour))}
        className="mt-6 w-full rounded-2xl bg-amber-400 py-5 font-heading text-3xl font-extrabold text-[#0c1526] transition-colors hover:bg-amber-300"
      >
        אישור: איפוס הקולות והתחלת סבב חדש
      </button>
    </div>
  );
}