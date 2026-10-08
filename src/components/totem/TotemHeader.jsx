import React from "react";
import CountdownTimer from "@/components/totem/CountdownTimer";
import VotesBadge from "@/components/totem/VotesBadge";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/threats";

export default function TotemHeader({ isResults, targetMs, totalVotes, counterRef }) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between">
        <Image src={LOGO_URL} alt="לוגו הרשות" className="h-28 w-[240px]" fittingType="fit" />
        <div className="flex flex-col items-start gap-3">
          {isResults ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-4 font-heading text-2xl font-bold text-foreground shadow-sm">
              התוצאות חשופות עד לאיפוס המנהל
            </div>
          ) : (
            <>
              <span className="font-heading text-2xl text-foreground">חשיפת תוצאות בעוד:</span>
              <CountdownTimer targetMs={targetMs} />
              <VotesBadge ref={counterRef} total={totalVotes} />
            </>
          )}
        </div>
      </div>
      <h1 className="mt-1 text-center font-display text-[104px] font-bold leading-none text-foreground">
        מהו האיום המרכזי על הרשות שלך?
      </h1>
      <p className="mt-2 text-center font-heading text-[34px] font-semibold text-foreground">
        יש לבחור באפשרות הנכונה ביותר מבין האפשרויות המוצגות מטה
      </p>
      <div className="mt-1 text-center font-heading text-[24px] leading-snug text-muted-foreground">
        <p>הכרת האיומים המרכזיים על רשויות במצבי חירום היא הבסיס להיערכות נכונה ולשמירה על רציפות התפקוד הממלכתי.</p>
        <p>הצבעתכם מסייעת למפות את תחושת הסיכון הציבורית ולשפר את מוכנות הרשות לאתגרים הצפויים.</p>
      </div>
    </div>
  );
}