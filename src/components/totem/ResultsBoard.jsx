import React from "react";
import { motion } from "framer-motion";
import { THREATS } from "@/lib/threats";

export default function ResultsBoard({ counts, totalVotes }) {
  const rows = THREATS.map((t) => ({
    ...t,
    count: counts[t.id] || 0,
    pct: totalVotes ? Math.round(((counts[t.id] || 0) / totalVotes) * 1000) / 10 : 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="grid flex-1 grid-cols-2 grid-rows-6 gap-4">
      {rows.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border px-5 ${
            i === 0 ? "border-amber-400/60 bg-amber-400/10" : "border-white/15 bg-white/5"
          }`}
        >
          <span className={`w-9 font-heading text-3xl font-bold ${i === 0 ? "text-amber-300" : "text-slate-500"}`}>
            {i + 1}
          </span>
          <img src={t.image} alt={t.name} className="h-20 w-32 shrink-0 rounded-xl object-cover" />
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-heading text-[30px] font-bold text-white">{t.name}</span>
              <span className="whitespace-nowrap font-heading text-2xl text-amber-300 tabular-nums">
                {t.pct.toLocaleString("he-IL")}% · {t.count.toLocaleString("he-IL")} קולות
              </span>
            </div>
            <div className="mt-1 h-4 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-200"
                initial={{ width: 0 }}
                animate={{ width: `${t.pct}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}