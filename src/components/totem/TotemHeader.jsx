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
            <div className="rounded-2xl border border-[#0f1e33]/15 bg-white px-6 py-4 font-heading text-2xl font-bold text-[#8a6a1f] shadow-[0_10px_30px_rgba(15,30,50,0.10)]">
              התוצאות חשופות עד לאיפוס המנהל
            </div>
          ) : (
            <React.Fragment>
              <span className="font-heading text-2xl text-slate-300">חשיפת תוצאות בעוד:</span>
              <CountdownTimer targetMs={targetMs} />
            </React.Fragment>
          )}
          <VotesBadge ref={counterRef} total={totalVotes} variant={isResults ? "light" : "dark"} />
        </div>
      </div>
      <h1 className={`mt-1 text-center font-display text-[104px] font-bold leading-none ${isResults ? "text-[#0f1e33]" : "text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.5)]"}`}>
        מהו האיום המרכזי על הרשות שלך?
      </h1>
      <p className={`mt-2 text-center font-heading text-[34px] font-semibold ${isResults ? "text-[#33435e]" : "text-slate-200"}`}>
        יש לבחור באפשרות הנכונה ביותר מבין האפשרויות המוצגות מטה
      </p>
      <div className={`mt-1 text-center font-heading text-[24px] leading-snug ${isResults ? "text-[#6a5f47]" : "text-slate-400"}`}>
        <p>הכרת האיומים המרכזיים על רשויות במצבי חירום היא הבסיס להיערכות נכונה ולשמירה על רציפות התפקוד הממלכתי.</p>
        <p>הצבעתכם מסייעת למפות את תחושת הסיכון הציבורית ולשפר את מוכנות הרשות לאתגרים הצפויים.</p>
      </div>
    </div>
  );
}