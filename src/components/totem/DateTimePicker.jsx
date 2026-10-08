import React, { useEffect, useMemo, useState } from "react";
import { addDays, startOfDay } from "date-fns";
import DateStrip from "@/components/totem/DateStrip";
import TimeWheel from "@/components/totem/TimeWheel";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function DateTimePicker({ onConfirm }) {
  const [base] = useState(() => startOfDay(new Date()));
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(base, i)), [base]);
  const [dayIdx, setDayIdx] = useState(0);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const day = days[dayIdx];
  const chosen = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
  const past = chosen.getTime() <= Math.max(now, Date.now());
  const select = (setter) => (value) => { setter(value); setError(""); };
  const confirm = async () => {
    if (chosen.getTime() <= Date.now()) { setNow(Date.now()); return; }
    setSaving(true);
    setError("");
    try { await onConfirm(chosen); }
    catch (err) { setError(err.message || "האיפוס לא הושלם, נסו שוב"); }
    finally { setSaving(false); }
  };
  return (
    <div className="mt-6">
      <DateStrip days={days} selectedIndex={dayIdx} onSelect={select(setDayIdx)} />
      <h3 className="mt-6 text-center font-heading text-3xl font-bold text-foreground">בחרו שעה:</h3>
      <div dir="ltr" className="mt-3 flex items-center justify-center gap-5">
        <TimeWheel values={HOURS} value={hour} onChange={select(setHour)} label="שעות" />
        <span className="mt-8 font-heading text-5xl font-bold text-foreground">:</span>
        <TimeWheel values={MINUTES} value={minute} onChange={select(setMinute)} label="דקות" />
      </div>
      {(past || error) && <p role="alert" className="mt-3 text-center font-heading text-xl text-destructive">{past ? "המועד שנבחר כבר עבר, יש לבחור מועד עתידי" : error}</p>}
      <button type="button" disabled={past || saving} onClick={confirm} className="mt-6 w-full rounded-2xl bg-primary py-5 font-heading text-3xl font-extrabold text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
        {saving ? "מאפסים את הסקר..." : "אישור: איפוס הקולות והתחלת סקר חדש"}
      </button>
    </div>
  );
}