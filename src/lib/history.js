// עזרי מסך ההיסטוריה: בניית רשימת סקרים (יום = סקר) וחלוקה לשבועות ראשון עד שבת.
// כל התאריכים כאן הם מחרוזות ISO (yyyy-mm-dd) לפי שעון ישראל, בלי המרות אזור זמן.
import { TZ } from "@/lib/votingWindow";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MS_DAY = 86400000;

const toUtc = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10);

export const dmy = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const dm = (iso) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export function israelTodayIso(ms = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

// יום ראשון של השבוע שבו נמצא התאריך
export function weekStartIso(iso) {
  const ms = toUtc(iso);
  return fromUtc(ms - new Date(ms).getUTCDay() * MS_DAY);
}

// "18/10 – 24/10" (ראשון עד שבת)
export function weekLabel(startIso) {
  return `${dm(startIso)} – ${dm(fromUtc(toUtc(startIso) + 6 * MS_DAY))}`;
}

export const defaultTitle = (iso) => `סקר איומים – יום ${DAY_NAMES[new Date(toUtc(iso)).getUTCDay()]}`;

// rows: [{ r_date, r_threat_id, r_threat_name, r_votes, r_title }]
// מחזיר סקרים מהחדש לישן
export function buildSurveys(rows, { todayIso, isStillOpenToday }) {
  const byDate = new Map();
  for (const r of rows || []) {
    const iso = String(r.r_date).slice(0, 10);
    const s = byDate.get(iso) || { id: iso, iso, total: 0, title: null, results: [] };
    const votes = Number(r.r_votes) || 0;
    s.total += votes;
    if (r.r_title) s.title = r.r_title;
    s.results.push({ id: r.r_threat_id, name: r.r_threat_name || r.r_threat_id, votes });
    byDate.set(iso, s);
  }
  return [...byDate.values()]
    .map((s) => ({
      id: s.id,
      iso: s.iso,
      week: weekStartIso(s.iso),
      date: dmy(s.iso),
      title: s.title || defaultTitle(s.iso),
      hasCustomTitle: Boolean(s.title),
      total: s.total,
      status: s.iso === todayIso && isStillOpenToday ? "active" : "closed",
      results: s.results
        .map((r) => ({ name: r.name, votes: r.votes, percentage: s.total ? Math.round((r.votes / s.total) * 1000) / 10 : 0 }))
        .sort((a, b) => b.votes - a.votes),
    }))
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

// רשימת תחילות שבוע (ישן -> חדש), כולל השבוע הנוכחי גם אם עדיין אין בו סקר
export function listWeeks(surveys, todayIso) {
  const set = new Set(surveys.map((s) => s.week));
  set.add(weekStartIso(todayIso));
  return [...set].sort();
}
