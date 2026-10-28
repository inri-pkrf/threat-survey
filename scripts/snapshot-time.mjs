// עזרי זמן לסקריפט הצילום היומי. נפרדים כדי שאפשר יהיה לבדוק אותם.
const TZ = "Asia/Jerusalem";

export function israelParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

// cron בפורמט "M H * * *" (UTC) -> הרגע האחרון שבו הוא היה אמור לרוץ, עד עכשיו.
// כך אפשר לדעת באיזו שעה (בישראל) ההרצה הייתה מתוזמנת, גם אם GitHub התחיל אותה באיחור של שעות.
export function lastScheduledInstant(cron, now = new Date()) {
  const m = /^\s*(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*\s*$/.exec(String(cron || ""));
  if (!m) return null;
  const minute = Number(m[1]);
  const hour = Number(m[2]);
  let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute);
  if (t > now.getTime()) t -= 86400000;
  return new Date(t);
}
