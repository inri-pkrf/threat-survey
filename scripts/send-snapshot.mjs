// תמונת מסך יומית של מסך התוצאות, נשלחת במייל. רץ ב-GitHub Actions (ראי .github/workflows/daily-snapshot.yml)
// ולא נוגע בשום דבר באתר או בהצבעות: רק קורא סטטיסטיקה ושולח מייל.
//
// שימוש:
//   node scripts/send-snapshot.mjs --gate   בודק אם הגיע הזמן לשלוח (כותב run=true/false ל-GITHUB_OUTPUT)
//   node scripts/send-snapshot.mjs          מצלם ושולח
// משתני סביבה: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, REPORT_TO_EMAIL,
//   אופציונלי: REPORT_FROM_EMAIL, SNAPSHOT_URL (ברירת מחדל http://127.0.0.1:4173), FORCE=1, SNAPSHOT_DATE=yyyy-mm-dd
import { appendFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const TZ = "Asia/Jerusalem";
const SEND_WINDOW_MIN = 45; // מותר לשלוח עד 45 דקות אחרי הסגירה (תזמון ב-GitHub עלול לאחר)
const gateOnly = process.argv.includes("--gate");
const force = process.env.FORCE === "1" || process.env.FORCE === "true";

const toMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return Number(h) * 60 + Number(m || 0);
};

function israelNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

const setOutput = (run) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `run=${run}\n`);
  console.log(`run=${run}`);
};

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  REPORT_TO_EMAIL: process.env.REPORT_TO_EMAIL,
};
const missing = Object.keys(required).filter((k) => !required[k]);
if (missing.length) {
  console.error("חסרים משתני סביבה (GitHub Secrets):", missing.join(", "));
  process.exit(1);
}

const supabase = createClient(required.SUPABASE_URL, required.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const nowIl = israelNow();
const date = process.env.SNAPSHOT_DATE || nowIl.date;

// ---- שער: האם לשלוח עכשיו? ----
const { data: win } = await supabase.from("voting_window").select("close_time").limit(1).maybeSingle();
const close = win ? toMinutes(win.close_time) : 16 * 60 + 30;
const inWindow = nowIl.minutes >= close && nowIl.minutes <= close + SEND_WINDOW_MIN;
if (!force && !inWindow) {
  console.log(`מחוץ לחלון השליחה (שעה בישראל: ${Math.floor(nowIl.minutes / 60)}:${String(nowIl.minutes % 60).padStart(2, "0")}). מדלגים.`);
  if (gateOnly) setOutput("false");
  process.exit(0);
}

// ---- נתוני היום ----
const { data: rows, error } = await supabase.rpc("daily_stats", { p_date: date });
if (error) { console.error("שליפת הנתונים נכשלה:", error.message); process.exit(1); }
if (!rows.length && !force) {
  console.log(`אין הצבעות בתאריך ${date} (כנראה לא היה סקר). מדלגים.`);
  if (gateOnly) setOutput("false");
  process.exit(0);
}
if (gateOnly) { setOutput("true"); process.exit(0); }

const counts = {};
for (const r of rows) counts[r.threat_id] = (counts[r.threat_id] || 0) + Number(r.votes);

// ---- צילום ----
const { chromium } = await import("playwright");
const base = process.env.SNAPSHOT_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch();
let png;
try {
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1, locale: "he-IL", timezoneId: TZ });
  const page = await context.newPage();
  await page.addInitScript((c) => { window.__SNAPSHOT__ = { counts: c }; }, counts);
  await page.goto(`${base}/snapshot`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.waitForTimeout(3000); // סיום אנימציות הצגת התוצאות
  png = await page.screenshot({ type: "png" });
} finally {
  await browser.close();
}
if (process.env.SNAPSHOT_SAVE) writeFileSync(process.env.SNAPSHOT_SAVE, png);

// ---- שליחה ----
const [y, m, d] = date.split("-");
const display = `${d}/${m}/${y}`;
const total = Object.values(counts).reduce((a, b) => a + b, 0);
const to = required.REPORT_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean);
const resp = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${required.RESEND_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from: process.env.REPORT_FROM_EMAIL || "Totem Survey <onboarding@resend.dev>",
    to,
    subject: `תמונת מסך: תוצאות סקר טוטם האיומים – ${display}`,
    html: `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;text-align:right"><p>מצורפת תמונת מסך התוצאות של סקר ${display}.</p><p>סך הכל הצבעות: <b>${total}</b></p></div>`,
    attachments: [{ filename: `results-${date}.png`, content: png.toString("base64") }],
  }),
});
if (!resp.ok) {
  console.error("שליחת המייל נכשלה:", resp.status, await resp.text());
  process.exit(1);
}
console.log(`נשלח מייל עם תמונת מסך לתאריך ${date} (${total} הצבעות).`);
