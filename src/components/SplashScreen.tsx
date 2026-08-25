import { useEffect, useState } from "react";
import "./splash-screen.css";

interface SplashScreenProps {
  onDone: () => void;
  minDurationMs?: number;
}

export default function SplashScreen({ onDone, minDurationMs = 1400 }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), minDurationMs);
    const doneTimer = setTimeout(() => onDone(), minDurationMs + 500);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [minDurationMs, onDone]);

  return (
    <div className={`splash ${exiting ? "splash-exit" : ""}`} role="status" aria-label="Memuat Atlas API">
      <div className="splash-hub perspective-root">
        <div className="splash-ring splash-ring-1" />
        <div className="splash-ring splash-ring-2" />
        <div className="splash-core">
          <span className="splash-core-dot" />
        </div>
      </div>
      <div className="splash-word mono">ATLAS API</div>
    </div>
  );
}
