import { useState, useRef, useEffect } from "react";
import { Modal, Field, BtnP, Badge } from "./ui";
import { fmtDate, C, S, uid, DESIGNATIONS, XLSX_CDN } from "../lib/constants";

function parseXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) { reject(new Error("XLSX not loaded")); return; }
        const wb = XLSX.read(ev.target.result, { type: "array" });
        let rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (rows.length) resolve(rows);
        else resolve([]);
      } catch (ex) { reject(ex); }
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsArrayBuffer(file);
  });
}

export default function ProctorialBoard({ proctorial, onAdd, onDelete, isReadOnly }) {
  const [addModal, setAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [xlsxMsg, setXlsxMsg] = useState("");
  const [importing, setImporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const xlsxRef = useRef();
  const BLANK = { name: "", designation: "", department: "", mobile: "", school: "" };
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filtered = search
    ? proctorial.filter((m) => (m.name + m.designation + m.department + m.mobile + m.school).toLowerCase().includes(search.toLowerCase()))
    : proctorial;

  const handleXlsx = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setXlsxMsg("");
    setImporting(true);
    try {
      const rows = await parseXLSXFile(file);
      if (!rows.length) { setXlsxMsg("No data found."); setImporting(false); return; }
      const sample = rows[0];
      const find = (ks) => Object.keys(sample).find((k) => ks.some((kk) => String(k).toLowerCase().includes(kk.toLowerCase())));
      const nk = find(["name", "faculty", "staff"]);
      const dk = find(["designation", "post", "rank"]);
      const deptk = find(["department", "dept", "branch"]);
      const mk = find(["mobile", "phone", "contact"]);
      const sk = find(["school", "college", "institute"]);
      if (!nk) { setXlsxMsg("Name column not found."); setImporting(false); return; }
      const parsed = rows.map((r) => ({
        id: uid("P"),
        name: String(r[nk] || "").trim(),
        designation: String(r[dk] || "").trim(),
        department: String(r[deptk] || "").trim(),
        mobile: String(r[mk] || "").trim(),
        school: String(r[sk] || "").trim(),
      })).filter((r) => r.name);
      if (!parsed.length) { setXlsxMsg("No valid rows found."); setImporting(false); return; }
      for (const p of parsed) await onAdd(p);
      setXlsxMsg("✓ " + parsed.length + " members imported.");
    } catch (ex) { setXlsxMsg("Error: " + ex.message); }
    setImporting(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Proctorial Board</div>
          <div style={{ fontSize: 13, color: C.textMid }}>Shared across all logins via Supabase</div>
        </div>
        {!isReadOnly && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input ref={xlsxRef} type="file" accept=".xlsx,.xls" onChange={handleXlsx} style={{ display: "none" }} />
            <button onClick={() => xlsxRef.current.click()} disabled={importing} style={{ ...S.btnG, color: C.gold, borderColor: C.gold + "55", fontSize: 12, opacity: importing ? 0.5 : 1 }}>
              {importing ? "Importing..." : "↑ Import Excel"}
            </button>
            <BtnP onClick={() => setAddModal(true)} style={{ fontSize: 12, padding: "8px 16px" }}>+ Add Manually</BtnP>
          </div>
        )}
      </div>
      {xlsxMsg && (
        <div style={{ background: xlsxMsg.startsWith("✓") ? C.green + "10" : C.red + "10", border: "1px solid " + (xlsxMsg.startsWith("✓") ? C.green : C.red) + "44", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: xlsxMsg.startsWith("✓") ? C.green : C.red, marginBottom: 16, fontWeight: 700 }}>
          {xlsxMsg}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search name, designation, school..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...S.inp, width: isMobile ? '100%' : 260 }} />
        <div style={{ background: C.purple + "12", border: "1px solid " + C.purple + "44", borderRadius: 7, padding: "7px 18px" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: C.purple }}>{proctorial.length}</span>
          <span style={{ fontSize: 11, color: C.purple, fontWeight: 700, textTransform: "uppercase", marginLeft: 6 }}>Members</span>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.textDim, border: "1px dashed " + C.border, borderRadius: 10 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🛡</div>
          <div>No members yet. Add manually or import Excel.</div>
        </div>
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Name", "Designation", "Department", "Mobile", "School", "Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                  <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                  <td style={S.td}><div style={{ fontWeight: 700 }}>{m.name}</div></td>
                  <td style={{ ...S.td, fontSize: 12, color: C.purple }}>{m.designation || "-"}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{m.department || "-"}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.teal, fontFamily: "monospace" }}>{m.mobile || "-"}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.gold }}>{m.school || "-"}</td>
                  <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                    {!isReadOnly && <button onClick={() => onDelete(m.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "1px solid " + C.red + "44", background: C.red + "11", color: C.red, cursor: "pointer" }}>Remove</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Proctorial Board Member" width={480}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Name *"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={S.inp} /></Field>
          <Field label="Designation">
            <select value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} style={S.sel}>
              <option value="">Select...</option>
              {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Department"><input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} style={S.inp} /></Field>
          <Field label="Mobile"><input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} style={S.inp} /></Field>
          <Field label="School" col="1/-1"><input value={form.school} onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))} style={S.inp} /></Field>
        </div>
        <BtnP onClick={() => { if (!form.name) return; onAdd({ id: uid("P"), ...form }); setForm(BLANK); setAddModal(false); }} disabled={!form.name} style={{ width: "100%", padding: 11, marginTop: 4, opacity: form.name ? 1 : 0.5 }}>
          Add Member
        </BtnP>
      </Modal>
    </div>
  );
}