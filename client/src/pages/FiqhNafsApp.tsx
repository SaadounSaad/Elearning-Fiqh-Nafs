import { useState, useEffect } from "react";
import LearningApp from "./LearningApp";
import type { SourceFile } from "@shared/schema";

export default function FiqhNafsApp() {
  const [sourceData, setSourceData] = useState<SourceFile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/fiqh-nafs-hashimi.json")
      .then(r => r.json())
      .then(setSourceData)
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Arial", color: "#E2001A", fontSize: 16 }}>
      خطأ في تحميل البيانات — يرجى تحديث الصفحة
    </div>
  );

  if (!sourceData) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "Arial", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #E2001A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#666", fontSize: 14 }}>جارٍ تحميل المحتوى...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return <LearningApp sourceData={sourceData} />;
}
