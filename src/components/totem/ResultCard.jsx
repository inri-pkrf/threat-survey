import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function ResultCard({ threat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex h-[280px] shrink-0 overflow-hidden rounded-3xl border-2 border-ring/40 bg-card shadow-lg"
    >
      <div className="relative h-full w-[340px] shrink-0">
        <Image src={threat.image} alt={threat.name} className="h-full w-full" fittingType="fill" />
        <span className="absolute top-3 right-3 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/80 font-heading text-4xl font-extrabold text-background shadow-md">
          1
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-foreground">
        <span className="font-heading text-[56px] font-extrabold leading-tight">{threat.name}</span>
        <div className="flex items-baseline justify-center gap-4" dir="rtl">
          <span dir="ltr" className="whitespace-nowrap font-heading text-[104px] font-extrabold leading-none tabular-nums">
            {threat.pct.toLocaleString("he-IL")}%
          </span>
          <span className="font-heading text-3xl font-bold text-muted-foreground">
            ({threat.count} מצביעים)
          </span>
        </div>

        <div className="mt-1 h-4 w-4/5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${threat.pct}%` }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-full rounded-full bg-ring"
          />
        </div>
      </div>
    </motion.div>
  );
}