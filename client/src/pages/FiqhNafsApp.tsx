import { useState, useEffect } from "react";
import LearningApp from "./LearningApp";
import type { SourceFile } from "@shared/schema";

interface ManifestEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  source_type: string;
  language: string;
  domain: string;
  unit_count: number;
  data_url: string;
}

const typeLabel: Record<string, string> = {
  video_series: "سلسلة فيديو",
  audio_series: "سلسلة صوتية",
  book: "كتاب",
  article_series: "سلسلة مقالات",
  course: "دورة",
  mixed: "متنوع",
};

const langLabel: Record<string, string> = { ar: "العربية", fr: "Français", en: "English", mixed: "متعدد" };

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'Noto Naskh Arabic', 'Amiri', sans-serif", flexDirection: "column", gap: 16, background: "#F6F3EE" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #C8341B", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6B6760", fontSize: 14 }}>جارٍ تحميل المحتوى...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function SourcePicker({ manifest, onSelect }: { manifest: ManifestEntry[]; onSelect: (entry: ManifestEntry) => void }) {
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EE", fontFamily: "'Noto Naskh Arabic', 'Amiri', sans-serif", direction: "rtl" }}>
      <div style={{ height: 2, background: "#C8341B" }} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#2B2A28", marginBottom: 8 }}>المكتبة التعليمية</h1>
          <p style={{ color: "#6B6760", fontSize: 14 }}>{manifest.length} مصدر متاح</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {manifest.map(entry => (
            <div
              key={entry.id}
              onClick={() => onSelect(entry)}
              onMouseEnter={() => setHov(entry.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: "#FBFAF7", border: "1px solid " + (hov === entry.id ? "#9C988F" : "#E6E1D7"),
                borderRadius: 18, padding: 24, cursor: "pointer",
                transform: hov === entry.id ? "translateY(-2px)" : "none",
                transition: "all .2s ease",
                boxShadow: hov === entry.id ? "0 2px 4px rgba(43,42,40,.04), 0 8px 24px rgba(43,42,40,.10)" : "0 1px 3px rgba(43,42,40,.05)",
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ background: "#C8341B", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, fontFamily: "'Geist Mono', monospace" }}>
                  {typeLabel[entry.source_type] ?? entry.source_type}
                </span>
                <span style={{ background: "#E7EAF2", color: "#24386B", fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 999, fontFamily: "'Geist Mono', monospace" }}>
                  {langLabel[entry.language] ?? entry.language}
                </span>
                <span style={{ background: "#EFEAE2", color: "#6B6760", fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 999, fontFamily: "'Geist Mono', monospace" }}>
                  {entry.domain}
                </span>
              </div>
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700, color: "#2B2A28", marginBottom: 6, lineHeight: 1.5 }}>{entry.title}</h2>
              <p style={{ fontSize: 12, color: "#6B6760", margin: "0 0 12px" }}>{entry.author}</p>
              <p style={{ fontSize: 13, color: "#6B6760", lineHeight: 1.7, margin: "0 0 16px" }}>{entry.description}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#9C988F", fontFamily: "'Geist Mono', monospace" }}>{entry.unit_count} وحدة</span>
                <span style={{ fontSize: 13, color: "#C8341B", fontWeight: 600 }}>ابدأ ←</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FiqhNafsApp() {
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<SourceFile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/sources-manifest.json")
      .then(r => r.json())
      .then((entries: ManifestEntry[]) => {
        setManifest(entries);
        if (entries.length === 1) setSelectedUrl(entries[0].data_url);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!selectedUrl) { setSourceData(null); return; }
    setSourceData(null);
    fetch(selectedUrl)
      .then(r => r.json())
      .then(setSourceData)
      .catch(() => setError(true));
  }, [selectedUrl]);

  if (error) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'Noto Naskh Arabic', 'Amiri', sans-serif", color: "#C8341B", fontSize: 16, background: "#F6F3EE" }}>
      خطأ في تحميل البيانات — يرجى تحديث الصفحة
    </div>
  );

  if (!manifest) return <Spinner />;
  if (!selectedUrl) return <SourcePicker manifest={manifest} onSelect={e => setSelectedUrl(e.data_url)} />;
  if (!sourceData) return <Spinner />;

  return (
    <LearningApp
      sourceData={sourceData}
      onBack={manifest.length > 1 ? () => setSelectedUrl(null) : undefined}
    />
  );
}
