import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { SourceFile, Unit, Chunk, QuizQuestion } from "@shared/schema";

/* ═══════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════ */
const sw = 2, sl = "round";
const Ic = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Book: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  Quiz: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Star: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  StarO: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap={sl} strokeLinejoin={sl}><polyline points="20 6 9 17 4 12" /></svg>,
  Play: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  ArrowR: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  ArrowL: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  Bulb: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={sl} strokeLinejoin={sl}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  YouTube: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
};

/* ═══════════════════════════════════════════════════════
   COLORS & STYLES
   ═══════════════════════════════════════════════════════ */
const C = {
  red: "#E2001A", navy: "#003087", blue: "#0099D8",
  black: "#1A1A1A", gray: "#666666", bg: "#F0F2F5",
  border: "#DEE2E8", white: "#FFFFFF", cardBg: "#FFFFFF",
  green: "#16a34a", greenBg: "#f0fdf4", gold: "#f59e0b",
};

const S = {
  page: { direction: "rtl" as const, fontFamily: "'Segoe UI', Arial, 'Noto Naskh Arabic', sans-serif", minHeight: "100vh", background: C.bg, color: C.black, margin: 0, padding: 0 },
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" },
  card: { background: C.white, borderRadius: 16, border: "1px solid " + C.border, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  heroGrad: { background: "linear-gradient(135deg, #001a4d 0%, #003087 60%, #002266 100%)", borderRadius: 20, padding: "32px 28px", marginBottom: 24, position: "relative" as const, overflow: "hidden" },
  btn: (bg: string, color: string) => ({ background: bg, color, border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit" }),
  badge: (bg: string, color: string) => ({ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block" }),
};

const typeLabel: Record<string, string> = {
  definition: "تعريف مفهوم",
  comprehension: "فهم واستيعاب",
  key_point: "نقطة رئيسية",
  application: "تطبيق عملي",
};
const typeColor: Record<string, string> = {
  definition: "#003087",
  comprehension: "#0099D8",
  key_point: "#E2001A",
  application: "#16a34a",
};

/* ═══════════════════════════════════════════════════════
   HELPERS — reconstruct per-unit tab data from chunks
   ═══════════════════════════════════════════════════════ */

interface UnitTabData {
  objectives: string[];
  concepts: Array<{ term: string; definition: string }>;
  sections: Array<{ heading: string; content: string }>;
  keyPoints: string[];
  applications: string[];
  wordCount: number;
  difficultyLevel: string;
}

function buildTabData(unit: Unit, chunks: Chunk[]): UnitTabData {
  const unitChunks = chunks.filter(c => c.unit_id === unit.id).sort((a, b) => a.order - b.order);

  const objectives: string[] = [];
  const concepts: Array<{ term: string; definition: string }> = [];
  const sections: Array<{ heading: string; content: string }> = [];
  const keyPoints: string[] = [];
  const applications: string[] = [];

  let currentHeading = "";

  for (const chunk of unitChunks) {
    if (chunk.type === "question" && (chunk.meta as Record<string, unknown>)?.subtype === "objective") {
      objectives.push(chunk.content);
    } else if (chunk.type === "definition") {
      const meta = chunk.meta as Record<string, unknown>;
      concepts.push({
        term: (meta?.term as string) ?? chunk.content.split(":")[0].trim(),
        definition: (meta?.definition as string) ?? chunk.content.split(":").slice(1).join(":").trim(),
      });
    } else if (chunk.type === "heading") {
      currentHeading = chunk.content;
    } else if (chunk.type === "text" && (chunk.meta as Record<string, unknown>)?.subtype === "practical_application") {
      applications.push(chunk.content);
    } else if (chunk.type === "text") {
      sections.push({ heading: currentHeading, content: chunk.content });
      currentHeading = "";
    } else if (chunk.type === "summary") {
      keyPoints.push(chunk.content);
    }
  }

  return {
    objectives,
    concepts,
    sections,
    keyPoints,
    applications,
    wordCount: (unit.meta as Record<string, unknown>)?.word_count as number ?? 0,
    difficultyLevel: (unit.meta as Record<string, unknown>)?.difficulty_level as string ?? "intermediate",
  };
}

/* ═══════════════════════════════════════════════════════
   PROGRESS SECTIONS
   ═══════════════════════════════════════════════════════ */
const PROGRESS_SECTIONS = ["objectives", "concepts", "content", "keyPoints", "applications"] as const;
type ProgressSection = typeof PROGRESS_SECTIONS[number];
type UnitProgress = Partial<Record<ProgressSection, boolean>>;

/* ═══════════════════════════════════════════════════════
   UNIT CARD
   ═══════════════════════════════════════════════════════ */
function UnitCard({ unit, chunks, nav, gp, togFav, favs }: {
  unit: Unit;
  chunks: Chunk[];
  nav: (page: string, unit?: Unit) => void;
  gp: (id: string) => number;
  togFav: (id: string) => void;
  favs: string[];
}) {
  const prog = gp(unit.id);
  const isFav = favs.includes(unit.id);
  const data = useMemo(() => buildTabData(unit, chunks), [unit, chunks]);
  const lvlC: Record<string, string> = { beginner: C.blue, intermediate: C.red, advanced: C.navy };
  const lvlL: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
  const [hov, setHov] = useState(false);
  const originalId = (unit.meta as Record<string, unknown>)?.original_module_id as string ?? unit.order.toString().padStart(3, "0");

  return (
    <div
      onClick={() => nav("unit", unit)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...S.card, padding: 18, cursor: "pointer", transform: hov ? "translateY(-2px)" : "none", transition: "all .2s ease", boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={S.badge(C.red, "#fff")}>{originalId}</span>
          <span style={S.badge(lvlC[data.difficultyLevel] + "22", lvlC[data.difficultyLevel])}>{lvlL[data.difficultyLevel] ?? "متوسط"}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); togFav(unit.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: isFav ? "#fbbf24" : C.border, padding: 4 }}>
          {isFav ? <Ic.Star /> : <Ic.StarO />}
        </button>
      </div>
      <h3 style={{ fontWeight: 700, color: C.black, fontSize: 14, marginBottom: 10, lineHeight: 1.6 }}>{unit.title}</h3>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.gray, marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Ic.Bulb /> {data.concepts.length}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Ic.Clock /> {data.wordCount}</span>
      </div>
      {prog > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginBottom: 4 }}>
            <span>التقدم</span><span>{prog}%</span>
          </div>
          <div style={{ height: 5, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", background: prog === 100 ? C.green : C.red, borderRadius: 4, width: prog + "%" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════ */
function Home({ source, units, chunks, nav, doneCount, totalConcepts, getProgress, favorites, togFav }: {
  source: SourceFile["source"];
  units: Unit[];
  chunks: Chunk[];
  nav: (page: string, unit?: Unit) => void;
  doneCount: number;
  totalConcepts: number;
  getProgress: (id: string) => number;
  favorites: string[];
  togFav: (id: string) => void;
}) {
  const inProg = units.find(u => { const p = getProgress(u.id); return p > 0 && p < 100; });
  return (
    <div>
      <div style={S.heroGrad}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(226,0,26,0.08)" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <span style={S.badge(C.red, "#fff")}>{units.length} {units[0]?.label ?? "وحدة"}</span>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: "14px 0 8px", lineHeight: 1.4 }}>{source.title}</h1>
          {source.description && <p style={{ color: "#a0bfee", fontSize: 15, marginBottom: 22, maxWidth: 550, lineHeight: 1.8 }}>{source.description}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button onClick={() => nav("units")} style={S.btn(C.red, "#fff")}><Ic.Play /> ابدأ التعلم</button>
            {inProg && <button onClick={() => nav("unit", inProg)} style={S.btn("rgba(255,255,255,0.12)", "#fff")}><Ic.ArrowR /> استكمل</button>}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[[doneCount + "/" + units.length, "وحدات مكتملة", C.red, "#fef2f2", Ic.Book], [totalConcepts, "المفاهيم الكلية", C.navy, "#eff6ff", Ic.Bulb], [favorites.length, "المفضلة", C.blue, "#f0f9ff", Ic.Star], [Math.round(doneCount / units.length * 100) + "%", "نسبة الإنجاز", C.red, "#fef2f2", Ic.Target]].map(([val, lbl, clr, bg, Icon]: any, i) => (
          <div key={i} style={{ ...S.card, padding: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, color: clr, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Icon /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: clr }}>{val}</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.black, margin: 0 }}>آخر الوحدات</h2>
        <button onClick={() => nav("units")} style={{ background: "none", border: "none", color: C.red, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>عرض الكل <Ic.ArrowR /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
        {units.slice(0, 6).map(u => <UnitCard key={u.id} unit={u} chunks={chunks} nav={nav} gp={getProgress} togFav={togFav} favs={favorites} />)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   UNITS LIST PAGE
   ═══════════════════════════════════════════════════════ */
function UnitsList({ source, units, chunks, searchQ, setSearchQ, getProgress, togFav, favorites, nav }: {
  source: SourceFile["source"];
  units: Unit[];
  chunks: Chunk[];
  searchQ: string;
  setSearchQ: (q: string) => void;
  getProgress: (id: string) => number;
  togFav: (id: string) => void;
  favorites: string[];
  nav: (page: string, unit?: Unit) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [lvlF, setLvlF] = useState("all");
  const [shown, setShown] = useState(12);

  const list = useMemo(() => {
    let r = units;
    if (filter === "favorites") r = r.filter(u => favorites.includes(u.id));
    if (filter === "done") r = r.filter(u => getProgress(u.id) === 100);
    if (filter === "doing") r = r.filter(u => { const p = getProgress(u.id); return p > 0 && p < 100; });
    if (filter === "new") r = r.filter(u => getProgress(u.id) === 0);
    if (lvlF !== "all") r = r.filter(u => (u.meta as Record<string, unknown>)?.difficulty_level === lvlF);
    return r;
  }, [units, filter, lvlF, favorites, getProgress]);

  const fBtn = (id: string, lbl: string, active: boolean) => (
    <button key={id} onClick={() => setFilter(id)} style={{ padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: active ? "none" : "1px solid " + C.border, background: active ? C.red : C.white, color: active ? "#fff" : C.gray, cursor: "pointer", fontFamily: "inherit" }}>{lbl}</button>
  );

  return (
    <div>
      <div style={S.heroGrad}>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{source.title}</h1>
        <p style={{ color: "#a0bfee", fontSize: 13, marginBottom: 14 }}>{units.length} {units[0]?.label ?? "وحدة"}</p>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="ابحث بالعنوان..."
          style={{ maxWidth: 450, width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.12)", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", outline: "none", fontSize: 13, fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {[["all", "الكل"], ["favorites", "المفضلة"], ["doing", "قيد التقدم"], ["done", "مكتملة"], ["new", "لم تبدأ"]].map(([id, lbl]) => fBtn(id, lbl, filter === id))}
        <div style={{ flex: 1 }} />
        {[["all", "كل المستويات"], ["beginner", "مبتدئ"], ["intermediate", "متوسط"], ["advanced", "متقدم"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setLvlF(id)} style={{ padding: "6px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, border: lvlF === id ? "none" : "1px solid " + C.border, background: lvlF === id ? C.navy : C.white, color: lvlF === id ? "#fff" : C.gray, cursor: "pointer", fontFamily: "inherit" }}>{lbl}</button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.gray, marginBottom: 14 }}>{list.length} وحدة{searchQ ? ` — "${searchQ}"` : ""}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 20 }}>
        {list.slice(0, shown).map(u => <UnitCard key={u.id} unit={u} chunks={chunks} nav={nav} gp={getProgress} togFav={togFav} favs={favorites} />)}
      </div>
      {shown < list.length && (
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShown(s => s + 12)} style={S.btn(C.white, C.navy)}>عرض المزيد ({list.length - shown})</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   UNIT DETAIL PAGE
   ═══════════════════════════════════════════════════════ */
function UnitDetail({ unit, units, chunks, nav, saveProg, progress, togFav, favorites }: {
  unit: Unit;
  units: Unit[];
  chunks: Chunk[];
  nav: (page: string, unit?: Unit) => void;
  saveProg: (id: string, section: ProgressSection) => void;
  progress: Record<string, UnitProgress>;
  togFav: (id: string) => void;
  favorites: string[];
}) {
  const [tab, setTab] = useState<ProgressSection>("objectives");
  const isFav = favorites.includes(unit.id);
  const p = progress[unit.id] ?? {};
  const data = useMemo(() => buildTabData(unit, chunks), [unit, chunks]);
  const idx = units.findIndex(u => u.id === unit.id);
  const prev = idx > 0 ? units[idx - 1] : null;
  const next = idx < units.length - 1 ? units[idx + 1] : null;
  const originalId = (unit.meta as Record<string, unknown>)?.original_module_id as string ?? unit.order.toString().padStart(3, "0");
  const lvlL: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };

  const tabs: [ProgressSection, string, () => React.ReactElement][] = [
    ["objectives", "أهداف التعلم", Ic.Target],
    ["concepts", "المفاهيم الأساسية", Ic.Bulb],
    ["content", "المحتوى المنظم", Ic.Book],
    ["keyPoints", "النقاط الرئيسية", Ic.Star],
    ["applications", "التطبيقات العملية", Ic.Check],
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 6, fontSize: 13, color: C.gray, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => nav("home")} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>الرئيسية</button>
        <span>/</span>
        <button onClick={() => nav("units")} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>الوحدات</button>
        <span>/</span>
        <span style={{ color: C.black, fontWeight: 600 }}>{unit.label} {originalId}</span>
      </div>

      {/* Header */}
      <div style={S.heroGrad}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={S.badge(C.red, "#fff")}>{unit.label} {originalId}</span>
          <span style={S.badge("rgba(255,255,255,0.12)", "#a0bfee")}>{lvlL[data.difficultyLevel] ?? "متوسط"}</span>
          <button onClick={() => togFav(unit.id)} style={{ marginRight: "auto", background: "none", border: "none", cursor: "pointer", color: isFav ? "#fbbf24" : "rgba(255,255,255,0.35)", padding: 4 }}>
            {isFav ? <Ic.Star /> : <Ic.StarO />}
          </button>
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.5 }}>{unit.title}</h1>
        <div style={{ display: "flex", gap: 16, color: "#a0bfee", fontSize: 13, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic.Bulb /> {data.concepts.length} مفاهيم</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic.Clock /> {data.wordCount} كلمة</span>
          {unit.media_url && (
            <button onClick={() => window.open(unit.media_url, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,0,0,0.15)", border: "1px solid rgba(255,0,0,0.3)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,0,0,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,0,0,0.15)")}>
              <Ic.YouTube /><span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>مشاهدة الفيديو</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...S.card, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid " + C.border }}>
          {tabs.map(([id, lbl, Icon]) => (
            <button key={id} onClick={() => { setTab(id); saveProg(unit.id, id); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 18px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", border: "none", cursor: "pointer", fontFamily: "inherit", borderBottom: tab === id ? "3px solid " + C.red : "3px solid transparent", background: tab === id ? "#fef2f2" : C.white, color: tab === id ? C.red : C.gray }}>
              <Icon />{lbl}
              {p[id] && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />}
            </button>
          ))}
        </div>
        <div style={{ padding: "24px 28px" }}>
          {tab === "objectives" && data.objectives.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 10, background: C.bg, borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid " + C.border }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.red, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ color: C.black, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{o}</p>
            </div>
          ))}
          {tab === "concepts" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {data.concepts.map((c, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "2px solid " + C.border }}>
                  <div style={{ background: C.navy, padding: "10px 16px" }}><h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{c.term}</h4></div>
                  <div style={{ padding: "12px 16px", background: C.white }}><p style={{ color: C.gray, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{c.definition}</p></div>
                </div>
              ))}
            </div>
          )}
          {tab === "content" && data.sections.map((sec, i) => (
            <div key={i}>
              <p style={{ color: C.black, fontSize: 14, lineHeight: 2, background: C.bg, borderRadius: 12, padding: 18, border: "1px solid " + C.border, marginBottom: 14 }}>{sec.content}</p>
            </div>
          ))}
          {tab === "keyPoints" && data.keyPoints.map((pt, i) => (
            <div key={i} style={{ display: "flex", gap: 10, background: "#fffbeb", borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #fde68a" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, marginTop: 8, flexShrink: 0 }} />
              <p style={{ color: C.black, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{pt}</p>
            </div>
          ))}
          {tab === "applications" && data.applications.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, background: C.greenBg, borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #bbf7d0" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic.Check /></div>
              <p style={{ color: C.black, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {prev ? <button onClick={() => { nav("unit", prev); setTab("objectives"); }} style={{ ...S.btn(C.white, C.navy), border: "1px solid " + C.border }}>السابق <Ic.ArrowR /></button> : <div />}
        <button onClick={() => nav("quiz_direct", unit)} style={{ ...S.btn(C.gold, C.navy), fontWeight: 700, fontSize: 15, padding: "10px 24px", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📝</span> ابدأ الاختبار
        </button>
        {next ? <button onClick={() => { nav("unit", next); setTab("objectives"); }} style={S.btn(C.red, "#fff")}><Ic.ArrowL /> التالي</button> : <div />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   QUIZ
   ═══════════════════════════════════════════════════════ */
function Quiz({ units, quizQuestions, nav, quizScores, saveQuiz, directUnit }: {
  units: Unit[];
  quizQuestions: QuizQuestion[];
  nav: (page: string, unit?: Unit) => void;
  quizScores: Record<string, number>;
  saveQuiz: (id: string, score: number) => void;
  directUnit?: Unit;
}) {
  const [qUnit, setQUnit] = useState<Unit | null>(directUnit ?? null);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [ans, setAns] = useState(false);
  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [started, setStarted] = useState(directUnit ? false : false);
  const [answers, setAnswers] = useState<Array<{ isCorrect: boolean }>>([]);

  const hasDedicated = (uid: string) => quizQuestions.some(q => q.unit_id === uid);

  const start = (u: Unit) => {
    const dedicated = quizQuestions.filter(q => q.unit_id === u.id);
    setQUnit(u); setQi(0); setSel(null); setDone(false); setScore(0); setAns(false); setAnswers([]);
    if (dedicated.length > 0) {
      setQs(dedicated); setStarted(false);
    } else {
      setQs([]); setStarted(true);
    }
  };

  const isDedicated = quizQuestions.some(q => qUnit && q.unit_id === qUnit.id);

  const pick = (i: number) => {
    if (ans || !qs[qi]) return;
    setSel(i); setAns(true);
    const isCorrect = i === qs[qi].correct;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(a => [...a, { isCorrect }]);
  };

  const nxt = () => {
    if (qi < qs.length - 1) { setQi(q => q + 1); setSel(null); setAns(false); }
    else { setDone(true); if (qUnit) saveQuiz(qUnit.id, Math.round(score / qs.length * 100)); }
  };

  if (!qUnit) return (
    <div>
      <div style={S.heroGrad}>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>الاختبارات</h1>
        <p style={{ color: "#a0bfee", fontSize: 13 }}>اختبر فهمك — اختر وحدة</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
        {units.map(u => {
          const originalId = (u.meta as Record<string, unknown>)?.original_module_id as string ?? u.order.toString().padStart(3, "0");
          return (
            <div key={u.id} style={{ ...S.card, padding: 18, border: hasDedicated(u.id) ? "2px solid " + C.red : "1px solid " + C.border }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={S.badge(C.red, "#fff")}>{originalId}</span>
                {hasDedicated(u.id) && <span style={S.badge("#fef2f2", C.red)}>اختبار مخصص</span>}
                {quizScores[u.id] != null && <span style={S.badge(quizScores[u.id] >= 70 ? "#dcfce7" : "#fef2f2", quizScores[u.id] >= 70 ? "#166534" : "#991b1b")}>{quizScores[u.id]}%</span>}
              </div>
              <h3 style={{ fontWeight: 700, color: C.black, fontSize: 13, marginBottom: 8, lineHeight: 1.6, height: 42, overflow: "hidden" }}>{u.title}</h3>
              <p style={{ fontSize: 12, color: C.gray, marginBottom: 12 }}>{quizQuestions.filter(q => q.unit_id === u.id).length || "—"} أسئلة</p>
              <button onClick={() => start(u)} style={{ ...S.btn(C.navy, "#fff"), width: "100%", justifyContent: "center", fontSize: 13, padding: "9px 16px" }}>
                {quizScores[u.id] != null ? "إعادة" : "ابدأ"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isDedicated && !started) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ ...S.heroGrad, borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 16 }}>
            {qUnit.label} {(qUnit.meta as Record<string, unknown>)?.original_module_id as string}
          </div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.6 }}>{qUnit.title}</h1>
          <p style={{ color: "#a0bfee", fontSize: 14, margin: "0 0 24px", lineHeight: 1.7 }}>{qs.length} سؤالاً</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            {Object.entries(typeLabel).map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: typeColor[k] + "22", color: "#fff", fontWeight: 600, border: "1px solid " + (typeColor[k] ?? "#999") + "44" }}>{v}</span>
            ))}
          </div>
          <button onClick={() => setStarted(true)} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ابدأ الاختبار
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round(score / qs.length * 100);
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ ...S.card, padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "📚"}</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: C.black, marginBottom: 8 }}>النتيجة: {pct}%</h2>
          <p style={{ color: C.gray, marginBottom: 24 }}>{score} من {qs.length} إجابات صحيحة</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setQi(0); setSel(null); setAns(false); setScore(0); setDone(false); setAnswers([]); setStarted(true); }} style={S.btn(C.red, "#fff")}>إعادة</button>
            <button onClick={() => setQUnit(null)} style={{ ...S.btn(C.white, C.navy), border: "1px solid " + C.border }}>اختبار آخر</button>
          </div>
        </div>
      </div>
    );
  }

  const q = qs[qi];
  if (!q) return null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", background: C.red, borderRadius: 4, width: ((qi + 1) / qs.length * 100) + "%", transition: "width .3s" }} />
      </div>
      <div style={{ ...S.card, padding: "24px 28px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.black, marginBottom: 20, lineHeight: 1.7 }}>{q.question}</h2>
        {q.options.map((opt, i) => {
          const isC = i === q.correct, isS = i === sel;
          let bg = C.white, brd = C.border, clr = C.black, fw: number | string = 400;
          if (ans) {
            if (isC) { bg = C.greenBg; brd = C.green; clr = "#166534"; fw = 600; }
            else if (isS) { bg = "#fef2f2"; brd = "#ef4444"; clr = "#991b1b"; fw = 600; }
            else { clr = "#aaa"; }
          } else if (isS) { bg = "#eff6ff"; brd = C.navy; clr = C.navy; fw = 600; }
          return (
            <button key={i} onClick={() => pick(i)} disabled={ans}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "right", padding: 14, marginBottom: 8, borderRadius: 12, border: "2px solid " + brd, background: bg, color: clr, cursor: ans ? "default" : "pointer", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", boxSizing: "border-box", fontWeight: fw, transition: "all .2s ease" }}>
              <span style={{ minWidth: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: ans ? (isC ? C.green : isS ? "#ef4444" : "#e5e7eb") : (isS ? C.navy : "#e5e7eb"), color: ans ? ((isC || isS) ? "#fff" : "#999") : (isS ? "#fff" : "#999") }}>
                {ans ? (isC ? "✓" : isS ? "✗" : String.fromCharCode(1571 + i)) : String.fromCharCode(1571 + i)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
        {ans && q.explanation && (
          <div style={{ background: sel === q.correct ? "#f0fdf4" : "#fffbeb", borderRadius: 12, padding: "14px 16px", marginTop: 16, borderRight: "4px solid " + (sel === q.correct ? C.green : "#f59e0b") }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: sel === q.correct ? C.green : "#b45309", margin: "0 0 6px" }}>{sel === q.correct ? "إجابة صحيحة! ✓" : "إجابة خاطئة — التصحيح:"}</p>
            <p style={{ fontSize: 13, color: C.black, margin: 0, lineHeight: 1.8 }}>{q.explanation}</p>
          </div>
        )}
        {ans && <button onClick={nxt} style={{ ...S.btn(C.red, "#fff"), width: "100%", justifyContent: "center", marginTop: 12 }}>
          {qi < qs.length - 1 ? "السؤال التالي" : "عرض النتيجة"}
        </button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROGRESS PAGE
   ═══════════════════════════════════════════════════════ */
function ProgressPage({ units, doneCount, getProgress, quizScores, favorites, totalConcepts }: {
  units: Unit[];
  doneCount: number;
  getProgress: (id: string) => number;
  quizScores: Record<string, number>;
  favorites: string[];
  totalConcepts: number;
}) {
  const tot = Math.round(units.reduce((a, u) => a + getProgress(u.id), 0) / units.length);
  const qv = Object.values(quizScores);
  const avgQ = qv.length > 0 ? Math.round(qv.reduce((a, b) => a + b, 0) / qv.length) : 0;
  const lvls = units.reduce<Record<string, number>>((a, u) => {
    const l = (u.meta as Record<string, unknown>)?.difficulty_level as string ?? "intermediate";
    a[l] = (a[l] ?? 0) + 1; return a;
  }, {});

  return (
    <div>
      <div style={S.heroGrad}>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>لوحة التقدم</h1>
        <p style={{ color: "#a0bfee", fontSize: 13 }}>تتبع مسيرتك التعليمية</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[[tot + "%", "نسبة الإنجاز", doneCount + " من " + units.length, C.red], [avgQ + "%", "متوسط الاختبارات", Object.keys(quizScores).length + " اختبار", C.navy], [totalConcepts, "المفاهيم", "مفهوم", C.blue], [favorites.length, "المفضلة", "وحدة", C.red]].map(([v, l, s, c], i) => (
          <div key={i} style={{ ...S.card, padding: 18 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c as string }}>{v}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.black, marginTop: 3 }}>{l}</div>
            <div style={{ fontSize: 11, color: C.gray }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, color: C.black, marginBottom: 12, fontSize: 15 }}>التقدم العام</h3>
        <div style={{ height: 12, background: "#e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", background: C.red, borderRadius: 8, width: tot + "%", transition: "width .7s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.gray }}>
          <span>{doneCount} مكتمل</span><span>{units.length - doneCount} متبقي</span>
        </div>
      </div>
      <div style={{ ...S.card, padding: 20 }}>
        <h3 style={{ fontWeight: 700, color: C.black, marginBottom: 12, fontSize: 15 }}>توزيع المستويات</h3>
        {[["مبتدئ", lvls.beginner ?? 0, C.blue], ["متوسط", lvls.intermediate ?? 0, C.red], ["متقدم", lvls.advanced ?? 0, C.navy]].map(([l, n, c], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.gray, width: 42, textAlign: "right" }}>{l}</span>
            <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: c as string, width: ((n as number) / units.length * 100) + "%" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.black, width: 26 }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HOOK — état persisté dans localStorage
   ═══════════════════════════════════════════════════════ */
function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota dépassé ou mode privé — on ignore silencieusement
    }
  }, [key, value]);

  return [value, setValue];
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */
interface LearningAppProps {
  sourceData: SourceFile;
}

export default function LearningApp({ sourceData }: LearningAppProps) {
  const { source, units, chunks, quiz_questions } = sourceData;

  const [page, setPage] = useState("home");
  const [selUnit, setSelUnit] = useState<Unit | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [progress, setProgress] = useLocalStorage<Record<string, UnitProgress>>(`learning:${source.id}:progress`, {});
  const [favorites, setFavorites] = useLocalStorage<string[]>(`learning:${source.id}:favorites`, []);
  const [quizScores, setQuizScores] = useLocalStorage<Record<string, number>>(`learning:${source.id}:quizScores`, {});

  const nav = useCallback((p: string, u?: Unit) => {
    setPage(p); if (u !== undefined) setSelUnit(u); setMenuOpen(false); setSearchOpen(false);
  }, []);
  const saveProg = useCallback((uid: string, sec: ProgressSection) => setProgress(p => ({ ...p, [uid]: { ...(p[uid] ?? {}), [sec]: true } })), []);
  const togFav = useCallback((uid: string) => setFavorites(f => f.includes(uid) ? f.filter(x => x !== uid) : [...f, uid]), []);
  const saveQuiz = useCallback((uid: string, sc: number) => setQuizScores(q => ({ ...q, [uid]: sc })), []);
  const getProgress = useCallback((uid: string) => {
    const p = progress[uid]; if (!p) return 0;
    return Math.round(PROGRESS_SECTIONS.filter(s => p[s]).length / PROGRESS_SECTIONS.length * 100);
  }, [progress]);

  const doneCount = useMemo(() => units.filter(u => getProgress(u.id) === 100).length, [units, getProgress]);
  const totalConcepts = useMemo(() => chunks.filter(c => c.type === "definition").length, [chunks]);

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return units;
    const q = searchQ.trim();
    return units.filter(u => u.title.includes(q) || String((u.meta as Record<string, unknown>)?.original_module_id ?? "").includes(q));
  }, [units, searchQ]);

  const sp = { nav, progress, saveProg, favorites, togFav, quizScores, saveQuiz, getProgress, doneCount, totalConcepts };
  const navItems: [string, string, () => React.ReactElement][] = [
    ["home", "الرئيسية", Ic.Home],
    ["units", "الوحدات", Ic.Book],
    ["quiz", "الاختبارات", Ic.Quiz],
    ["progress", "التقدم", Ic.Chart],
  ];

  return (
    <div style={S.page}>
      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.navy, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ height: 3, background: C.red }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <button onClick={() => nav("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{source.title.charAt(0)}</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{source.title}</div>
              <div style={{ color: C.blue, fontSize: 10 }}>{units.length} {units[0]?.label ?? "وحدة"}</div>
            </div>
          </button>
          <div className="desk-nav" style={{ display: "flex", gap: 4 }}>
            {navItems.map(([id, lbl, Icon]) => (
              <button key={id} onClick={() => nav(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: page === id ? C.red : "transparent", color: page === id ? "#fff" : "#a0bfee" }}>
                <Icon /><span>{lbl}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ padding: 8, background: "none", border: "none", cursor: "pointer", color: "#a0bfee" }}><Ic.Search /></button>
            <button className="mob-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ padding: 8, background: "none", border: "none", cursor: "pointer", color: "#a0bfee", display: "none" }}>{menuOpen ? <Ic.X /> : <Ic.Menu />}</button>
          </div>
        </div>
        {searchOpen && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "#002266", padding: "10px 16px" }}>
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") nav("units"); }}
                placeholder="ابحث في الوحدات..." style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.12)", color: "#fff", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>
        )}
        {menuOpen && (
          <div className="mob-menu" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "#002266", padding: "8px 16px" }}>
            {navItems.map(([id, lbl, Icon]) => (
              <button key={id} onClick={() => nav(id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: page === id ? C.red : "transparent", color: page === id ? "#fff" : "#a0bfee", marginBottom: 4, textAlign: "right" }}>
                <Icon />{lbl}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* PAGE */}
      <main style={S.wrap}>
        {page === "home" && <Home source={source} units={units} chunks={chunks} {...sp} />}
        {page === "units" && <UnitsList source={source} units={filtered} chunks={chunks} searchQ={searchQ} setSearchQ={setSearchQ} {...sp} />}
        {page === "unit" && selUnit && <UnitDetail unit={selUnit} units={units} chunks={chunks} {...sp} />}
        {page === "quiz" && <Quiz units={units} quizQuestions={quiz_questions} nav={nav} quizScores={quizScores} saveQuiz={saveQuiz} />}
        {page === "quiz_direct" && selUnit && <Quiz units={units} quizQuestions={quiz_questions} nav={nav} quizScores={quizScores} saveQuiz={saveQuiz} directUnit={selUnit} />}
        {page === "progress" && <ProgressPage units={units} {...sp} />}
      </main>

      {/* FOOTER */}
      <footer style={{ background: C.navy, color: "#fff", marginTop: 48, padding: "24px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{source.title.charAt(0)}</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{source.title}</span>
        </div>
        <p style={{ color: "#7ba3d4", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} — منصة تعليمية — {units.length} {units[0]?.label ?? "وحدة"}</p>
      </footer>

      <style>{`@media(max-width:768px){ .desk-nav{display:none!important} .mob-btn{display:block!important} }`}</style>
    </div>
  );
}
