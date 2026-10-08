import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

export default function ThreatCard({ threat, highlighted, onVote }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={(e) => onVote(threat.id, e.currentTarget)}
      className={`relative w-full overflow-hidden rounded-2xl border text-right transition-all duration-300 ${
        highlighted
          ? "border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_60px_rgba(251,191,36,0.55)]"
          : "border-border shadow-md"
      }`}
    >
      <Image src={threat.image} alt={threat.name} className="absolute inset-0 h-full w-full" fittingType="fill" />
      {highlighted && <div className="absolute inset-0 bg-primary/10" />}
      <div className="absolute inset-x-0 bottom-0 flex min-h-[72px] items-center justify-center bg-card/95 px-3 py-2">
        <span className="text-center font-heading text-[44px] font-extrabold leading-tight text-foreground">{threat.name}</span>
      </div>
    </motion.button>
  );
}