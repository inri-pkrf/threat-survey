import React from "react";
import { Delete, Check } from "lucide-react";

export default function Numpad({ value, onChange, onSubmit }) {
  const press = (d) => {
    if (value.length < 4) onChange(value + d);
  };

  const keyClass =
    "h-24 rounded-2xl border border-border bg-card font-heading text-4xl font-bold text-foreground transition-colors hover:bg-secondary active:bg-primary/30";

  return (
    <div dir="ltr" className="mx-auto mt-8 grid max-w-[540px] grid-cols-3 gap-4">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} type="button" onClick={() => press(d)} className={keyClass}>
          {d}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(value.slice(0, -1))}
        aria-label="מחיקה"
        className="flex h-24 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-secondary"
      >
        <Delete className="h-9 w-9" />
      </button>
      <button type="button" onClick={() => press("0")} className={keyClass}>
        0
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={value.length < 4}
        aria-label="אישור"
        className="flex h-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors disabled:opacity-40"
      >
        <Check className="h-10 w-10" strokeWidth={3} />
      </button>
    </div>
  );
}