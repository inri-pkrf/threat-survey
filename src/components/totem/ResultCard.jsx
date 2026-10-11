import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ResultCard({ threat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex h-[280px] shrink-0 overflow-hidden rounded-3xl border-2 border-ring/40 bg-card shadow-lg"
    >
      <Image src={threat.image} alt={threat.name} className="h-full w-[340px] shrink-0" fittingType="fill" />
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-foreground">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-9 w-9 text-muted-foreground" />
          <span className="font-heading text-[56px] font-extrabold leading-tight">{threat.name}</span>
        </div>
        <span dir="ltr" className="whitespace-nowrap font-heading text-[104px] font-extrabold leading-none tabular-nums">
          {threat.pct.toLocaleString("he-IL")}%
        </span>
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