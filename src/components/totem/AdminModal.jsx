import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, CalendarClock } from "lucide-react";
import Numpad from "@/components/totem/Numpad";
import DateTimePicker from "@/components/totem/DateTimePicker";

export default function AdminModal({ open, onClose, round, onReset }) {
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("code");
      setCode("");
      setError("");
    }
  }, [open]);

  const submitCode = () => {
    if (round && code === round.admin_code) {
      setStep("reset");
    } else {
      setError("קוד שגוי, יש לנסות שנית");
      setCode("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-[820px] rounded-3xl border border-border bg-background p-10 text-foreground shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה וביטול"
              className="absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-8 w-8" />
            </button>

            {step === "code" ? (
              <React.Fragment>
                <div className="flex items-center gap-3">
                  <Lock className="h-9 w-9 text-foreground" />
                  <h2 className="font-heading text-4xl font-bold text-foreground">הזנת קוד מנהלת</h2>
                </div>
                <p className="mt-2 font-heading text-xl text-muted-foreground">הקלידו את הקוד הסודי לצורך איפוס המערכת</p>
                <div dir="ltr" className="mt-6 flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-16 w-14 rounded-xl border ${
                        i < code.length ? "border-ring bg-primary/30" : "border-border bg-card"
                      }`}
                    />
                  ))}
                </div>
                {error && <p className="mt-3 text-center font-heading text-xl text-destructive">{error}</p>}
                <Numpad value={code} onChange={(v) => { setCode(v); setError(""); }} onSubmit={submitCode} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-9 w-9 text-foreground" />
                  <h2 className="font-heading text-4xl font-bold text-foreground">איפוס והתחלת סבב חדש</h2>
                </div>
                <p className="mt-2 font-heading text-xl text-muted-foreground">
                  בחרו את מועד חשיפת התוצאות של הסבב הבא. באישור, הקולות יתאפסו בכל שלושת המסכים.
                </p>
                <DateTimePicker onConfirm={async (date) => { await onReset(date); onClose(); }} />
              </React.Fragment>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}