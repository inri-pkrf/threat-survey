import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Lock, ChevronDown, ChevronUp, Pencil, Check, X, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import Numpad from "@/components/totem/Numpad";
import { listWeeks, weekLabel } from "@/lib/history";

export default function AdminHistoryModal({ isOpen, onClose, surveysData = [], onUpdateTitle, onUnlock, todayIso }) {
  const [historyStep, setHistoryStep] = useState("code");
  const [historyCode, setHistoryCode] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [editingSurveyId, setEditingSurveyId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [activeWeek, setActiveWeek] = useState(null);
  const [titleError, setTitleError] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const unlockingRef = useRef(false);

  const tabsContainerRef = useRef(null);

  // שבועות (ישן -> חדש). ברירת מחדל: השבוע האחרון
  const weeks = useMemo(() => listWeeks(surveysData, todayIso), [surveysData, todayIso]);
  const selectedWeek = activeWeek && weeks.includes(activeWeek) ? activeWeek : weeks[weeks.length - 1];
  const weekIndex = weeks.indexOf(selectedWeek);

  useEffect(() => {
    if (isOpen) {
      setHistoryStep("code");
      setHistoryCode("");
      setHistoryError("");
      setEditingSurveyId(null);
      setExpandedSurveyId(null);
      setActiveWeek(null);
      setTitleError("");
    }
  }, [isOpen]);

  // הטאב הנבחר נשאר בטווח הראייה
  useEffect(() => {
    const el = tabsContainerRef.current && tabsContainerRef.current.querySelector('[data-active="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selectedWeek, historyStep]);

  // הקוד נבדק בשרת (הפונקציה שטוענת את ההיסטוריה דורשת קוד מנהלת תקין)
  const submitHistoryCode = async (code = historyCode) => {
    if (code.length < 4 || unlockingRef.current) return;
    unlockingRef.current = true;
    let ok = false;
    try {
      ok = onUnlock ? await onUnlock(code) : false;
    } catch (e) {
      ok = false;
    }
    unlockingRef.current = false;
    if (ok) {
      setHistoryStep("history");
      setHistoryError("");
    } else {
      setHistoryError("קוד שגוי, יש לנסות שנית");
      setHistoryCode("");
    }
  };

  const handleSaveTitle = async (surveyId) => {
    if (!newTitle.trim() || savingTitle) return;
    setSavingTitle(true);
    setTitleError("");
    try {
      if (onUpdateTitle) await onUpdateTitle(surveyId, newTitle.trim());
      setEditingSurveyId(null);
    } catch (e) {
      setTitleError("שמירת השם נכשלה, נסו שוב");
    }
    setSavingTitle(false);
  };

  const goWeek = (delta) => {
    const next = weeks[weekIndex + delta];
    if (next) {
      setActiveWeek(next);
      setExpandedSurveyId(null);
      setEditingSurveyId(null);
      setTitleError("");
    }
  };

  const filteredSurveys = surveysData.filter((survey) => survey.week === selectedWeek);
  if (!isOpen) return null;

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col bg-background text-foreground overflow-hidden">
      
      {/* סרגל עליון עם כפתור חזרה וכותרת בלבד */}
      <div className="flex items-center justify-between px-10 py-6 border-b-2 border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="חזרה לסקר"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-background text-foreground transition-colors hover:bg-secondary shadow-sm font-heading font-bold text-lg"
          >
            <ArrowRight className="w-6 h-6" />
            חזרה לסקר
          </button>
          
          <div className="flex items-center gap-3 mr-4">
            <Lock className="w-8 h-8 text-foreground" />
            <h1 className="font-heading text-3xl font-bold">מסך ניהול והיסטוריית סקרים</h1>
          </div>
        </div>
      </div>

      {/* תוכן המסך המלא */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-hidden">
        {historyStep === "code" ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md w-full py-10">
            <div className="flex items-center gap-3 w-full justify-start mb-2">
              <Lock className="h-10 w-10 text-foreground" />
              <h2 className="font-heading text-4xl font-bold text-foreground">הזנת קוד מנהלת</h2>
            </div>
            <p className="font-heading text-xl text-muted-foreground w-full text-start mb-8">
              הקילידו את הקוד הסודי לצורך צפייה בהיסטוריית הסקרים
            </p>

            <div dir="ltr" className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-20 w-16 rounded-2xl border-2 flex items-center justify-center text-4xl font-bold ${
                    i < historyCode.length ? "border-ring bg-primary/30 text-foreground" : "border-border bg-card text-transparent"
                  }`}
                >
                  {i < historyCode.length ? "•" : ""}
                </div>
              ))}
            </div>

            {historyError && <p className="mb-4 text-center font-heading text-xl text-destructive font-bold">{historyError}</p>}
            
            <div className="w-full">
              <Numpad
                value={historyCode}
                onChange={(v) => {
                  setHistoryCode(v);
                  setHistoryError("");
                  if (v.length === 4) {
                    setTimeout(() => submitHistoryCode(v), 200);
                  }
                }}
                onSubmit={() => submitHistoryCode()}
              />
            </div>
          </div>
        ) : (
          /* אזור הניהול וההיסטוריה לאחר הזנת קוד */
          <div className="w-full flex-1 flex flex-col overflow-hidden">
            
            {/* שורת הטאבים: שבוע לכל טאב (ראשון עד שבת), עם חיצים למעבר בין שבועות */}
            <div className="w-full bg-card/80 border-b-2 border-border px-8 py-4 shrink-0 flex items-center gap-3">
              <button
                onClick={() => goWeek(-1)}
                disabled={weekIndex <= 0}
                className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-foreground shrink-0 shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="שבוע קודם"
                aria-label="שבוע קודם"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div
                ref={tabsContainerRef}
                className="flex-1 flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {weeks.map((week) => (
                  <button
                    key={week}
                    data-active={week === selectedWeek}
                    onClick={() => {
                      setActiveWeek(week);
                      setExpandedSurveyId(null);
                      setEditingSurveyId(null);
                      setTitleError("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-bold text-lg transition-all shrink-0 ${
                      week === selectedWeek ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-foreground border border-border hover:bg-secondary"
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span dir="ltr">{weekLabel(week)}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => goWeek(1)}
                disabled={weekIndex >= weeks.length - 1}
                className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-foreground shrink-0 shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="שבוע הבא"
                aria-label="שבוע הבא"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* רשימת הסקרים */}
            <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col overflow-hidden px-6 pt-8">
              <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-10">
                {filteredSurveys.length === 0 ? (
                  <p className="text-center font-heading text-2xl text-muted-foreground py-24">עדיין אין סקרים בשבוע זה.</p>
                ) : (
                  filteredSurveys.map((survey) => {
                    const isActive = survey.status === 'active';
                    const isExpanded = expandedSurveyId === survey.id;
                    const isEditing = editingSurveyId === survey.id;
                    const surveyResults = Array.isArray(survey.results)
                      ? [...survey.results].sort((a, b) => b.votes - a.votes)
                      : [];

                    return (
                      <div
                        key={survey.id}
                        className={`rounded-3xl border-2 transition-colors overflow-hidden ${
                          isActive ? 'border-primary/60 bg-primary/5 shadow-lg' : 'border-border bg-card/80'
                        }`}
                      >
                        {/* שורת הסקר הראשית */}
                        <div
                          onClick={() => setExpandedSurveyId(isExpanded ? null : survey.id)}
                          className="flex items-center justify-between gap-6 p-6 cursor-pointer select-none hover:bg-secondary/40 transition-colors"
                        >
                          <div className="w-40 shrink-0 text-right">
                            <div className="font-bold text-lg text-muted-foreground">{survey.date}</div>
                            {isActive && (
                              <span className="inline-block mt-1 px-3 py-1 bg-primary/20 text-primary rounded-full font-bold text-xs">
                                תוצאות ביניים
                              </span>
                            )}
                          </div>

                          <div className="flex-1 flex items-center gap-4 min-w-0 px-4" onClick={(e) => e.stopPropagation()}>
                            {isEditing ? (
                              <div className="flex items-center gap-3 w-full">
                                <input
                                  type="text"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  className="bg-background text-foreground px-4 py-2 rounded-2xl text-xl w-full border-2 border-ring focus:outline-none"
                                  autoFocus
                                  maxLength={120}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(survey.id); }}
                                />
                                <button
                                  onClick={() => handleSaveTitle(survey.id)}
                                  disabled={savingTitle}
                                  className="p-3 text-primary hover:bg-secondary rounded-2xl transition disabled:opacity-50"
                                >
                                  <Check className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={() => { setEditingSurveyId(null); setTitleError(""); }}
                                  className="p-3 text-destructive hover:bg-secondary rounded-2xl transition"
                                >
                                  <X className="w-6 h-6" />
                                </button>
                                {titleError && <span className="text-destructive font-bold text-base shrink-0">{titleError}</span>}
                              </div>
                            ) : (
                              <>
                                <span className="font-heading text-2xl font-bold truncate text-foreground">
                                  {survey.title}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingSurveyId(survey.id);
                                    setNewTitle(survey.title);
                                    setTitleError("");
                                  }}
                                  className="p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition shrink-0"
                                  title="ערוך שם סקר"
                                >
                                  <Pencil className="w-6 h-6" />
                                </button>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-base font-heading font-bold text-muted-foreground bg-secondary px-4 py-2 rounded-2xl">
                              {survey.total} הצבעות
                            </div>
                            <div className="p-3 text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-7 h-7" /> : <ChevronDown className="w-7 h-7" />}
                            </div>
                          </div>
                        </div>

                        {/* אקורדיון תוצאות מורחב */}
                        {isExpanded && (
                          <div className="px-8 pb-8 pt-4 border-t-2 border-border bg-background/60 space-y-3">
                            <div className="text-lg font-heading font-bold text-muted-foreground mb-3 pt-2">
                              תוצאות ההצבעה (לפי דירוג):
                            </div>
                            <div className="max-h-80 overflow-y-auto space-y-3 pl-2">
                              {surveyResults.length === 0 ? (
                                <p className="text-muted-foreground text-center py-6 text-lg">אין נתוני הצבעה לסקר זה.</p>
                              ) : (
                                surveyResults.map((res, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between text-lg py-3.5 px-6 bg-background rounded-2xl border border-border shadow-sm"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                      </span>
                                      <span className="font-heading font-bold text-foreground">{res.name}</span>
                                    </div>
                                    <div className="font-mono text-base font-extrabold text-muted-foreground">
                                      {res.votes} הצבעות ({res.percentage}%)
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}