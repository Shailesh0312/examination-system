import { useState, useMemo, useEffect } from "react";
import { DateSlotPicker, Modal, Field, BtnP, BtnG, Badge } from "./ui";
import {
  fmtDate,
  C,
  S,
  STATUS,
  DEPLOY_TRIGGER,
  REPLACEMENT_TYPES,
  uid,
  DESIGNATIONS,
  DUTY_TYPES,
} from "../lib/constants";

const BLANK_INC = {
  type: "absent",
  authorityInformed: "",
  note: "",
  replacementFacultyName: "",
  replacementFacultyId: "",
  replacementMobile: "",
  replacementDesignation: "",
  replacementDept: "",
  newRoom: "",
  selectedStandbyId: "",
};

export default function LiveOps({
  duties,
  onUpdateDuty,
  onAddDuty,
  onDeleteDuty,
  date,
  setDate,
  slot,
  setSlot,
  isReadOnly,
  facultyMaster,
  onAddToControlRoom,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [incModal, setIncModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [sbModal, setSbModal] = useState(false);
  const [deployModal, setDeployModal] = useState(null);
  const [incForm, setIncForm] = useState(BLANK_INC);
  const [deployForm, setDeployForm] = useState({ room: "", students: 0, reason: "Manual", replacingName: "" });
  const [sbForm, setSbForm] = useState({
    facultyName: "",
    facultyId: "",
    dept: "",
    designation: "",
    mobile: "",
    room: "",
    dutyType: "Invigilation",
    students: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const allRows = duties.filter((d) => d.date === date && d.slot === slot);
  const rows = allRows.filter((d) => !d.isReserved && d.status !== "reserved");
  const reserved = allRows.filter((d) => (d.isReserved || d.status === "reserved") && !d.substituteFor);

  const filtered = useMemo(() => {
    let r = rows;
    if (filter === "issues") r = r.filter((x) => x.status !== "present");
    else if (filter === "substituted") r = r.filter((x) => x.substituteFor);
    else if (filter !== "all") r = r.filter((x) => x.status === filter);
    if (search)
      r = r.filter(
        (x) =>
          (x.facultyName + x.facultyId + x.room + x.mobile + (x.substituteFor || ""))
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    return r;
  }, [rows, filter, search]);

  const confirmDeploy = () => {
    if (!deployModal || !deployForm.room) return;
    const ts = new Date().toISOString();
    onUpdateDuty({
      ...deployModal,
      isReserved: false,
      status: "present",
      room: deployForm.room,
      students: Number(deployForm.students) || 0,
      dutyType: "Invigilation",
      substituteFor: deployForm.replacingName || null,
      incident: {
        type: "deployed",
        note:
          "Deployed" +
          (deployForm.replacingName ? " as replacement for " + deployForm.replacingName : "") +
          " — " +
          deployForm.reason,
        authorityInformed: "",
        ts,
      },
    });
    setDeployModal(null);
    setDeployForm({ room: "", students: 0, reason: "Manual", replacingName: "" });
  };

  const selectStandby = (resEntry) => {
    setIncForm((f) => ({
      ...f,
      selectedStandbyId: resEntry.id,
      replacementFacultyName: resEntry.facultyName,
      replacementFacultyId: resEntry.facultyId || "",
      replacementMobile: resEntry.mobile || "",
      replacementDesignation: resEntry.designation || "",
      replacementDept: resEntry.dept || "",
    }));
  };

  const applyInc = () => {
    if (!incModal) return;
    const ts = new Date().toISOString();
    const type = incForm.type;
    const incident = {
      type,
      authorityInformed: incForm.authorityInformed,
      note: incForm.note,
      ts,
    };
    if (REPLACEMENT_TYPES.includes(type) && incForm.replacementFacultyName) {
      incident.replacementFacultyName = incForm.replacementFacultyName;
      incident.replacementFacultyId = incForm.replacementFacultyId;
      incident.replacementMobile = incForm.replacementMobile;
      incident.substituteAdded = incForm.replacementFacultyName;
    }
    if (type === "roomchg") {
      incident.originalRoom = incModal.room;
      incident.newRoom = incForm.newRoom;
      incident.note =
        "Room changed: " +
        (incModal.room || "?") +
        " → " +
        incForm.newRoom +
        (incForm.note ? ". " + incForm.note : "");
      onUpdateDuty({ ...incModal, status: "roomchg", room: incForm.newRoom, incident });
      setIncModal(null);
      return;
    }
    if (type === "control") {
      onUpdateDuty({ ...incModal, status: "control", incident: { ...incident, note: "Moved to Control Room" } });
      onAddToControlRoom({
        id: uid("CR"),
        date: incModal.date,
        slot: incModal.slot,
        facultyId: incModal.facultyId || "",
        facultyName: incModal.facultyName,
        dept: incModal.dept || "",
        designation: incModal.designation || "",
        mobile: incModal.mobile || "",
        room: "Control Room",
        dutyType: "Control Room",
        students: 0,
        isReserved: false,
        status: "present",
        incident: null,
        substituteFor: null,
        controlRole: "Control Room",
      });
      setIncModal(null);
      return;
    }
    onUpdateDuty({ ...incModal, status: type, incident });
    if (REPLACEMENT_TYPES.includes(type) && incForm.replacementFacultyName) {
      if (incForm.selectedStandbyId) {
        const resEntry = reserved.find((d) => d.id === incForm.selectedStandbyId);
        if (resEntry) {
          onUpdateDuty({
            ...resEntry,
            isReserved: false,
            status: "present",
            room: incModal.room,
            students: incModal.students,
            dutyType: incModal.dutyType,
            substituteFor: incModal.facultyName,
            incident: { type: "deployed", note: "Deployed as replacement for " + incModal.facultyName, ts },
          });
          setIncModal(null);
          return;
        }
      }
      onAddDuty({
        id: uid("D"),
        date: incModal.date,
        slot: incModal.slot,
        facultyId: incForm.replacementFacultyId || "",
        facultyName: incForm.replacementFacultyName,
        dept: incForm.replacementDept || "",
        designation: incForm.replacementDesignation || "",
        mobile: incForm.replacementMobile || "",
        room: incModal.room,
        students: incModal.students,
        dutyType: incModal.dutyType,
        isReserved: false,
        status: "present",
        substituteFor: incModal.facultyName,
        incident: { type: "deployed", note: "Added as replacement", ts },
        controlRole: null,
      });
    }
    setIncModal(null);
  };

  const clearInc = (row) =>
    onUpdateDuty({ ...row, status: "present", incident: null, substituteFor: null });
  const addSb = () => {
    if (!sbForm.facultyName) return;
    onAddDuty({
      id: uid("D"),
      date,
      slot,
      ...sbForm,
      isReserved: sbForm.dutyType === "Standby",
      status: sbForm.dutyType === "Standby" ? "reserved" : "present",
      incident: null,
      substituteFor: null,
      controlRole: null,
    });
    setSbForm({
      facultyName: "",
      facultyId: "",
      dept: "",
      designation: "",
      mobile: "",
      room: "",
      dutyType: "Invigilation",
      students: 0,
    });
    setSbModal(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Live Ops</div>
          <div style={{ fontSize: 13, color: C.textMid }}>Flag incidents, substitutions, room updates</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
          {!isReadOnly && (
            <button onClick={() => setSbModal(true)} style={{ ...S.btnG, color: C.blue, borderColor: C.blue + "55" }}>
              + Add Faculty
            </button>
          )}
        </div>
      </div>
      {reserved.length > 0 && (
        <div style={{ background: "#fbbf2408", border: "1.5px solid " + C.yellow + "44", borderRadius: 10, padding: "12px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.yellow, textTransform: "uppercase", marginBottom: 8 }}>
            Standby ({reserved.length}) — Available for Deployment
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {reserved.map((r) => (
              <div key={r.id} style={{ background: "#111a38", border: "1px solid " + C.yellow + "44", borderRadius: 8, padding: "8px 12px", fontSize: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <div>
                  <b style={{ color: C.text }}>{r.facultyName}</b>
                  {r.designation && <div style={{ fontSize: 11, color: C.purple }}>{r.designation}</div>}
                  {r.mobile && <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</div>}
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      setDeployModal(r);
                      setDeployForm({ room: "", students: 0, reason: "Manual", replacingName: "" });
                    }}
                    style={{ fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "none", background: "linear-gradient(135deg," + C.green + ",#077a4f)", color: "#fff", cursor: "pointer", fontWeight: 800, flexShrink: 0 }}
                  >
                    Deploy →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input placeholder="Search name, ID, room..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...S.inp, width: isMobile ? '100%' : 240 }} />
        {[
          ["all", "All"],
          ["issues", "Issues"],
          ["present", "Present"],
          ["absent", "Absent"],
          ["late", "Late"],
          ["substituted", "Substituted"],
          ["relieved", "Relieved"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid " + (filter === k ? C.primary : C.border),
              background: filter === k ? "#8B000022" : "transparent",
              color: filter === k ? C.primaryL : C.textMid,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: filter === k ? 700 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim }}>
          No duties for {fmtDate(date) || "selected date"}, Slot {slot}
        </div>
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Faculty / Mobile", "Dept", "Room", "Type", "Status", "Incident", "Actions"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const needsDeploy = DEPLOY_TRIGGER.has(r.status) && !r.incident?.substituteAdded;
                const bg = needsDeploy ? C.orange + "08" : r.substituteFor ? C.teal + "08" : r.status === "absent" ? C.red + "08" : "transparent";
                const lb = needsDeploy ? C.orange : r.substituteFor ? C.teal : r.status === "absent" ? C.red : "transparent";
                return (
                  <tr key={r.id} style={{ background: bg, borderLeft: "3px solid " + lb }}>
                    <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 700 }}>
                        {r.facultyName}
                        {r.substituteFor && (
                          <span style={{ fontSize: 10, background: C.teal + "22", color: C.teal, borderRadius: 3, padding: "1px 6px", marginLeft: 6 }}>
                            SUBST.
                          </span>
                        )}
                      </div>
                      {r.mobile && <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</div>}
                      {r.designation && <div style={{ fontSize: 11, color: C.purple }}>{r.designation}</div>}
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{r.dept || "-"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.primaryL }}>{r.room || "-"}</td>
                    <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{r.dutyType}</td>
                    <td style={S.td}><Badge type={r.status} /></td>
                    <td style={{ ...S.td, fontSize: 11, maxWidth: 140 }}>
                      {r.incident?.substituteAdded && <div style={{ color: C.green }}>{"→ " + r.incident.substituteAdded}</div>}
                      {r.incident?.note && !r.incident.substituteAdded && <div style={{ color: C.textMid }}>{r.incident.note}</div>}
                    </td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      {!isReadOnly && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button
                            onClick={() => {
                              setIncForm({ ...BLANK_INC });
                              setIncModal(r);
                            }}
                            style={{ fontSize: 11, padding: "4px 9px", borderRadius: 4, border: "none", background: C.red + "1a", color: C.red, cursor: "pointer", fontWeight: 700 }}
                          >
                            Flag
                          </button>
                          {r.incident && (
                            <button onClick={() => clearInc(r)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "1px solid " + C.border, background: "transparent", color: C.textMid, cursor: "pointer" }}>
                              Clr
                            </button>
                          )}
                          <button onClick={() => setEditModal({ ...r })} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "1px solid " + C.border, background: "transparent", color: C.textMid, cursor: "pointer" }}>
                            Edit
                          </button>
                          <button onClick={() => onDeleteDuty(r.id)} style={{ fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "none", background: "transparent", color: C.textDim, cursor: "pointer", fontWeight: 700 }}>
                            ×
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!incModal} onClose={() => setIncModal(null)} title={"Flag — " + (incModal?.facultyName || "")} width={600}>
        <div style={{ background: "#111a38", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, border: "1px solid " + C.border }}>
          <b>{incModal?.facultyName}</b> — Room <b style={{ color: C.primaryL }}>{incModal?.room || "-"}</b>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Incident Type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
            {Object.entries(STATUS)
              .filter(([k]) => !["present", "reserved", "swapped_in", "exchanged"].includes(k))
              .map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setIncForm((f) => ({ ...BLANK_INC, type: k, authorityInformed: f.authorityInformed }))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    background: incForm.type === k ? v.color : v.color + "22",
                    color: incForm.type === k ? "#fff" : v.color,
                  }}
                >
                  {v.label}
                </button>
              ))}
          </div>
        </div>
        {REPLACEMENT_TYPES.includes(incForm.type) && (
          <div style={{ background: "#0d1530", border: "1px solid " + C.border2, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 10 }}>Select Replacement Faculty</div>
            {reserved.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8, fontWeight: 600 }}>Available Standby ({reserved.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                  {reserved.map((r) => {
                    const isSel = incForm.selectedStandbyId === r.id;
                    return (
                      <label
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "9px 12px",
                          borderRadius: 8,
                          border: "2px solid " + (isSel ? C.green : C.border),
                          background: isSel ? C.green + "10" : "#080d1e",
                          cursor: "pointer",
                        }}
                      >
                        <input type="radio" name="standby" checked={isSel} onChange={() => selectStandby(r)} style={{ accentColor: C.green, width: 16, height: 16, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: isSel ? C.green : C.text }}>{r.facultyName}</div>
                          <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                            {r.designation && <span style={{ fontSize: 11, color: C.purple }}>{r.designation}</span>}
                            {r.mobile && <span style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ borderTop: "1px solid " + C.border, paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600, marginBottom: 8 }}>Or enter manually:</div>
              <input value={incForm.replacementFacultyName} onChange={(e) => setIncForm((f) => ({ ...f, replacementFacultyName: e.target.value, selectedStandbyId: "" }))} placeholder="Faculty Name *" style={{ ...S.inp, marginBottom: 8 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={incForm.replacementFacultyId} onChange={(e) => setIncForm((f) => ({ ...f, replacementFacultyId: e.target.value }))} placeholder="Faculty ID" style={S.inp} />
                <input value={incForm.replacementMobile} onChange={(e) => setIncForm((f) => ({ ...f, replacementMobile: e.target.value }))} placeholder="Mobile" style={S.inp} />
              </div>
            </div>
          </div>
        )}
        {incForm.type === "roomchg" && (
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>New Room Number</label>
            <input value={incForm.newRoom} onChange={(e) => setIncForm((f) => ({ ...f, newRoom: e.target.value }))} placeholder="Enter new room" style={S.inp} />
          </div>
        )}
        <Field label="Authority Informed">
          <input value={incForm.authorityInformed} onChange={(e) => setIncForm((f) => ({ ...f, authorityInformed: e.target.value }))} placeholder="e.g. HOD, Dean, Controller" style={S.inp} />
        </Field>
        <Field label="Notes">
          <input value={incForm.note} onChange={(e) => setIncForm((f) => ({ ...f, note: e.target.value }))} placeholder="Any additional notes..." style={S.inp} />
        </Field>
        <BtnP onClick={applyInc} disabled={incForm.type === "roomchg" && !incForm.newRoom} style={{ width: "100%", padding: 11 }}>
          Apply Incident
        </BtnP>
      </Modal>

      <Modal open={!!deployModal} onClose={() => setDeployModal(null)} title={"Deploy — " + (deployModal?.facultyName || "")} width={460}>
        {deployModal && (
          <>
            <div style={{ background: "#111a38", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, border: "1px solid " + C.border }}>
              <b>{deployModal.facultyName}</b>
              {deployModal.mobile && <span style={{ color: C.teal, fontFamily: "monospace", marginLeft: 10 }}>{deployModal.mobile}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              <Field label="Assign to Room *">
                <input value={deployForm.room} onChange={(e) => setDeployForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. Room 101" style={S.inp} />
              </Field>
              <Field label="Students">
                <input type="number" min="0" value={deployForm.students} onChange={(e) => setDeployForm((f) => ({ ...f, students: Number(e.target.value) }))} style={S.inp} />
              </Field>
              <Field label="Reason">
                <select value={deployForm.reason} onChange={(e) => setDeployForm((f) => ({ ...f, reason: e.target.value }))} style={S.sel}>
                  {["Manual", "Absent", "Relieved", "Emergency", "Additional Requirement"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Replacing (optional)">
                <input value={deployForm.replacingName} onChange={(e) => setDeployForm((f) => ({ ...f, replacingName: e.target.value }))} placeholder="Absent faculty name" style={S.inp} />
              </Field>
            </div>
            <BtnP onClick={confirmDeploy} disabled={!deployForm.room} style={{ width: "100%", padding: 11, background: "linear-gradient(135deg," + C.green + ",#077a4f)", opacity: deployForm.room ? 1 : 0.5 }}>
              Confirm Deployment
            </BtnP>
          </>
        )}
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Duty Entry" width={520}>
        {editModal && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Faculty Name">
                <input value={editModal.facultyName} onChange={(e) => setEditModal((m) => ({ ...m, facultyName: e.target.value }))} style={S.inp} />
              </Field>
              <Field label="Faculty ID">
                <input value={editModal.facultyId} onChange={(e) => setEditModal((m) => ({ ...m, facultyId: e.target.value }))} style={S.inp} />
              </Field>
              <Field label="Mobile">
                <input value={editModal.mobile || ""} onChange={(e) => setEditModal((m) => ({ ...m, mobile: e.target.value }))} style={S.inp} />
              </Field>
              <Field label="Designation">
                <select value={editModal.designation || ""} onChange={(e) => setEditModal((m) => ({ ...m, designation: e.target.value }))} style={S.sel}>
                  <option value="">Select...</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Department">
                <input value={editModal.dept} onChange={(e) => setEditModal((m) => ({ ...m, dept: e.target.value }))} style={S.inp} />
              </Field>
              <Field label="Room">
                <input value={editModal.room} onChange={(e) => setEditModal((m) => ({ ...m, room: e.target.value }))} style={S.inp} />
              </Field>
              <Field label="Status">
                <select value={editModal.status} onChange={(e) => setEditModal((m) => ({ ...m, status: e.target.value }))} style={S.sel}>
                  {Object.entries(STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Students">
                <input type="number" min="0" value={editModal.students || 0} onChange={(e) => setEditModal((m) => ({ ...m, students: Number(e.target.value) }))} style={S.inp} />
              </Field>
            </div>
            <BtnP onClick={() => { onUpdateDuty(editModal); setEditModal(null); }} style={{ width: "100%", padding: 10 }}>
              Save Changes
            </BtnP>
          </>
        )}
      </Modal>

      <Modal open={sbModal} onClose={() => setSbModal(false)} title={"Add Faculty — " + fmtDate(date) + " Slot " + slot} width={490}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Faculty Name">
            <input value={sbForm.facultyName} onChange={(e) => setSbForm((f) => ({ ...f, facultyName: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Faculty ID">
            <input value={sbForm.facultyId} onChange={(e) => setSbForm((f) => ({ ...f, facultyId: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Mobile">
            <input value={sbForm.mobile} onChange={(e) => setSbForm((f) => ({ ...f, mobile: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Designation">
            <select value={sbForm.designation} onChange={(e) => setSbForm((f) => ({ ...f, designation: e.target.value }))} style={S.sel}>
              <option value="">Select...</option>
              {DESIGNATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <input value={sbForm.dept} onChange={(e) => setSbForm((f) => ({ ...f, dept: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Room">
            <input value={sbForm.room} onChange={(e) => setSbForm((f) => ({ ...f, room: e.target.value }))} style={S.inp} />
          </Field>
          <Field label="Duty Type" col="1/-1">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DUTY_TYPES.map((t) => {
                const colors = { Invigilation: C.green, IFS: C.purple, "Control Room": C.blue, Standby: C.yellow };
                const col = colors[t] || C.textMid;
                return (
                  <button
                    key={t}
                    onClick={() => setSbForm((f) => ({ ...f, dutyType: t }))}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 7,
                      border: "2px solid " + (sbForm.dutyType === t ? col : C.border),
                      background: sbForm.dutyType === t ? col + "22" : "transparent",
                      color: sbForm.dutyType === t ? col : C.textMid,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: sbForm.dutyType === t ? 800 : 400,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Students">
            <input type="number" min="0" value={sbForm.students} onChange={(e) => setSbForm((f) => ({ ...f, students: Number(e.target.value) }))} style={S.inp} />
          </Field>
        </div>
        <BtnP onClick={addSb} disabled={!sbForm.facultyName} style={{ width: "100%", padding: 10, opacity: sbForm.facultyName ? 1 : 0.5 }}>
          Add Faculty
        </BtnP>
      </Modal>
    </div>
  );
}