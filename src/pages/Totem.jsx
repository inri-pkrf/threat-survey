import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import KioskScaler from "@/components/totem/KioskScaler";
import TotemHeader from "@/components/totem/TotemHeader";
import ThreatGrid from "@/components/totem/ThreatGrid";
import ResultsBoard from "@/components/totem/ResultsBoard";
import AdminModal from "@/components/totem/AdminModal";
import { THREATS } from "@/lib/threats";

export default function Totem() {
  const [round, setRound] = useState(null);
  const [counts, setCounts] = useState(() => Object.fromEntries(THREATS.map((t) => [t.id, 0])));
  const [now, setNow] = useState(() => Date.now());
  const [flies, setFlies] = useState([]);
  const [highlights, setHighlights] = useState({});
  const [adminOpen, setAdminOpen] = useState(false);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);

  // טעינה, הרשמה לזמן אמת ורענון תקופתי — סנכרון מלא בין שלושת המסכים
  useEffect(() => {
    let active = true;
    const load = async () => {
      const rsRaw = await base44.entities.RoundState.list();
      const vcRaw = await base44.entities.VoteCount.filter({}, { limit: 20 });
      if (!active) return;
      const rs = Array.isArray(rsRaw) ? rsRaw : rsRaw.items || [];
      const vc = Array.isArray(vcRaw) ? vcRaw : vcRaw.items || [];
      if (rs.length) setRound(rs[0]);
      setCounts((prev) => {
        const next = { ...prev };
        vc.forEach((v) => { next[v.threat_id] = v.count || 0; });
        return next;
      });
    };
    load();
    const unsubRound = base44.entities.RoundState.subscribe(() => { load(); });
    const unsubVotes = base44.entities.VoteCount.subscribe((ev) => {
      if (ev.type === "update" && ev.data && ev.data.threat_id) {
        setCounts((c) => ({ ...c, [ev.data.threat_id]: ev.data.count }));
      } else {
        load();
      }
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(load, 10000);
    return () => {
      active = false;
      unsubRound();
      unsubVotes();
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const isResults = round ? now >= new Date(round.reveal_at).getTime() : false;
  const totalVotes = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  const handleVote = (threatId, cardEl) => {
    if (isResults || !round) return;
    // עדכון מיידי לצורך החיווי, והרשמה במאגר המשותף לכל המסכים
    setCounts((c) => ({ ...c, [threatId]: (c[threatId] || 0) + 1 }));
    base44.entities.VoteCount.updateMany({ threat_id: threatId }, { $inc: { count: 1 } });

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

  const handleReset = async (revealDate) => {
    await base44.entities.VoteCount.updateMany({ count: { $ne: 0 } }, { $set: { count: 0 } });
    const patch = {
      reveal_at: revealDate.toISOString(),
      round_started_at: new Date().toISOString(),
    };
    await base44.entities.RoundState.update(round.id, patch);
    setCounts(Object.fromEntries(THREATS.map((t) => [t.id, 0])));
    setRound((r) => (r ? { ...r, ...patch } : r));
  };

  return (
    <KioskScaler>
      <div
        ref={canvasRef}
        dir="rtl"
        className="relative h-full w-full select-none overflow-hidden bg-[#060d1a] text-white"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 45% at 50% -5%, rgba(56,110,190,0.30), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 105%, rgba(20,60,110,0.28), transparent 65%), radial-gradient(ellipse 40% 30% at 85% 40%, rgba(120,80,20,0.10), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex h-full w-full flex-col px-10 pb-16 pt-8">
          <TotemHeader isResults={isResults} targetMs={round ? new Date(round.reveal_at).getTime() : now} totalVotes={totalVotes} counterRef={counterRef} />
          {!round ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-amber-400" />
            </div>
          ) : isResults ? (
            <ResultsBoard counts={counts} totalVotes={totalVotes} />
          ) : (
            <ThreatGrid counts={counts} highlights={highlights} onVote={handleVote} />
          )}
        </div>

        {/* אנימציית "+1" מהכרטיסייה אל אייקון סך ההצבעות */}
        {flies.map((f) => (
          <motion.div
            key={f.id}
            className="pointer-events-none absolute z-40 font-heading text-[64px] font-extrabold text-amber-300 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]"
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
          className="absolute bottom-5 left-6 z-30 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-heading text-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          איפוס / סקר נוסף
        </button>

        <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} round={round} onReset={handleReset} />
      </div>
    </KioskScaler>
  );
}