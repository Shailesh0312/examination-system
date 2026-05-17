import { useState, useEffect, useRef } from "react";
import { DateSlotPicker, BtnP, BtnG, Badge } from "./ui";
import {
  fmtDate,
  C,
  S,
  smartAllocate,
  uid,
  DESIGNATIONS,
} from "../lib/constants";
import { XLSX_CDN } from "../lib/supabase";

function parseXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) {
          reject(new Error("XLSX library not loaded."));
          return;
        }
        const wb = XLSX.read(ev.target.result, { type: "array" });
        let rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          defval: "",
        });
        if (!rows.length) {
          resolve([]);
          return;
        }
        if (Array.isArray(rows[0])) {
          const hdrs = rows[0].map((h) => String(h || "").trim());
          rows = rows.slice(1).map((r) => {
            const o = {};
            hdrs.forEach((h, i) => (o[h] = r[i] || ""));
            return o;
          });
        }
        resolve(rows);
      } catch (ex) {
        reject(ex);
      }
    };
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsArrayBuffer(file);
  });
}

export default function ImportPanel({
  duties,
  onImportConfirm,
  date,
  setDate,
  slot,
  setSlot,
  setFacultyMaster,
  isReadOnly,
  saving,
}) {
  const [preview, setPreview] = useState([]);
  const [err, setErr] = useState("");
  const [roomRows, setRoomRows] = useState([{ room: "", students: "" }]);
  const [facultyRows, setFacRows] = useState([]);
  const roomFileRef = useRef();
  const facFileRef = useRef();

  useEffect(() => {
    setPreview([]);
    setErr("");
  }, [date, slot]);

  useEffect(() => {
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = XLSX_CDN;
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  const handleRoomFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErr("");
    try {
      const rows = await parseXLSXFile(file);
      if (!rows.length) {
        setErr("No data found.");
        return;
      }
      const sample = rows.find((r) => Object.keys(r).length > 0) || {};
      const find = (keys) =>
        Object.keys(sample).find((k) =>
          keys.some((kk) => String(k).toLowerCase().includes(kk.toLowerCase()))
        );
      const roomKey = find(["room", "hall", "venue", "block", "centre"]);
      const stuKey = find([
        "student",
        "count",
        "strength",
        "enroll",
        "appear",
        "total",
        "number",
      ]);
      if (!roomKey) {
        setErr("Room column not found. Found: " + Object.keys(sample).join(", "));
        return;
      }
      const parsed = rows
        .map((r) => ({
          room: String(r[roomKey] || "").trim(),
          students:
            Number(String(r[stuKey] || "").replace(/[^0-9]/g, "")) || 0,
        }))
        .filter(
          (r) => r.room && r.room.toLowerCase() !== "room"
        );
      if (!parsed.length) {
        setErr("No valid room rows.");
        return;
      }
      setRoomRows(parsed);
    } catch (ex) {
      setErr("Parse error: " + ex.message);
    }
    e.target.value = "";
  };

  const handleFacFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErr("");
    try {
      const rows = await parseXLSXFile(file);
      if (!rows.length) {
        setErr("No data found.");
        return;
      }
      const sample =
        rows.find((r) => Object.values(r).some((v) => String(v || "").trim())) || {};
      const find = (keys) =>
        Object.keys(sample).find((k) =>
          keys.some((kk) => String(k).toLowerCase().includes(kk.toLowerCase()))
        );
      const nameKey = find([
        "faculty name",
        "name",
        "faculty",
        "teacher",
        "instructor",
        "staff",
      ]);
      const idKey = find(["faculty id", "emp id", "employee id", "id", "code", "empid"]);
      const mobileKey = find(["mobile", "phone", "contact", "cell", "mob"]);
      const deptKey = find(["department", "dept", "branch", "school"]);
      const desigKey = find(["designation", "post", "rank", "position", "title"]);
      if (!nameKey) {
        setErr("Name column not found. Columns: " + Object.keys(sample).join(", "));
        return;
      }
      const parsed = rows
        .map((r, i) => ({
          id: String(r[idKey] || "F-" + (i + 1)).trim(),
          facultyId: String(r[idKey] || "F-" + (i + 1)).trim(),
          facultyName: String(r[nameKey] || "").trim(),
          dept: String(r[deptKey] || "").trim(),
          designation: String(r[desigKey] || "").trim(),
          mobile: String(r[mobileKey] || "").trim(),
        }))
        .filter(
          (r) => r.facultyName && r.facultyName.toLowerCase() !== "name"
        );
      if (!parsed.length) {
        setErr("No valid faculty rows.");
        return;
      }
      setFacRows(parsed);
      setFacultyMaster(parsed);
    } catch (ex) {
      setErr("Parse error: " + ex.message);
    }
    e.target.value = "";
  };

  const getRoomDefs = () =>
    roomRows
      .filter((r) => String(r.room).trim())
      .map((r) => ({ room: String(r.room).trim(), students: Number(r.students) || 0 }));
  const slotsNeeded = getRoomDefs().reduce((a, r) => a + (r.students > 56 ? 3 : 2), 0);
  const deficiency = slotsNeeded - facultyRows.length;

  const doAssign = () => {
    if (!date) {
      setErr("Select a date.");
      return;
    }
    const roomDefs = getRoomDefs();
    if (!roomDefs.length) {
      setErr("No valid rooms.");
      return;
    }
    if (!facultyRows.length) {
      setErr("No faculty loaded.");
      return;
    }
    const { assigned, reserved } = smartAllocate(
      facultyRows,
      roomDefs,
      date,
      slot,
      duties
    );
    setPreview([...assigned, ...reserved]);
    setErr("");
  };

  const confirmImport = () => {
    onImportConfirm(preview, date, slot);
    setPreview([]);
  };
  const updateRoom = (i, f, v) =>
    setRoomRows((prev) => prev.map((x, j) => (j === i ? { ...x, [f]: v } : x)));
  const previewAssigned = preview.filter((p) => !p.isReserved);
  const previewRes = preview.filter((p) => p.isReserved);

  if (isReadOnly)
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: C.textDim }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.textMid }}>
          View Only Mode
        </div>
      </div>
    );
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>
        Import & Assign Duties
      </div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>
        Select date and slot first, then upload your sheets.
      </div>
      <div style={{ marginBottom: 16 }}>
        <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
      </div>
      {!date && (
        <div
          style={{
            background: "#fbbf2410",
            border: "1px solid " + C.yellow + "44",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: C.yellow,
          }}
        >
          ⚠ Please select a date before importing.
        </div>
      )}
      {(getRoomDefs().length > 0 || facultyRows.length > 0) && (
        <div
          style={{
            ...S.card,
            padding: "12px 18px",
            marginBottom: 16,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: C.textMid }}>Rooms:</span>
            <b style={{ color: C.text, marginLeft: 4 }}>{getRoomDefs().length}</b>
          </div>
          <div>
            <span style={{ fontSize: 12, color: C.textMid }}>Slots needed:</span>
            <b style={{ color: C.orange, marginLeft: 4 }}>{slotsNeeded}</b>
          </div>
          <div>
            <span style={{ fontSize: 12, color: C.textMid }}>Faculty loaded:</span>
            <b style={{ color: C.text, marginLeft: 4 }}>{facultyRows.length}</b>
          </div>
          {deficiency > 0 && (
            <div
              style={{
                background: C.red + "18",
                border: "1.5px solid " + C.red + "55",
                borderRadius: 7,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: C.red,
              }}
            >
              {deficiency} faculty SHORT
            </div>
          )}
          {deficiency <= 0 && facultyRows.length > 0 && (
            <div
              style={{
                background: C.green + "18",
                border: "1px solid " + C.green + "44",
                borderRadius: 7,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: C.green,
              }}
            >
              Sufficient — {-deficiency} reserved
            </div>
          )}
        </div>
      )}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
      >
        <div
          style={{
            ...S.card,
            padding: 18,
            border: "2px solid " + (getRoomDefs().length > 0 ? C.green : C.border),
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: getRoomDefs().length > 0 ? C.green : C.text,
                }}
              >
                Step 1 — Room List {getRoomDefs().length > 0 ? "✓" : ""}
              </div>
              <div style={{ fontSize: 11, color: C.textMid }}>
                Columns: Room, Students
              </div>
            </div>
            <div>
              <input
                ref={roomFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleRoomFile}
                style={{ display: "none" }}
              />
              <BtnP onClick={() => roomFileRef.current.click()} style={{ fontSize: 12, padding: "7px 14px" }}>
                Upload Excel
              </BtnP>
            </div>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, fontSize: 10 }}>Room</th>
                  <th style={{ ...S.th, fontSize: 10 }}>Students</th>
                  <th style={{ ...S.th, fontSize: 10, color: C.orange, textAlign: "center" }}>Need</th>
                  <th style={{ ...S.th, fontSize: 10, width: 24 }}></th>
                </tr>
              </thead>
              <tbody>
                {roomRows.map((r, i) => {
                  const n = Number(r.students || 0);
                  const need = n > 56 ? 3 : 2;
                  return (
                    <tr key={i}>
                      <td style={{ padding: "3px 4px" }}>
                        <input
                          value={r.room}
                          onChange={(e) => updateRoom(i, "room", e.target.value)}
                          style={{ ...S.inp, padding: "5px 7px", fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: "3px 4px" }}>
                        <input
                          type="number"
                          min="0"
                          value={r.students}
                          onChange={(e) => updateRoom(i, "students", e.target.value)}
                          style={{ ...S.inp, padding: "5px 7px", fontSize: 12 }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "3px 8px",
                          fontWeight: 800,
                          color: n > 56 ? C.orange : C.green,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {need}
                      </td>
                      <td style={{ padding: "3px 4px" }}>
                        <button
                          onClick={() => setRoomRows((prev) => prev.filter((_, j) => j !== i))}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: C.textDim,
                            fontSize: 16,
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setRoomRows((prev) => [...prev, { room: "", students: "" }])}
            style={{ ...S.btnG, width: "100%", marginTop: 8, fontSize: 12 }}
          >
            + Add Room
          </button>
        </div>
        <div
          style={{
            ...S.card,
            padding: 18,
            border: "2px solid " + (facultyRows.length > 0 ? C.green : C.border),
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: facultyRows.length > 0 ? C.green : C.text,
                }}
              >
                Step 2 — Faculty List {facultyRows.length > 0 ? "✓" : ""}
              </div>
              <div style={{ fontSize: 11, color: C.textMid }}>
                Columns: Name, ID, Mobile, Designation, Dept
              </div>
            </div>
            <div>
              <input
                ref={facFileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFacFile}
                style={{ display: "none" }}
              />
              <BtnP onClick={() => facFileRef.current.click()} style={{ fontSize: 12, padding: "7px 14px" }}>
                Upload Excel
              </BtnP>
            </div>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {facultyRows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: C.textDim,
                  fontSize: 12,
                  padding: "30px 0",
                  border: "1px dashed " + C.border,
                  borderRadius: 7,
                }}
              >
                Upload faculty Excel
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, fontSize: 10 }}>#</th>
                    <th style={{ ...S.th, fontSize: 10 }}>Name</th>
                    <th style={{ ...S.th, fontSize: 10 }}>ID</th>
                    <th style={{ ...S.th, fontSize: 10 }}>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyRows.map((f, i) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{i + 1}</td>
                      <td style={{ ...S.td, fontWeight: 600, fontSize: 12 }}>
                        {f.facultyName}
                      </td>
                      <td style={{ ...S.td, fontSize: 11, color: C.gold, fontFamily: "monospace" }}>
                        {f.facultyId}
                      </td>
                      <td style={{ ...S.td, fontSize: 11, color: C.teal, fontFamily: "monospace" }}>
                        {f.mobile || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {facultyRows.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: C.green, fontWeight: 700 }}>
              {facultyRows.length} faculty loaded
            </div>
          )}
          {facultyRows.length > 0 && (
            <button
              onClick={() => setFacRows([])}
              style={{ ...S.btnG, marginTop: 6, fontSize: 11, padding: "4px 12px", color: C.red, borderColor: C.red + "44" }}
            >
              Clear List
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <BtnP
          onClick={doAssign}
          disabled={!facultyRows.length || !getRoomDefs().length || !date}
          style={{
            fontSize: 14,
            padding: "11px 28px",
            opacity: facultyRows.length && getRoomDefs().length && date ? 1 : 0.5,
          }}
        >
          Auto-Assign Randomly
        </BtnP>
        {err && (
          <span style={{ fontSize: 12, color: C.red, background: "#ef44440f", padding: "7px 12px", borderRadius: 5 }}>
            ⚠ {err}
          </span>
        )}
      </div>
      {preview.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 16,
              padding: "14px 18px",
              background: "#111a38",
              border: "1px solid " + C.border2,
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                {fmtDate(date)} — Slot {slot}
              </span>
              <span
                style={{
                  fontSize: 12,
                  background: C.green + "18",
                  color: C.green,
                  border: "1px solid " + C.green + "44",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontWeight: 700,
                }}
              >
                {previewAssigned.length} Assigned
              </span>
              <span
                style={{
                  fontSize: 12,
                  background: "#fbbf2418",
                  color: C.yellow,
                  border: "1px solid " + C.yellow + "44",
                  borderRadius: 5,
                  padding: "3px 10px",
                  fontWeight: 700,
                }}
              >
                {previewRes.length} Standby
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <BtnG onClick={doAssign}>↺ Res</BtnG>
              <BtnG onClick={() => setPreview([])} style={{ color: C.red, borderColor: C.red + "44" }}>
                ✕ Cancel
              </BtnG>
              <BtnP
                onClick={confirmImport}
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg," + C.green + ",#077a4f)",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "✓ Confirm & Save"}
              </BtnP>
            </div>
          </div>
          <div style={{ ...S.card, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={S.th}>Room</th>
                  <th style={S.th}>Faculty Name</th>
                  <th style={S.th}>Dept</th>
                  <th style={S.th}>ID</th>
                  <th style={S.th}>Mobile</th>
                  <th style={S.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                {previewAssigned.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 800, color: C.primaryL }}>
                      {r.room}
                    </td>
                    <td style={{ ...S.td, fontWeight: 600 }}>{r.facultyName}</td>
                    <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{r.dept}</td>
                    <td style={{ ...S.td, fontSize: 11, color: C.gold, fontFamily: "monospace" }}>{r.facultyId}</td>
                    <td style={{ ...S.td, fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile || "-"}</td>
                    <td style={S.td}>
                      <Badge type={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewRes.length > 0 && (
            <div
              style={{
                marginTop: 12,
                background: "#fbbf2406",
                border: "1px solid " + C.yellow + "44",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.yellow,
                  marginBottom: 8,
                }}
              >
                STANDBY ({previewRes.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {previewRes.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: "#111a38",
                      border: "1px solid " + C.yellow + "33",
                      borderRadius: 7,
                      padding: "7px 12px",
                      fontSize: 12,
                    }}
                  >
                    <b style={{ color: C.text }}>{r.facultyName}</b>
                    {r.mobile && (
                      <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>
                        {r.mobile}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}