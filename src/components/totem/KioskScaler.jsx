import React, { useEffect, useState } from "react";

/**
 * מסגרת טוטם קבועה: בד 1080x1920 המוקטן בהתאם למסך,
 * כדי שהפריסה תהיה זהה בדיוק בכל שלושת המסכים.
 */
export default function KioskScaler({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () =>
      setScale(Math.min(window.innerWidth / 1080, window.innerHeight / 1920));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        style={{ width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: "center center" }}
        className="shrink-0"
      >
        {children}
      </div>
    </div>
  );
}