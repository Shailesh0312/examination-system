import { useState, useMemo } from "react";
import { DateSlotPicker, Modal, Field, BtnP, Badge } from "./ui";
import { fmtDate, C, S, STATUS, uid, DESIGNATIONS, XLSX_CDN } from "../lib/constants";

export default function ControlRoomPage({
  controlRows,
  onAddControl,
  onDeleteControl,
  duties,
  date,
  setDate,
  slot,
  setSlot,
  isReadOnly,
}) {
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ facultyName: "", facultyId: "", dept: "", designation: "", mobile: "", controlRole: "Control Room" });

  const slotRows = controlRows.filter((r) => r.date === date && r.slot === slot);
  const liveCtrl = duties.filter((d) => d.date === date && d.slot === slot && (d.dutyType === "Control Room" || d.status === "control"));
  const merged = useMemo(() => {
    const out = [...slotRows];
    liveCtrl.forEach((l) => {
      const k = (l.facultyId || l.facultyName || "").toLowerCase();
      if (!slotRows.some((r) => (r.facultyId || r.facultyName || "").toLowerCase() === k))
        out.push({ ...l, controlRole: l.controlRole || "Control Room", source: "liveops" });
    });
    return out;
  }, [slotRows, liveCtrl]);

  const exportXlsx = () => {
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = XLSX_CDN;
      s.onload = () => exportXlsx();
      document.head.appendChild(s);
      return;
    }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const data = merged.map((r, i) => ({
      "S.No": i + 1,
      "Emp ID": r.facultyId || "",
      "Faculty Name": r.facultyName,
      "Designation": r.designation || "",
      "Department": r.dept || "",
      "Mobile": r.mobile || "",
      "Role": r.controlRole || "Control Room",
      "Status": STATUS[r.status]?.label || r.status,
      "Signature": "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Control Room");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true });
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ControlRoom_" + date + "_Slot" + slot + ".xlsx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
  };

  const addEntry = async () => {
    if (!form.facultyName || isReadOnly) return;
    const entry = {
      id: uid("CR"),
      date,
      slot,
      facultyId: form.facultyId || "",
      facultyName: form.facultyName,
      dept: form.dept || "",
      designation: form.designation || "",
      mobile: form.mobile || "",
      room: "Control Room",
      dutyType: "Control Room",
      students: 0,
      isReserved: false,
      status: "present",
      incident: null,
      substituteFor: null,
      controlRole: form.controlRole || "Control Room",
    };
    onAddControl(entry);
    setForm({ facultyName: "", facultyId: "", dept: "", designation: "", mobile: "", controlRole: "Control Room" });
    setAddModal(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Control Room</div>
          <div style={{ fontSize: 13, color: C.textMid }}>Linked with Live Ops — real time across all logins</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
          {!isReadOnly && <BtnP onClick={() => setAddModal(true)} style={{ fontSize: 12, padding: "8px 16px" }}>+ Add Manually</BtnP>}
          {merged.length > 0 && <button onClick={exportXlsx} style={{ ...S.btnG, color: C.green, borderColor: C.green + "55", fontSize: 12 }}>↓ Export Excel</button>}
        </div>
      </div>
      {merged.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim, border: "1px dashed " + C.border, borderRadius: 10 }}>
          No Control Room staff for this slot.
        </div>
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Emp ID", "Name / Mobile", "Designation", "Dept", "Role", "Status", "Source", "Actions"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merged.map((r, i) => (
                <tr key={r.id || i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                  <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", fontSize: 11, color: C.gold }}>{r.facultyId || "-"}</td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700 }}>{r.facultyName}</div>
                    {r.mobile && <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</div>}
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: C.purple }}>{r.designation || "-"}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{r.dept || "-"}</td>
                  <td style={S.td}>
                    <span style={{ background: C.blue + "22", color: C.blue, border: "1px solid " + C.blue + "44", borderRadius: 4, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                      {r.controlRole || "Control Room"}
                    </span>
                  </td>
                  <td style={S.td}><Badge type={r.status || "present"} /></td>
                  <td style={{ ...S.td, fontSize: 11 }}>
                    {r.source === "liveops" ? <span style={{ color: C.teal, fontWeight: 700 }}>⟳ Live</span> : <span style={{ color: C.gold, fontWeight: 700 }}>Manual</span>}
                  </td>
                  <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                    {!isReadOnly && !r.source && (
                      <button onClick={() => onDeleteControl(r.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: "1px solid " + C.red + "44", background: C.red + "11", color: C.red, cursor: "pointer" }}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Control Room Staff" width={490}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Name *">
            <input value={form.facultyName} onChange={(e) => setForm((f) => ({ ...f, facultyName: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Emp ID">
            <input value={form.facultyId} onChange={(e) => setForm((f) => ({ ...f, facultyId: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Mobile">
            <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Designation">
            <select value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} style={S.sel}>
              <option value="">Select...</option>
              {DESIGNATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <input value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Role">
            <select value={form.controlRole} onChange={(e) => setForm((f) => ({ ...f, controlRole: e.target.value }))} style={S.sel}>
              {["Control Room", "In-charge", "Data Entry", "Observer", "Technical Support", "Coordinator", "Supervisor"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <BtnP onClick={addEntry} disabled={!form.facultyName} style={{ width: "100%", padding: 11, opacity: form.facultyName ? 1 : 0.5 }}>
          Add to Control Room
        </BtnP>
      </Modal>
    </div>
  );
}