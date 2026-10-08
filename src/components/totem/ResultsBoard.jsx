import React from "react";
import { motion } from "framer-motion";
import { THREATS } from "@/lib/threats";

/**
 * לוח חשיפת התוצאות: רקע בהיר, אחוזים בלבד, גדול וקריא מרחוק.
 */
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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_35px_rgba(15,23,42,0.12)]"
        >
          <img src={t.image} alt={t.name} className="h-[132px] w-full object-cover" />
          <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0f1e33]/75 font-heading text-xl font-bold text-white">
            {i + 1}
          </span>
          <div className="flex flex-1 items-center justify-between gap-3 px-5 pb-2">
            <span className="truncate font-heading text-[34px] font-bold leading-tight text-[#0f1e33]">{t.name}</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="whitespace-nowrap font-heading text-[54px] font-extrabold leading-none text-amber-600 tabular-nums"
            >
              {t.pct.toLocaleString("he-IL")}%
            </motion.span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}