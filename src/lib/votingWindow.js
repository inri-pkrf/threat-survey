// שעות הפעילות של הסקר, תמיד לפי שעון ישראל (גם אם שעון המכשיר שונה).
export const TZ = "Asia/Jerusalem";
export const DEFAULT_WINDOW = { open_time: "07:30", close_time: "16:30" };

const toMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return Number(h) * 60 + Number(m || 0);
};

export function israelMinutes(ms = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return (get("hour") % 24) * 60 + get("minute");
}

export function isWithinWindow(win, ms = Date.now()) {
  const w = win || DEFAULT_WINDOW;
  const mins = israelMinutes(ms);
  return mins >= toMinutes(w.open_time) && mins < toMinutes(w.close_time);
}

export const formatTime = (t) => String(t).slice(0, 5);
