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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'Noto Naskh Arabic', 'Amiri', sans-serif", color: "#C8341B", fontSize: 16, background: "#F6F3EE" }}>
      خطأ في تحميل البيانات — يرجى تحديث الصفحة
    </div>
  );

  if (!sourceData) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'Noto Naskh Arabic', 'Amiri', sans-serif", flexDirection: "column", gap: 16, background: "#F6F3EE" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #C8341B", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6B6760", fontSize: 14 }}>جارٍ تحميل المحتوى...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return <LearningApp sourceData={sourceData} />;
}
