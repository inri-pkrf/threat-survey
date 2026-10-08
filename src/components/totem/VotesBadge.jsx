import React from "react";
import { Vote } from "lucide-react";

const VotesBadge = React.forwardRef(function VotesBadge({ total, variant = "dark" }, ref) {
  const light = variant === "light";
  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${
        light
          ? "border-[#0f1e33]/15 bg-white shadow-[0_10px_30px_rgba(15,30,50,0.12)]"
          : "border-amber-400/40 bg-gradient-to-l from-amber-400/15 to-transparent shadow-[0_0_35px_rgba(251,191,36,0.25)]"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          light ? "bg-amber-500/15" : "bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
        }`}
      >
        <Vote className={`h-8 w-8 ${light ? "text-amber-600" : "text-amber-300"}`} />
      </div>
      <div>
        <div className={`font-heading text-4xl font-extrabold leading-none tabular-nums ${light ? "text-[#0f1e33]" : "text-white"}`}>
          {total.toLocaleString("he-IL")}
        </div>
        <div className={`mt-1 font-heading text-lg ${light ? "text-[#5a5240]" : "text-slate-300"}`}>
          סך ההצבעות בכל המסכים
        </div>
      </div>
    </div>
  );
});

export default VotesBadge;