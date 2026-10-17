import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Maximize2 } from "lucide-react";
import { fetchRound, fetchCounts, fetchVotingWindow, castVote, resetRound, verifyAdminCode, subscribeToChanges } from "@/api/db";
import KioskScaler from "@/components/totem/KioskScaler";
import TotemHeader from "@/components/totem/TotemHeader";
import ThreatGrid from "@/components/totem/ThreatGrid";
import ResultsBoard from "@/components/totem/ResultsBoard";
import AdminModal from "@/components/totem/AdminModal";
import AdminHistoryModal from "@/components/totem/AdminHistoryModal";

import { THREATS } from "@/lib/threats";
import { DEFAULT_WINDOW, isWithinWindow, formatTime } from "@/lib/votingWindow";

// ערבוב אקראי של סדר המלבנים (מובטח שהסדר החדש שונה מהקודם)
function shuffleDifferent(order) {
  let next = order;
  for (let tries = 0; tries < 10 && next.join() === order.join(); tries++) {
    next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  }
  return next;
}

export default function Totem() {
  const [round, setRound] = useState(null);
  const [votingWindow, setVotingWindow] = useState(DEFAULT_WINDOW);
  const [order, setOrder] = useState(() => THREATS.map((t) => t.id));
  const [counts, setCounts] = useState(() => Object.fromEntries(THREATS.map((t) => [t.id, 0])));
  const [now, setNow] = useState(() => Date.now());
  const [flies, setFlies] = useState([]);
  const [highlights, setHighlights] = useState({});
  const [adminOpen, setAdminOpen] = useState(false);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [surveysList, setSurveysList] = useState([
    {
      id: 1,
      title: 'סקר איומים מרכזיים',
      date: '16/10/2026',
      duration: '4 שעות',
      status: 'active',
      results: [
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ב\'', votes: 25, percentage: 31 },
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ב\'', votes: 25, percentage: 31 },
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ב\'', votes: 25, percentage: 31 },
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ב\'', votes: 25, percentage: 31 },
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ב\'', votes: 25, percentage: 31 },
        { name: 'איום א\'', votes: 42, percentage: 52 },
        { name: 'איום ג\'', votes: 14, percentage: 17 }
      ]
    },
    {
      id: 2,
      title: 'סקר מוכנות שבוע שעבר',
      date: '09/10/2026',
      duration: '6 שעות',
      status: 'closed',
      results: [
        { name: 'תתרחיש 1', votes: 60, percentage: 60 },
        { name: 'תרחיש 2', votes: 40, percentage: 40 }
      ]
    }
  ]);

  const handleUpdateTitle = (surveyId, newTitle) => {
    setSurveysList((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, title: newTitle } : s))
    );
  };

  // טעינה, הרשמה לזמן אמת ורענון תקופתי — סנכרון מלא בין שלושת המסכים
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [rs, vc, vw] = await Promise.all([
          fetchRound(),
          fetchCounts(),
          fetchVotingWindow().catch(() => null),
        ]);
        if (!active) return;
        if (rs) setRound(rs);
        if (vw) setVotingWindow(vw);
        setCounts((prev) => {
          const next = { ...prev };
          vc.forEach((v) => { next[v.threat_id] = v.count || 0; });
          return next;
        });
      } catch (e) {
        console.error("טעינת הנתונים נכשלה", e);
      }
    };
    load();
    const unsubscribe = subscribeToChanges({
      onRound: load,
      onVote: (payload) => {
        const row = payload.new;
        if (payload.eventType === "UPDATE" && row && row.threat_id) {
          setCounts((c) => ({ ...c, [row.threat_id]: row.count }));
        } else {
          load();
        }
      },
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(load, 10000);
    return () => {
      active = false;
      unsubscribe();
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const isResults = round ? now >= new Date(round.reveal_at).getTime() : false;
  const isOpen = isWithinWindow(votingWindow, now);
  const totalVotes = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  const handleVote = (threatId, cardEl) => {
    if (isResults || !round || !isOpen) return;
    // עדכון מיידי לצורך החיווי, והרשמה במאגר המשותף לכל המסכים
    setCounts((c) => ({ ...c, [threatId]: (c[threatId] || 0) + 1 }));
    castVote(threatId).catch((e) => console.error("רישום ההצבעה נכשל", e));
    setOrder((o) => shuffleDifferent(o));

    setHighlights((h) => ({ ...h, [threatId]: true }));
    setTimeout(() => setHighlights((h) => ({ ...h, [threatId]: false })), 3000);

    try {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scale = canvasRect.width / 1080;
      const cardR = cardEl.getBoundingClientRect();
      const counterR = counterRef.current ? counterRef.current.getBoundingClientRect() : null;
      const toCanvas = (r) => ({
        x: (r.left + r.width / 2 - canvasRect.left) / scale,
        y: (r.top + r.height / 2 - canvasRect.top) / scale,
      });
      const start = toCanvas(cardR);
      const end = counterR ? toCanvas(counterR) : { x: 200, y: 230 };
      const id = `${Date.now()}-${Math.random()}`;
      setFlies((f) => [...f, { id, start, end }]);
      setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 1000);
    } catch (e) {
      /* אין צורך לעצור את ההצבעה במקרה של כשל חישוב מיקום */
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const handleReset = async (revealDate, code) => {
    if (revealDate.getTime() <= Date.now()) throw new Error("יש לבחור מועד חשיפה עתידי");
    try {
      await resetRound(code, revealDate);
    } catch (e) {
      throw new Error("האיפוס לא הושלם, נסו שוב");
    }
    setCounts(Object.fromEntries(THREATS.map((t) => [t.id, 0])));
    setRound({ reveal_at: revealDate.toISOString(), round_started_at: new Date().toISOString() });
  };

  return (
    <KioskScaler>
      <div
        ref={canvasRef}
        dir="rtl"
        className="relative h-full w-full select-none overflow-hidden bg-background text-foreground"
      >

        <div className="relative z-10 flex h-full w-full flex-col px-10 pb-16 pt-8">
          <TotemHeader isResults={isResults} targetMs={round ? new Date(round.reveal_at).getTime() : now} totalVotes={totalVotes} counterRef={counterRef} />
          {!round ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-ring" />
            </div>
          ) : isResults ? (
            <ResultsBoard counts={counts} totalVotes={totalVotes} />
          ) : (
            <ThreatGrid counts={counts} highlights={highlights} onVote={handleVote} order={order} closed={!isOpen} openTime={formatTime(votingWindow.open_time)} closeTime={formatTime(votingWindow.close_time)} />
          )}
        </div>

        {/* אנימציית "+1" מהכרטיסייה אל אייקון סך ההצבעות */}
        {flies.map((f) => (
          <motion.div
            key={f.id}
            className="pointer-events-none absolute z-40 font-heading text-[64px] font-extrabold text-foreground"
            style={{ left: f.start.x - 45, top: f.start.y - 45 }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ left: f.end.x - 45, top: f.end.y - 45, opacity: [1, 1, 0], scale: [1, 1.25, 0.55] }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            +1
          </motion.div>
        ))}

        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          aria-label="פתיחת ניהול המערכת"
          className="absolute bottom-5 left-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <KeyRound className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="מסך מלא"
          className="absolute bottom-5 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Maximize2 className="h-5 w-5" />
        </button>

        <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} onVerify={verifyAdminCode} onReset={handleReset} />
        <button
          type="button"
          onClick={() => setIsAdminModalOpen(true)}
          className="absolute bottom-5 left-20 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="היסטוריית סקרים וניהול"
        >
          📋
        </button>
        {/* רכיב חלון ההיסטוריה והאדמין */}
        <AdminHistoryModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onVerify={verifyAdminCode}
          surveysData={surveysList}
          onUpdateTitle={handleUpdateTitle}
        />
      </div>
    </KioskScaler>
  );
}