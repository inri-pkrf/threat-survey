// דוח יומי במייל. מופעל אוטומטית פעם ביום על ידי Vercel Cron (ראי vercel.json).
// נדרשים משתני סביבה ב-Vercel: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
// REPORT_TO_EMAIL, CRON_SECRET (ואופציונלי REPORT_FROM_EMAIL).
import { createClient } from "@supabase/supabase-js";
import { buildReport, renderHtml, renderCsv } from "../server/report.js";

const TZ = "Asia/Jerusalem";

function israelNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

const toMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return Number(h) * 60 + Number(m || 0);
};

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");

  // הרשאה: Vercel Cron שולח Authorization: Bearer <CRON_SECRET>.
  // לבדיקה ידנית אפשר גם ?secret=<CRON_SECRET> בכתובת.
  const secret = process.env.CRON_SECRET;
  const provided = (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || url.searchParams.get("secret");
  if (!secret || provided !== secret) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const required = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    REPORT_TO_EMAIL: process.env.REPORT_TO_EMAIL,
  };
  const missing = Object.keys(required).filter((k) => !required[k]);
  if (missing.length) return res.status(500).json({ error: "missing env vars", missing });

  const force = url.searchParams.get("force") === "1";
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const nowIl = israelNow();
  const date = url.searchParams.get("date") || nowIl.date;

  try {
    if (!force) {
      // לא שולחים לפני סגירת הסקר באותו יום
      const { data: win } = await supabase.from("voting_window").select("close_time").limit(1).maybeSingle();
      const close = win ? toMinutes(win.close_time) : 16 * 60 + 30;
      if (date === nowIl.date && nowIl.minutes < close) {
        return res.status(200).json({ skipped: "voting still open", date });
      }
      const { data: sent } = await supabase.from("report_log").select("report_date").eq("report_date", date).maybeSingle();
      if (sent) return res.status(200).json({ skipped: "already sent", date });
    }

    const { data: rows, error } = await supabase.rpc("daily_stats", { p_date: date });
    if (error) throw error;

    if (!rows.length && !force) {
      await supabase.from("report_log").upsert({ report_date: date });
      return res.status(200).json({ skipped: "no votes", date });
    }

    const report = buildReport(rows, date);
    const to = process.env.REPORT_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean);
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL || "Totem Survey <onboarding@resend.dev>",
        to,
        subject: `סיכום סקר טוטם האיומים – ${report.displayDate}`,
        html: renderHtml(report),
        attachments: [
          { filename: `votes-${date}.csv`, content: Buffer.from(renderCsv(report), "utf8").toString("base64") },
        ],
      }),
    });
    if (!resp.ok) {
      return res.status(502).json({ error: "email provider rejected the request", status: resp.status, detail: await resp.text() });
    }

    if (!force) await supabase.from("report_log").upsert({ report_date: date });
    return res.status(200).json({ sent: true, date, total: report.total, to: to.length });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
