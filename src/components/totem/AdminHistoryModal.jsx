import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Lock, ChevronDown, ChevronUp, Pencil, Check, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import Numpad from "@/components/totem/Numpad";

export default function AdminHistoryModal({ isOpen, onClose, surveysData = [], onUpdateTitle }) {
  const [historyStep, setHistoryStep] = useState("code");
  const [historyCode, setHistoryCode] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [editingSurveyId, setEditingSurveyId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [activeTab, setActiveTab] = useState("all");

  const tabsContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHistoryStep("code");
      setHistoryCode("");
      setHistoryError("");
      setEditingSurveyId(null);
      setExpandedSurveyId(null);
      setActiveTab("all");
    }
  }, [isOpen]);

  const submitHistoryCode = () => {
    if (historyCode === '8341') {
      setHistoryStep("history");
      setHistoryError("");
    } else {
      setHistoryError("קוד שגוי, יש לנסות שנית");
      setHistoryCode("");
    }
  };

  const handleSaveTitle = (surveyId) => {
    if (!newTitle.trim()) return;
    if (onUpdateTitle) {
      onUpdateTitle(surveyId, newTitle);
    }
    setEditingSurveyId(null);
  };

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 250;
      tabsContainerRef.current.scrollBy({
        left: direction === 'right' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredSurveys = surveysData.filter((survey) => {
    if (activeTab === "all") return true;
    return survey.date === activeTab;
  });

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
                    setTimeout(() => {
                      if (v === '8341') {
                        setHistoryStep("history");
                        setHistoryError("");
                      } else {
                        setHistoryError("קוד שגוי, יש לנסות שנית");
                        setHistoryCode("");
                      }
                    }, 200);
                  }
                }}
                onSubmit={submitHistoryCode}
              />
            </div>
          </div>
        ) : (
          /* אזור הניהול וההיסטוריה לאחר הזנת קוד */
          <div className="w-full flex-1 flex flex-col overflow-hidden">
            
            {/* שורת הטאבים לרוחב כל המסך עם חיצי גלילה בצדדים */}
            <div className="w-full bg-card/80 border-b-2 border-border px-8 py-4 shrink-0 flex items-center gap-3">
              <button
                onClick={() => scrollTabs('right')}
                className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-foreground shrink-0 shadow-sm transition"
                title="גלול ימינה"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div 
                ref={tabsContainerRef}
                className="flex-1 flex gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-bold text-lg transition-all shrink-0 ${
                    activeTab === "all" ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-foreground border border-border hover:bg-secondary"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  כל הסקרים
                </button>

                {surveysData.map((survey) => (
                  <button
                    key={survey.id}
                    onClick={() => setActiveTab(survey.date)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-bold text-lg transition-all shrink-0 ${
                      activeTab === survey.date ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-foreground border border-border hover:bg-secondary"
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    שבוע {survey.date}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollTabs('left')}
                className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-foreground shrink-0 shadow-sm transition"
                title="גלול שמאלה"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* רשימת הסקרים */}
            <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col overflow-hidden px-6 pt-8">
              <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-10">
                {filteredSurveys.length === 0 ? (
                  <p className="text-center font-heading text-2xl text-muted-foreground py-24">אין סקרים להצגה תחת שבוע זה.</p>
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
                                />
                                <button
                                  onClick={() => handleSaveTitle(survey.id)}
                                  className="p-3 text-primary hover:bg-secondary rounded-2xl transition"
                                >
                                  <Check className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={() => setEditingSurveyId(null)}
                                  className="p-3 text-destructive hover:bg-secondary rounded-2xl transition"
                                >
                                  <X className="w-6 h-6" />
                                </button>
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
                              {survey.duration}
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