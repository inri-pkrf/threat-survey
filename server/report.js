// בניית דוח ההצבעות היומי: סיכום, אחוזים, פירוט לפי שעה, HTML ו-CSV.

const pad = (n) => String(n).padStart(2, "0");
const hourLabel = (h) => `${pad(h)}:00–${pad(h)}:59`;
const pct = (v, total) => (total ? `${((v / total) * 100).toFixed(1)}%` : "0.0%");
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function displayDate(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

// rows: [{ hour, threat_id, threat_name, votes }]
export function buildReport(rows, isoDate) {
  const threats = new Map();
  const hours = new Map();
  const matrix = new Map(); // `${threat_id}|${hour}` -> votes
  let total = 0;

  for (const r of rows) {
    const votes = Number(r.votes);
    const hour = Number(r.hour);
    total += votes;
    const t = threats.get(r.threat_id) || { id: r.threat_id, name: r.threat_name || r.threat_id, votes: 0 };
    t.votes += votes;
    threats.set(r.threat_id, t);
    hours.set(hour, (hours.get(hour) || 0) + votes);
    matrix.set(`${r.threat_id}|${hour}`, votes);
  }

  const byThreat = [...threats.values()]
    .sort((a, b) => b.votes - a.votes)
    .map((t) => ({ ...t, percent: pct(t.votes, total) }));
  const hourKeys = [...hours.keys()].sort((a, b) => a - b);
  const byHour = hourKeys.map((h) => ({ hour: h, label: hourLabel(h), votes: hours.get(h), percent: pct(hours.get(h), total) }));

  return { date: isoDate, displayDate: displayDate(isoDate), total, byThreat, byHour, hourKeys, matrix };
}

const cell = (content, extra = "") =>
  `<td style="padding:8px 14px;border:1px solid #d6dbe3;${extra}">${content}</td>`;
const head = (content) =>
  `<th style="padding:8px 14px;border:1px solid #d6dbe3;background:#eef1f6;text-align:right">${content}</th>`;

export function renderHtml(report) {
  const threatRows = report.byThreat
    .map((t) => `<tr>${cell(esc(t.name))}${cell(t.votes)}${cell(t.percent)}</tr>`)
    .join("");
  const hourRows = report.byHour
    .map((h) => `<tr>${cell(h.label)}${cell(h.votes)}${cell(h.percent)}</tr>`)
    .join("");

  return `<!doctype html>
<html lang="he" dir="rtl"><body style="font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right;color:#1b2430">
<h2 style="margin-bottom:4px">סיכום סקר טוטם האיומים</h2>
<p style="margin-top:0;color:#5a6676">תאריך: <b>${report.displayDate}</b></p>
<p style="font-size:18px">סך הכל הצביעו: <b>${report.total}</b> אנשים</p>

<h3>תוצאות לפי קטגוריה</h3>
<table style="border-collapse:collapse;direction:rtl">
<tr>${head("קטגוריה")}${head("הצבעות")}${head("אחוז")}</tr>
${threatRows}
<tr>${cell("<b>סך הכל</b>", "background:#f7f8fb")}${cell(`<b>${report.total}</b>`, "background:#f7f8fb")}${cell("<b>100%</b>", "background:#f7f8fb")}</tr>
</table>

<h3>הצבעות לפי שעה</h3>
<table style="border-collapse:collapse;direction:rtl">
<tr>${head("שעה")}${head("הצבעות")}${head("אחוז מהיום")}</tr>
${hourRows}
</table>

<p style="color:#5a6676;margin-top:24px">מצורף קובץ CSV (נפתח באקסל) עם הפירוט המלא, כולל חלוקה לפי קטגוריה ושעה.</p>
</body></html>`;
}

const q = (v) => `"${String(v).replace(/"/g, '""')}"`;

export function renderCsv(report) {
  const lines = [];
  lines.push(`${q("תאריך")},${q(report.displayDate)}`);
  lines.push(`${q("סך הכל מצביעים")},${report.total}`);
  lines.push("");
  lines.push([q("קטגוריה"), q("הצבעות"), q("אחוז")].join(","));
  for (const t of report.byThreat) lines.push([q(t.name), t.votes, q(t.percent)].join(","));
  lines.push("");
  lines.push([q("שעה"), q("הצבעות"), q("אחוז מהיום")].join(","));
  for (const h of report.byHour) lines.push([q(h.label), h.votes, q(h.percent)].join(","));
  lines.push("");
  lines.push([q("קטגוריה \\ שעה"), ...report.hourKeys.map((h) => q(hourLabel(h)))].join(","));
  for (const t of report.byThreat) {
    lines.push([q(t.name), ...report.hourKeys.map((h) => report.matrix.get(`${t.id}|${h}`) || 0)].join(","));
  }
  return "﻿" + lines.join("\r\n");
}
