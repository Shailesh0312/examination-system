import { useState, useMemo } from "react";
import { BtnP, BtnG } from "./ui";
import { fmtDate, C, S, DUTY_DONE } from "../lib/constants";

export default function FacultyLookup({ duties = [] }) {
  const [search, setSearch] = useState("");
  const [viewDuties, setViewDuties] = useState(null);

  const facultyList = useMemo(() => {
    const map = {};
    duties.forEach((d) => {
      const key = (d.facultyId || d.facultyName || "").trim().toLowerCase();
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          facultyId: d.facultyId || "",
          facultyName: d.facultyName || "",
          dept: d.dept || "",
          designation: d.designation || "",
          mobile: d.mobile || "",
          duties: [],
        };
      }
      map[key].duties.push(d);
    });
    return Object.values(map).sort((a, b) => (a.facultyName || "").localeCompare(b.facultyName || ""));
  }, [duties]);

  const filtered = useMemo(() => {
    if (!search) return [];
    const term = search.toLowerCase();
    return facultyList.filter(
      (f) =>
        (f.facultyName || "").toLowerCase().includes(term) ||
        (f.facultyId || "").toLowerCase().includes(term) ||
        (f.dept || "").toLowerCase().includes(term) ||
        (f.mobile || "").includes(term)
    );
  }, [facultyList, search]);

  const handleExportCSV = (faculty) => {
    if (!faculty.duties.length) return;
    const rows = [["Date", "Slot", "Room", "Duty Type", "Status"]];
    faculty.duties.forEach((d) => {
      rows.push([d.date, d.slot, d.room || "-", d.dutyType || "Invigilation", d.status || "present"]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${faculty.facultyName || "faculty"}_duties.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewData = useMemo(() => {
    if (!viewDuties) return null;
    const sorted = [...viewDuties.duties].sort((a, b) => {
      const dateCmp = (a.date || "").localeCompare(b.date || "");
      if (dateCmp !== 0) return dateCmp;
      return (a.slot || "").localeCompare(b.slot || "");
    });
    const counted = sorted.filter((d) => DUTY_DONE.has(d.status));
    const notCounted = sorted.filter((d) => !DUTY_DONE.has(d.status));
    return { sorted, counted, notCounted };
  }, [viewDuties]);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Faculty Lookup</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        Search faculty duties across all sessions.
      </div>

      <div style={{ ...S.card, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name, ID, department or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...S.inp, width: 320 }}
          />
          <span style={{ fontSize: 12, color: C.textDim }}>
            {filtered.length > 0 ? `${filtered.length} results` : ""}
          </span>
        </div>
      </div>

      {filtered.length > 0 && (
        <div style={{ ...S.card, overflowX: "auto", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Faculty", "Department", "Designation", "Mobile", "Total Duties", "Actions"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const total = f.duties.length;
                const done = f.duties.filter((d) => DUTY_DONE.has(d.status)).length;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                    <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{f.facultyName || "-"}</td>
                    <td style={{ ...S.td, color: C.textMid }}>{f.dept || "-"}</td>
                    <td style={{ ...S.td, color: C.purple }}>{f.designation || "-"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.teal }}>{f.mobile || "-"}</td>
                    <td style={{ ...S.td, fontWeight: 700, textAlign: "center" }}>
                      <span style={{ color: C.green }}>{done}</span>
                      <span style={{ color: C.textDim }}> / </span>
                      <span>{total}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <BtnG onClick={() => setViewDuties(f)} style={{ padding: "5px 12px", fontSize: 11 }}>
                          View
                        </BtnG>
                        <BtnG onClick={() => handleExportCSV(f)} style={{ padding: "5px 12px", fontSize: 11 }}>
                          CSV
                        </BtnG>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {search && filtered.length === 0 && (
        <div style={{ textAlign: "center", color: C.textDim, padding: "30px 0" }}>
          No faculty found matching "{search}".
        </div>
      )}

      {!search && (
        <div style={{ textAlign: "center", color: C.textDim, padding: "30px 0" }}>
          Enter a search term to find faculty and their duties.
        </div>
      )}

      {viewDuties && viewData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setViewDuties(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111a38",
              border: "1px solid #2a3f72",
              borderRadius: 13,
              padding: 28,
              width: 700,
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 32px 80px #000e",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                {viewDuties.facultyName}
              </span>
              <button
                onClick={() => setViewDuties(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#8fa8d0",
                  fontSize: 26,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ background: C.headerGrad, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              {viewDuties.facultyId && (
                <span style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", background: C.gold + "16", borderRadius: 4, padding: "2px 8px" }}>
                  {viewDuties.facultyId}
                </span>
              )}
              {viewDuties.dept && <span style={{ fontSize: 12, color: C.textMid }}>{viewDuties.dept}</span>}
              {viewDuties.designation && <span style={{ fontSize: 12, color: C.purple }}>{viewDuties.designation}</span>}
              {viewDuties.mobile && <span style={{ fontSize: 12, color: C.teal, fontFamily: "monospace" }}>📞 {viewDuties.mobile}</span>}
              <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: C.green }}>{viewData.counted.length}</span>
                <span style={{ color: C.textDim }}> / </span>
                <span style={{ color: C.text }}>{viewDuties.duties.length}</span>
                <span style={{ color: C.textDim, fontSize: 11, marginLeft: 4 }}>duties</span>
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Counted Duties ({viewData.counted.length})
              </div>
              {viewData.counted.length === 0 ? (
                <div style={{ fontSize: 12, color: C.textDim, padding: "10px 14px", border: "1px dashed " + C.border, borderRadius: 7 }}>
                  No counted duties.
                </div>
              ) : (
                <div style={{ ...S.card, overflowX: "auto", border: "1px solid " + C.green + "33" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Date</th>
                        <th style={S.th}>Slot</th>
                        <th style={S.th}>Room</th>
                        <th style={S.th}>Type</th>
                        <th style={S.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewData.counted.map((d, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{fmtDate(d.date)}</td>
                          <td style={{ ...S.td, color: C.gold, fontWeight: 700 }}>{d.slot}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: C.primaryL }}>{d.room || "-"}</td>
                          <td style={{ ...S.td, fontSize: 12 }}>{d.dutyType || "Invigilation"}</td>
                          <td style={S.td}>
                            <span style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: C.green + "22",
                              color: C.green,
                            }}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {viewData.notCounted.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  Not Counted ({viewData.notCounted.length})
                </div>
                <div style={{ ...S.card, overflowX: "auto", border: "1px solid " + C.red + "33" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Date</th>
                        <th style={S.th}>Slot</th>
                        <th style={S.th}>Room</th>
                        <th style={S.th}>Type</th>
                        <th style={S.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewData.notCounted.map((d, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{fmtDate(d.date)}</td>
                          <td style={{ ...S.td, color: C.gold, fontWeight: 700 }}>{d.slot}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: C.textMid }}>{d.room || "-"}</td>
                          <td style={{ ...S.td, fontSize: 12 }}>{d.dutyType || "Invigilation"}</td>
                          <td style={S.td}>
                            <span style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: C.red + "22",
                              color: C.red,
                            }}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}