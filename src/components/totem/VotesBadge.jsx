import React from "react";
import { StickyNote } from "lucide-react";

const VotesBadge = React.forwardRef(function VotesBadge({ total }, ref) {
  return (
    <div ref={ref} className="w-[92px] rounded-xl border border-border bg-card px-2 py-2 text-center shadow-sm">
      <div className="relative mx-auto flex h-10 w-10 items-center justify-center">
        <StickyNote className="absolute inset-0 h-full w-full text-chart-4" fill="currentColor" strokeWidth={1.2} />
        <span dir="ltr" className="relative font-heading text-base font-extrabold leading-none text-foreground tabular-nums">
          {total.toLocaleString("he-IL")}
        </span>
      </div>
      <div className="mt-1 font-heading text-base text-muted-foreground">הצבעות</div>
    </div>
  );
});

export default VotesBadge;