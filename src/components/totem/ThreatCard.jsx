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
      <Image
        src={threat.image}
        alt={threat.name}
        className="absolute inset-0 h-full w-full"
        fittingType="fill"
        focalPointX={0.5}
        focalPointY={threat.id === "flood" || threat.id === "infiltration" ? 1 : 0.5}
      />
      {highlighted && <div className="absolute inset-0 bg-primary/10" />}
      <div className="absolute inset-x-2 top-2 flex justify-center">
        <span className="rounded-lg bg-card/85 px-3 py-0.5 text-center font-heading text-[26px] font-bold leading-snug text-foreground shadow-sm">
          {threat.name}
        </span>
      </div>
    </motion.button>
  );
}