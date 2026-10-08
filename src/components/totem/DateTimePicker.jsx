import React, { useEffect, useRef, useState } from "react";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronDown } from "lucide-react";

const ITEM_H = 64;
const WHEEL_H = 320;

/** גלגל גלילה לבחירת שעה/דקות, בסגנון בורר הזמן המוכר */
function Wheel({ values, value, onChange, width }) {
  const ref = useRef(null);
  const pad = (n) => String(n).padStart(2, "0");

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = values.indexOf(value) * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(values.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
    if (values[idx] !== value) onChange(values[idx]);
  };

  return (
    <div className="relative" style={{ width }}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[64px] -translate-y-1/2 rounded-xl border-2 border-amber-400/60 bg-amber-400/10" />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar snap-y snap-mandatory overflow-y-scroll text-center"
        style={{ height: WHEEL_H }}
      >
        <div style={{ height: (WHEEL_H - ITEM_H) / 2 }} />
        {values.map((v) => (
          <div
            key={v}
            onClick={() => {
              onChange(v);
              if (ref.current) ref.current.scrollTo({ top: values.indexOf(v) * ITEM_H, behavior: "smooth" });
            }}
            className={`flex snap-center cursor-pointer items-center justify-center font-heading tabular-nums transition-colors ${
              v === value ? "text-5xl font-extrabold text-white" : "text-3xl text-slate-500"
            }`}
            style={{ height: ITEM_H }}
          >
            {pad(v)}
          </div>
        ))}
        <div style={{ height: (WHEEL_H - ITEM_H) / 2 }} />
      </div>
    </div>
  );
}

export default function DateTimePicker({ onConfirm }) {
  const base = new Date();
  const days = Array.from({ length: 30 }, (_, i) => addDays(base, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const stripRef = useRef(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const chosen = setHours(setMinutes(days[dayIdx], minute), hour);
  const past = chosen.getTime() <= Date.now();

  return (
    <div className="mt-6">
      <div ref={stripRef} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
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
        aria-label="גלילה לתאריכים הבאים"
        onClick={() => {
          const el = stripRef.current;
          if (!el) return;
          const atEnd = Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 10;
          el.scrollTo({ left: atEnd ? 0 : el.scrollLeft - 300, behavior: "smooth" });
        }}
        className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition-colors hover:bg-white/10"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
      <div className="mt-6 flex items-center justify-center gap-5">
        <Wheel values={hours} value={hour} onChange={setHour} width={150} />
        <span className="font-heading text-5xl font-bold text-slate-300">:</span>
        <Wheel values={minutes} value={minute} onChange={setMinute} width={150} />
      </div>
      {past && (
        <p className="mt-3 text-center font-heading text-xl text-red-400">המועד שנבחר כבר עבר, יש לבחור מועד עתידי</p>
      )}
      <button
        type="button"
        disabled={past}
        onClick={() => onConfirm(chosen)}
        className={`mt-6 w-full rounded-2xl py-5 font-heading text-3xl font-extrabold transition-colors ${
          past ? "cursor-not-allowed bg-white/10 text-slate-500" : "bg-amber-400 text-[#0c1526] hover:bg-amber-300"
        }`}
      >
        אישור: איפוס הקולות והתחלת סבב חדש
      </button>
    </div>
  );
}