import React, { useLayoutEffect, useRef } from "react";

const ITEM_HEIGHT = 64;

export default function TimeWheel({ values, value, onChange, label }) {
  const ref = useRef(null);
  const initialValue = useRef(value);
  useLayoutEffect(() => {
    ref.current.scrollTop = values.indexOf(initialValue.current) * ITEM_HEIGHT;
  }, [values]);

  const handleScroll = () => {
    const index = Math.max(0, Math.min(values.length - 1, Math.round(ref.current.scrollTop / ITEM_HEIGHT)));
    if (values[index] !== value) onChange(values[index]);
  };

  return (
    <div className="w-[150px]">
      <div className="mb-2 text-center font-heading text-xl font-semibold text-muted-foreground">{label}</div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-16 -translate-y-1/2 rounded-xl border-2 border-ring/40 bg-primary/15" />
        <div ref={ref} onScroll={handleScroll} role="listbox" aria-label={label} className="no-scrollbar h-[320px] snap-y snap-mandatory overflow-y-auto overscroll-contain text-center">
          <div className="h-32" />
          {values.map((number, index) => (
            <button key={number} type="button" role="option" aria-selected={number === value}
              onClick={() => { ref.current.scrollTop = index * ITEM_HEIGHT; onChange(number); }}
              className={`flex h-16 w-full snap-center items-center justify-center font-heading tabular-nums ${number === value ? "text-5xl font-extrabold text-foreground" : "text-3xl text-muted-foreground"}`}>
              {String(number).padStart(2, "0")}
            </button>
          ))}
          <div className="h-32" />
        </div>
      </div>
    </div>
  );
}