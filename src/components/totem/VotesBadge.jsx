import React from "react";
import { Vote } from "lucide-react";

const VotesBadge = React.forwardRef(function VotesBadge({ total }, ref) {
  return (
    <div
      ref={ref}
      className="flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-400/15 to-transparent px-5 py-3 shadow-[0_0_35px_rgba(251,191,36,0.25)]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.35)]">
        <Vote className="h-8 w-8 text-amber-300" />
      </div>
      <div>
        <div className="font-heading text-4xl font-extrabold leading-none text-white tabular-nums">
          {total.toLocaleString("he-IL")}
        </div>
        <div className="mt-1 font-heading text-lg text-slate-300">סך ההצבעות בכל המסכים</div>
      </div>
    </div>
  );
});

export default VotesBadge;