import React, { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

export default function CountdownTimer({ targetMs }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, targetMs - now);
  const cells = [
    { v: Math.floor(diff / 86400000), label: "ימים" },
    { v: Math.floor((diff % 86400000) / 3600000), label: "שעות" },
    { v: Math.floor((diff % 3600000) / 60000), label: "דקות" },
    { v: Math.floor((diff % 60000) / 1000), label: "שניות" },
  ];

  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.label} className="w-[92px] rounded-xl border border-border bg-card px-2 py-2 text-center shadow-sm">
          <div className="font-heading text-4xl font-extrabold leading-none text-foreground tabular-nums">{pad(c.v)}</div>
          <div className="mt-1 font-heading text-base text-muted-foreground">{c.label}</div>
        </div>
      ))}
    </div>
  );
}