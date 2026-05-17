import { useState, useEffect, useRef, useMemo } from "react";
import { DateSlotPicker, Modal, Field, BtnP, StatCard, Spinner } from "./ui";
import { fmtDate, C, S, UPLOAD_ROLES, DELETE_UFM_ROLES, uid, UFM_MATERIALS } from "../lib/constants";
import { dbUpsertUFM, dbUploadUFMFile, getSB } from "../lib/db";

export default function UFMCases({ ufmCases, onAdd, onDelete, date, setDate, slot, setSlot, userRole, duties }) {
  const [addModal, setAddModal] = useState(false);
  const [uploading, setUploading] = useState({});
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const BLANK = { rollNo: "", studentName: "", roomNo: "", incidentTime: "", material: "", materialOther: "", invigilator: "", flyingSquad1: "", flyingSquad2: "" };
  const [form, setForm] = useState({ ...BLANK });
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const canAdd = UPLOAD_ROLES.includes(userRole);
  const canUpload = UPLOAD_ROLES.includes(userRole);
  const canDelete = DELETE_UFM_ROLES.includes(userRole);

  const prevRoom = useRef("");
  useEffect(() => {
    const needle = (form.roomNo || "").trim().toLowerCase();
    if (!needle || needle === prevRoom.current) return;
    prevRoom.current = needle;
    if (!date || !slot) return;
    const matches = (duties || []).filter((d) => d.date === date && d.slot === slot && (d.room || "").trim().toLowerCase() === needle && !d.isReserved && d.status !== "reserved");
    if (matches.length) setForm((f) => ({ ...f, invigilator: matches.map((m) => m.facultyName).filter(Boolean).join(", ") }));
  }, [form.roomNo, date, slot, duties]);

  const slotCases = useMemo(() => [...ufmCases].filter((c) => c.date === date && (c.slot === slot || c.shift === slot)).sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0)), [ufmCases, date, slot]);

  const doAdd = async () => {
    const f = {
      rollNo: String(form.rollNo || "").trim(),
      studentName: String(form.studentName || "").trim(),
      roomNo: String(form.roomNo || "").trim(),
      incidentTime: form.incidentTime || "",
      material: form.material || "",
      materialOther: form.materialOther || "",
      invigilator: form.invigilator || "",
      flyingSquad1: form.flyingSquad1 || "",
      flyingSquad2: form.flyingSquad2 || "",
    };
    if (adding) return;
    if (!f.rollNo && !f.studentName) { setAddError("Enter Roll No or Student Name."); return; }
    setAdding(true);
    setAddError("");
    let ts = new Date().toISOString();
    if (date && f.incidentTime) { try { const c = new Date(date + "T" + f.incidentTime + ":00"); if (!isNaN(c.getTime())) ts = c.toISOString(); } catch (e) {} }
    const materialLabel = f.material === "Other" ? (f.materialOther || "Other") : f.material;
    const authorityInfo = { material: materialLabel, invigilator: f.invigilator, flyingSquad1: f.flyingSquad1, flyingSquad2: f.flyingSquad2, docLink: "" };
    const newCase = { id: uid("UFM"), date: date || "", slot: slot || "I", shift: slot || "I", rollNo: f.rollNo, studentName: f.studentName, roomNo: f.roomNo, school: "", docLink: "", ts, authorityInfo };
    try {
      const sb = await getSB();
      const row = { id: newCase.id, date: newCase.date, slot: newCase.slot, shift: newCase.shift, roll_no: newCase.rollNo, student_name: newCase.studentName, room_no: newCase.roomNo, school: "", doc_link: "", ts: newCase.ts, authority_info: JSON.stringify(authorityInfo) };
      const res = await sb.from("ufm_cases").insert(row);
      if (res.error) throw new Error(res.error.message || "Insert failed");
      await onAdd(newCase);
      setForm({ ...BLANK });
      prevRoom.current = "";
      setAddModal(false);
    } catch (err) { 
      console.error("UFM Add Error:", err);
      let errorMsg = "Failed to add UFM case. ";
      
      if (err instanceof Error) {
        errorMsg += err.message;
      } else if (err && typeof err === 'object') {
        // Handle various error formats
        if (err.message) {
          errorMsg += err.message;
        } else if (err.error?.message) {
          errorMsg += err.error.message;
        } else if (err.code) {
          errorMsg += `Error code: ${err.code}`;
        } else if (err.status) {
          errorMsg += `HTTP Status: ${err.status}`;
        } else {
          // Try to get any available property
          const keys = Object.keys(err);
          if (keys.length > 0) {
            errorMsg += `Details: ${JSON.stringify(err).substring(0, 200)}`;
          } else {
            errorMsg += "Unknown error - check console for details.";
          }
        }
      } else if (typeof err === 'string') {
        errorMsg += err;
      } else {
        errorMsg += "Unknown error occurred.";
      }
      
      setAddError(errorMsg);
    }
    finally { setAdding(false); }
  };

  const handleUpload = async (caseId, file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) { alert("Only JPG, PNG or PDF allowed."); return; }
    setUploading((u) => ({ ...u, [caseId]: true }));
    try {
      const publicUrl = await dbUploadUFMFile(file, caseId);
      const c = ufmCases.find((x) => x.id === caseId);
      if (c) {
        const ai = { ...(c.authorityInfo || {}), docLink: publicUrl };
        const updated = { ...c, docLink: publicUrl, authorityInfo: ai };
        await dbUpsertUFM(updated);
        await onAdd(updated);
      }
    } catch (e) { alert("Upload failed: " + e.message); }
    finally { setUploading((u) => ({ ...u, [caseId]: false })); }
  };

  const timeStr = (ts) => ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>UFM Cases</div>
          <div style={{ fontSize: 13, color: C.textMid }}>Unfair Means — {date ? fmtDate(date) : "Select date"}, Shift {slot}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
          {canAdd && <BtnP onClick={() => { setAddModal(true); setAddError(""); setForm({ ...BLANK }); }} style={{ fontSize: 12, padding: "8px 16px", background: "linear-gradient(135deg,#b91c1c,#7a0000)" }}>+ Add UFM</BtnP>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <StatCard value={slotCases.length} label="This Shift" color={C.red} />
        <StatCard value={ufmCases.length} label="Total Cases" color={C.orange} />
        <StatCard value={slotCases.filter((c) => c.docLink).length} label="Docs Uploaded" color={C.green} />
        <StatCard value={slotCases.filter((c) => !c.docLink).length} label="Pending Docs" color={C.yellow} />
      </div>
      {slotCases.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.textDim, border: "1px dashed " + C.border, borderRadius: 10 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⚠</div>
          <div style={{ fontSize: 14, color: C.textMid }}>No UFM cases for {date ? fmtDate(date) : "selected date"}, Shift {slot}</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#111a38", borderRadius: 10, overflow: "hidden", border: "1px solid " + C.border }}>
            <thead><tr style={{ background: "#080d1e" }}>{["#", "Roll No", "Student Name", "Room", "Shift", "Time", "Invigilator(s)", "UFM Material", "Flying Squad", "Document", "Actions"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {slotCases.map((c, i) => {
                const ai = c.authorityInfo || {};
                const mat = ai.material || "—";
                const squads = [ai.flyingSquad1, ai.flyingSquad2].filter(Boolean).join(", ") || "—";
                return (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03", borderLeft: "3px solid " + (c.docLink ? C.green : C.red) + "55" }}>
                    <td style={{ ...S.td, color: C.textMid, fontSize: 11, width: 36 }}>{i + 1}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 800, color: C.primaryL }}>{c.rollNo || "—"}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{c.studentName || "—"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.textMid, fontWeight: 700 }}>{c.roomNo || "—"}</td>
                    <td style={S.td}><span style={{ background: C.gold + "22", color: C.gold, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Shift {c.shift || c.slot}</span></td>
                    <td style={{ ...S.td, fontSize: 12, color: C.textMid, whiteSpace: "nowrap" }}>🕐 {timeStr(c.ts)}</td>
                    <td style={{ ...S.td, fontSize: 11, color: C.textMid, maxWidth: 150 }}>{ai.invigilator || "—"}</td>
                    <td style={S.td}><span style={{ background: C.red + "18", color: C.red, border: "1px solid " + C.red + "33", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{mat}</span></td>
                    <td style={{ ...S.td, fontSize: 11, color: C.blue }}>{squads}</td>
                    <td style={S.td}>{c.docLink ? <a href={c.docLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, background: C.green + "18", color: C.green, border: "1px solid " + C.green + "44", borderRadius: 4, padding: "3px 9px", fontWeight: 700, textDecoration: "none" }}>📄 View</a> : <span style={{ fontSize: 11, color: C.yellow, fontWeight: 700 }}>Pending</span>}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {canUpload && (
                          <label style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "none", background: C.orange + "cc", color: "#fff", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            {uploading[c.id] ? <Spinner /> : "📎 Upload"}
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; if (f) handleUpload(c.id, f); }} disabled={!!uploading[c.id]} />
                          </label>
                        )}
                        {canDelete && <button onClick={() => { if (window.confirm("Delete UFM case?")) onDelete(c.id); }} style={{ fontSize: 11, padding: "4px 9px", borderRadius: 4, border: "1px solid " + C.red + "44", background: C.red + "11", color: C.red, cursor: "pointer", fontWeight: 700 }}>✕</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={addModal} onClose={() => { setAddModal(false); setAddError(""); }} title={"Add UFM Case — " + fmtDate(date) + " Shift " + slot} width={540}>
        <div style={{ background: C.red + "0a", border: "1px solid " + C.red + "33", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: C.textMid }}>
          Date: <b style={{ color: C.text }}>{fmtDate(date) || "Not selected"}</b> &nbsp;|&nbsp; Shift: <b style={{ color: C.gold }}>Shift {slot}</b>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
          <Field label="Roll Number"><input value={form.rollNo} onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))} placeholder="e.g. 2201050001" style={S.inp} /></Field>
          <Field label="Student Name"><input value={form.studentName} onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))} placeholder="Full name" style={S.inp} /></Field>
          <Field label="Room No"><input value={form.roomNo} onChange={(e) => setForm((f) => ({ ...f, roomNo: e.target.value }))} placeholder="e.g. Room 101" style={S.inp} /></Field>
          <Field label="Time of Incident"><input type="time" value={form.incidentTime} onChange={(e) => setForm((f) => ({ ...f, incidentTime: e.target.value }))} style={S.inp} /></Field>
          <Field label="UFM Material" col="1/-1">
            <select value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value, materialOther: "" }))} style={S.sel}>
              <option value="">Select material...</option>
              {UFM_MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {form.material === "Other" && <input value={form.materialOther} onChange={(e) => setForm((f) => ({ ...f, materialOther: e.target.value }))} placeholder="Describe the material..." style={{ ...S.inp, marginTop: 7 }} />}
          </Field>
          <Field label="Invigilator(s) on Duty" col="1/-1"><input value={form.invigilator} onChange={(e) => setForm((f) => ({ ...f, invigilator: e.target.value }))} placeholder="Auto-filled from roster if room matches" style={{ ...S.inp, borderColor: form.invigilator ? C.teal : C.border }} /></Field>
          <Field label="Flying Squad Member 1"><input value={form.flyingSquad1} onChange={(e) => setForm((f) => ({ ...f, flyingSquad1: e.target.value }))} placeholder="Name" style={S.inp} /></Field>
          <Field label="Flying Squad Member 2"><input value={form.flyingSquad2} onChange={(e) => setForm((f) => ({ ...f, flyingSquad2: e.target.value }))} placeholder="Name" style={S.inp} /></Field>
        </div>
        <div style={{ background: C.orange + "0a", border: "1px solid " + C.orange + "33", borderRadius: 7, padding: "9px 14px", fontSize: 12, color: C.textMid, marginBottom: 14 }}>
          💡 After saving, use <b style={{ color: C.orange }}>📎 Upload</b> to attach the confiscated material photo or formal document.
        </div>
        {addError && <div style={{ background: "#ef444414", border: "1px solid #ef444455", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: C.red, marginBottom: 12, fontWeight: 600, wordBreak: "break-word" }}>⚠ {addError}</div>}
        <button type="button" disabled={(!form.rollNo && !form.studentName) || adding} onClick={(e) => { e.preventDefault(); e.stopPropagation(); doAdd(); }} style={{ width: "100%", padding: 11, fontSize: 14, fontWeight: 800, background: "linear-gradient(135deg,#b91c1c,#7a0000)", color: "#fff", border: "none", borderRadius: 8, cursor: (!form.rollNo && !form.studentName) || adding ? "not-allowed" : "pointer", opacity: (!form.rollNo && !form.studentName) || adding ? 0.5 : 1 }}>
          {adding ? "Saving..." : "Add UFM Case"}
        </button>
      </Modal>
    </div>
  );
}