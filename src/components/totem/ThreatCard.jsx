import React from "react";
import { motion } from "framer-motion";

export default function ThreatCard({ threat, highlighted, onVote }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={(e) => onVote(threat.id, e.currentTarget)}
      className={`relative w-full overflow-hidden rounded-2xl border text-right transition-all duration-300 ${
        highlighted
          ? "border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_60px_rgba(251,191,36,0.55)]"
          : "border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
      }`}
    >
      <img src={threat.image} alt={threat.name} className="absolute inset-0 h-full w-full object-cover" />
      {highlighted && <div className="absolute inset-0 bg-amber-300/10" />}
      <div className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-center bg-black/45 backdrop-blur-sm">
        <span className="font-heading text-[32px] font-bold text-white">{threat.name}</span>
      </div>
    </motion.button>
  );
}