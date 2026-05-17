import { useState, useEffect, useCallback, useMemo } from "react";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ImportPanel from "./components/ImportPanel";
import LiveOps from "./components/LiveOps";
import ControlRoomPage from "./components/ControlRoom";
import ProctorialBoard from "./components/ProctorialBoard";
import UFMCases from "./components/UFMCases";
import DutyCount from "./components/DutyCount";
import History from "./components/History";
import ExportSheet from "./components/ExportSheet";
import FacultyDutyLookup from "./components/FacultyLookup";
import WhatsAppMsg from "./components/WhatsAppMsg";
import { C } from "./lib/constants";
import { XLSX_CDN } from "./lib/supabase";
import {
  dbGetDuties,
  dbUpsertDuties,
  dbDeleteDuty,
  dbClearDateSlot,
  dbGetFaculty,
  dbSaveFaculty,
  dbGetDateSlot,
  dbSaveDateSlot,
  dbGetUFM,
  dbUpsertUFM,
  dbDeleteUFM,
  dbGetProctorial,
  dbUpsertProctorial,
  dbDeleteProctorial,
  dbGetControl,
  dbUpsertControl,
  dbDeleteControl,
  subscribeRealtime,
} from "./lib/db";
import { READ_ONLY_ROLES } from "./lib/constants";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [duties, setDuties] = useState([]);
  const [facultyMaster, setFM] = useState([]);
  const [proctorial, setProct] = useState([]);
  const [ufmCases, setUFM] = useState([]);
  const [controlRows, setCtrl] = useState([]);
  const [date, setDateRaw] = useState("");
  const [slot, setSlotRaw] = useState("I");
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("syncing");
  const isReadOnly = user ? READ_ONLY_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = XLSX_CDN;
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setSyncStatus("syncing");
    (async () => {
      try {
        const [d, fm, ds, pr, ufm, ctrl] = await Promise.all([
          dbGetDuties(),
          dbGetFaculty(),
          dbGetDateSlot(),
          dbGetProctorial(),
          dbGetUFM(),
          dbGetControl(),
        ]);
        setDuties(d);
        setFM(fm);
        setProct(pr);
        setUFM(ufm);
        setCtrl(ctrl);
        setDateRaw(ds.date || "");
        setSlotRaw(ds.slot || "I");
        setSyncStatus("live");
      } catch (e) {
        console.error("Init error:", e);
        setSyncStatus("error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    const unsubs = [];
    (async () => {
      unsubs.push(await subscribeRealtime("exam_duties", async () => { setDuties(await dbGetDuties()); }));
      unsubs.push(await subscribeRealtime("ufm_cases", async () => { setUFM(await dbGetUFM()); }));
      unsubs.push(await subscribeRealtime("proctorial_board", async () => { setProct(await dbGetProctorial()); }));
      unsubs.push(await subscribeRealtime("control_room", async () => { setCtrl(await dbGetControl()); }));
    })();
    return () => unsubs.forEach((u) => { try { u(); } catch {} });
  }, [loading, user]);

  const setDate = useCallback((d) => { setDateRaw(d); dbSaveDateSlot(d, slot).catch(() => {}); }, [slot]);
  const setSlot = useCallback((s) => { setSlotRaw(s); dbSaveDateSlot(date, s).catch(() => {}); }, [date]);
  const setFacultyMaster = useCallback(async (fm) => { setFM(fm); await dbSaveFaculty(fm); }, []);

  const onImportConfirm = useCallback(async (newDuties, importDate, importSlot) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      setDuties((prev) => [...prev.filter((d) => !(d.date === importDate && d.slot === importSlot)), ...newDuties]);
      await dbClearDateSlot(importDate, importSlot);
      await dbUpsertDuties(newDuties);
      setSyncStatus("live");
    } catch (e) {
      console.error("Import error:", e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onAddDuty = useCallback(async (duty) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      setDuties((prev) => [...prev, duty]);
      await dbUpsertDuties([duty]);
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onUpdateDuty = useCallback(async (d) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      setDuties((prev) => prev.map((x) => (x.id === d.id ? d : x)));
      await dbUpsertDuties([d]);
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onDeleteDuty = useCallback(async (id) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      setDuties((prev) => prev.filter((d) => d.id !== id));
      await dbDeleteDuty(id);
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onAddControl = useCallback(async (r) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      await dbUpsertControl(r);
      setCtrl((prev) => [...prev, r]);
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onDeleteControl = useCallback(async (id) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      await dbDeleteControl(id);
      setCtrl((prev) => prev.filter((r) => r.id !== id));
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onAddToControlRoom = useCallback(async (r) => {
    if (isReadOnly) return;
    const exists = controlRows.some((x) => (x.facultyId && x.facultyId === r.facultyId) || (x.facultyName === r.facultyName && x.date === r.date && x.slot === r.slot));
    if (exists) return;
    setSyncStatus("syncing");
    try {
      await dbUpsertControl(r);
      setCtrl((prev) => [...prev, r]);
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly, controlRows]);

  const onAddProct = useCallback(async (m) => {
    if (isReadOnly) return;
    try {
      await dbUpsertProctorial(m);
      setProct((prev) => {
        const exists = prev.some((x) => x.id === m.id);
        return exists ? prev.map((x) => (x.id === m.id ? m : x)) : [...prev, m];
      });
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onDeleteProct = useCallback(async (id) => {
    if (isReadOnly) return;
    setSyncStatus("syncing");
    try {
      await dbDeleteProctorial(id);
      setProct((prev) => prev.filter((m) => m.id !== id));
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [isReadOnly]);

  const onAddUFM = useCallback(async (c) => {
    setUFM((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  }, []);

  const onDeleteUFM = useCallback(async (id) => {
    if (!DELETE_UFM_ROLES.includes(user?.role)) return;
    setSyncStatus("syncing");
    try {
      await dbDeleteUFM(id);
      setUFM((prev) => prev.filter((c) => c.id !== id));
      setSyncStatus("live");
    } catch (e) {
      console.error(e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  }, [user]);

  const DELETE_UFM_ROLES = ["Admin"];

  const todayIssues = useMemo(() => duties.filter((d) => d.date === date && d.status !== "present" && d.status !== "reserved").length, [duties, date]);

  if (loading) return (
    <div style={{ fontFamily: "system-ui", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>🎓</div>
        <div style={{ color: C.primaryL, fontWeight: 700, fontSize: 16 }}>Connecting to Supabase...</div>
      </div>
    </div>
  );
  if (!user) return <LoginPage onLogin={(u) => { setUser(u); setView("dashboard"); }} />;

  const shared = { date, setDate, slot, setSlot };
  const views = {
    dashboard: <Dashboard duties={duties} controlRows={controlRows} setView={setView} isReadOnly={isReadOnly} {...shared} />,
    import: <ImportPanel duties={duties} onImportConfirm={onImportConfirm} setFacultyMaster={setFacultyMaster} isReadOnly={isReadOnly} saving={syncStatus === "syncing"} {...shared} />,
    liveops: <LiveOps duties={duties} onUpdateDuty={onUpdateDuty} onAddDuty={onAddDuty} onDeleteDuty={onDeleteDuty} isReadOnly={isReadOnly} facultyMaster={facultyMaster} onAddToControlRoom={onAddToControlRoom} {...shared} />,
    controlroom: <ControlRoomPage controlRows={controlRows} onAddControl={onAddControl} onDeleteControl={onDeleteControl} duties={duties} isReadOnly={isReadOnly} {...shared} />,
    proctorial: <ProctorialBoard proctorial={proctorial} onAdd={onAddProct} onDelete={onDeleteProct} isReadOnly={isReadOnly} />,
    ufm: <UFMCases ufmCases={ufmCases} onAdd={onAddUFM} onDelete={onDeleteUFM} userRole={user.role} duties={duties} {...shared} />,
    dutycount: <DutyCount duties={duties} />,
    history: <History duties={duties} />,
    xlexport: <ExportSheet duties={duties} {...shared} />,
    facultyduty: <FacultyDutyLookup duties={duties} />,
    whatsapp: <WhatsAppMsg duties={duties} isReadOnly={isReadOnly} {...shared} />,
  };

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", background: C.bg, color: C.text, display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <Sidebar view={view} setView={setView} todayIssues={todayIssues} user={user} syncStatus={syncStatus} isReadOnly={isReadOnly} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 28px", borderBottom: "1px solid " + C.border, background: C.surface, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.textMid }}>{user.name} <span style={{ color: C.textDim }}>({user.role})</span></span>
            <button onClick={() => setUser(null)} style={{ padding: "6px 16px", background: C.accentGrad, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Sign Out</button>
          </div>
        </div>
        <div style={{ padding: "28px 32px 56px" }}>{views[view]}</div>
      </main>
    </div>
  );
}