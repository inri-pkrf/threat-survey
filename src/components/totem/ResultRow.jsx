import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function ResultRow({ threat, rank, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="flex min-h-0 flex-1 items-center gap-4 rounded-2xl border border-border bg-card px-4 shadow-sm"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/80 font-heading text-2xl font-extrabold text-background shadow-sm">
        {rank}
      </span>
      <Image src={threat.image} alt={threat.name} className="h-14 w-24 shrink-0 rounded-xl" fittingType="fill" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-heading text-[30px] font-bold leading-tight text-foreground">{threat.name}</span>
          <span dir="ltr" className="shrink-0 font-heading text-[36px] font-extrabold leading-none text-foreground tabular-nums">
            {threat.pct.toLocaleString("he-IL")}%
          </span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${threat.pct}%` }}
            transition={{ duration: 0.7, delay: 0.15 + index * 0.04 }}
            className="h-full rounded-full bg-ring"
          />
        </div>
      </div>
    </motion.div>
  );
}