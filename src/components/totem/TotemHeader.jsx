import React from "react";
import CountdownTimer from "./CountdownTimer";
import VotesBadge from "./VotesBadge";
import { LOGO_URL } from "@/lib/threats";

export default function TotemHeader({ isResults, targetMs, totalVotes, counterRef }) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between">
        <img src={LOGO_URL} alt="לוגו הרשות" className="h-28 w-auto object-contain" />
        <div className="flex flex-col items-start gap-3">
          {isResults ? (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 font-heading text-2xl font-bold text-amber-300">
              התוצאות חשופות עד לאיפוס המנהל
            </div>
          ) : (
            <React.Fragment>
              <span className="font-heading text-2xl text-slate-300">חשיפת תוצאות בעוד:</span>
              <CountdownTimer targetMs={targetMs} />
            </React.Fragment>
          )}
          <VotesBadge ref={counterRef} total={totalVotes} />
        </div>
      </div>
      <h1 className="mt-1 text-center font-display text-[104px] font-bold leading-none text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.5)]">
        מהו האיום המרכזי על הרשות שלך?
      </h1>
      <p className="mt-2 text-center font-heading text-[34px] font-semibold text-slate-200">
        יש לבחור באפשרות הנכונה ביותר מבין האפשרויות המוצגות מטה
      </p>
      <div className="mt-1 text-center font-heading text-[24px] leading-snug text-slate-400">
        <p>הכרת האיומים המרכזיים על רשויות במצבי חירום היא הבסיס להיערכות נכונה ולשמירה על רציפות התפקוד הממלכתי.</p>
        <p>הצבעתכם מסייעת למפות את תחושת הסיכון הציבורית ולשפר את מוכנות הרשות לאתגרים הצפויים.</p>
      </div>
    </div>
  );
}