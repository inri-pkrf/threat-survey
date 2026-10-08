import React from "react";
import { Vote } from "lucide-react";

const VotesBadge = React.forwardRef(function VotesBadge({ total }, ref) {
  return (
    <div ref={ref} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Vote className="h-8 w-8 text-foreground" />
      </div>
      <div>
        <div className="font-heading text-4xl font-extrabold leading-none text-foreground tabular-nums">
          {total.toLocaleString("he-IL")}
        </div>
        <div className="mt-1 font-heading text-lg text-muted-foreground">סך ההצבעות בכל המסכים</div>
      </div>
    </div>
  );
});

export default VotesBadge;