import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function ResultCard({ threat, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex min-h-0 overflow-hidden rounded-3xl border border-border bg-card shadow-md">
      <Image src={threat.image} alt={threat.name} className="h-full w-2/5 shrink-0" fittingType="fill" />
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-3 py-2 text-center text-foreground">
        <span className="font-heading text-[46px] font-extrabold leading-[1.05]">{threat.name}</span>
        <span dir="ltr" className="whitespace-nowrap font-heading text-[84px] font-extrabold leading-none tabular-nums">{threat.pct.toLocaleString("he-IL")}%</span>
      </div>
    </motion.div>
  );
}