import React from "react";
import CountdownTimer from "@/components/totem/CountdownTimer";
import VotesBadge from "@/components/totem/VotesBadge";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/threats";

export default function TotemHeader({ isResults, targetMs, totalVotes, counterRef }) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <Image src={LOGO_URL} alt="לוגו הרשות" className="h-24 w-[210px]" fittingType="fit" />
        <div className="flex flex-col items-start gap-2">
          {isResults ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
              <span className="font-heading text-xl font-bold text-foreground">
                {new Date().toLocaleDateString('he-IL')}
              </span>
              <div className="rounded-xl border border-border bg-card px-5 py-2 font-heading text-xl font-bold text-foreground shadow-sm">
                התוצאות חשופות עד לאיפוס המנהלת
              </div>
                            </div>

              <VotesBadge ref={counterRef} total={totalVotes} />
            </div>
          ) : (
            <>
              <span className="font-heading text-xl text-foreground">חשיפת תוצאות בעוד:</span>
              <div className="flex items-start gap-3">
                <CountdownTimer targetMs={targetMs} />
                <VotesBadge ref={counterRef} total={totalVotes} />
              </div>
            </>
          )}
        </div>
      </div>
      {isResults ? (
        <>
          <h1 className="mt-1 text-center font-display text-[104px] font-bold leading-none text-foreground">
            מהו האיום המרכזי על הרשות שלך?
          </h1>
          <p className="mt-1 text-center font-heading text-[30px] leading-snug text-muted-foreground">
            הניסיון שלכם חשוב לנו. לחצו על התרחיש שהכי מאיים על הארגון שלכם והשפיעו על מפת האיומים של המשתתפים.
          </p>
          <p className="mt-1 text-center font-heading text-[34px] font-semibold text-foreground">אלה תוצאות הסקר:</p>
        </>
      ) : (
        <>
          <h1 className="mt-1 text-center font-display text-[104px] font-bold leading-none text-foreground">
            מהו האיום המרכזי על הרשות שלך?
          </h1>
          <div className="mt-1 text-center font-heading text-[24px] leading-snug text-muted-foreground">
            <p>הניסיון שלכם חשוב לנו. לחצו על התרחיש שהכי מאיים על הארגון שלכם והשפיעו על מפת האיומים של המשתתפים.</p>
          </div>
        </>
      )}
    </div>
  );
}