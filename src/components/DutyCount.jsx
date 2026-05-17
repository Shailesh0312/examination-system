import { useState, useMemo, useEffect } from "react";
import { Modal, Badge } from "./ui";
import { fmtDate, C, S, DUTY_DONE } from "../lib/constants";

export default function DutyCount({ duties }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("counted");
  const [drillFaculty, setDrillFaculty] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const stats = useMemo(() => {
    const map = {};
    const ensure = (name, id, dept, desig, mobile) => {
      const key = (id || name || "?").trim().toLowerCase();
      if (!map[key])
        map[key] = {
          facultyId: id || "",
          facultyName: name || "",
          dept: dept || "",
          designation: desig || "",
          mobile: mobile || "",
          counted: 0,
          notCounted: 0,
          absent: 0,
          late: 0,
          relieved: 0,
          reserved: 0,
          substituted: 0,
          ifsCount: 0,
          totalSlots: 0,
          allEntries: [],
        };
      return map[key];
    };
    duties.forEach((d) => {
      const e = ensure(d.facultyName, d.facultyId, d.dept, d.designation, d.mobile);
      e.totalSlots++;
      const isStandbyNotDeployed = (d.isReserved || d.status === "reserved") && !d.substituteFor;
      const isCounted = !isStandbyNotDeployed && DUTY_DONE.has(d.status);
      e.allEntries.push({
        date: d.date,
        slot: d.slot,
        room: d.room || "-",
        dutyType: d.dutyType,
        status: d.status,
        substituteFor: d.substituteFor || null,
        isReserved: d.isReserved,
        incident: d.incident || null,
        counted: isCounted,
      });
      if (isStandbyNotDeployed) { e.reserved++; e.notCounted++; }
      else if (DUTY_DONE.has(d.status)) { e.counted++; }
      else { e.notCounted++; }
      if (d.status === "absent") e.absent++;
      if (d.status === "late") e.late++;
      if (d.status === "relieved") e.relieved++;
      if (d.substituteFor && DUTY_DONE.has(d.status)) e.substituted++;
      if (d.dutyType === "IFS" || d.status === "ifs") e.ifsCount++;
    });
    return Object.values(map);
  }, [duties]);

  const filtered = useMemo(() => {
    let r = stats;
    if (search) r = r.filter((x) => (x.facultyName + x.facultyId + x.dept + x.mobile).toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
  }, [stats, search, sortKey]);

  const maxCounted = Math.max(...filtered.map((x) => x.counted), 1);

  const drillData = useMemo(() => {
    if (!drillFaculty) return null;
    const entries = [...drillFaculty.allEntries].sort((a, b) => a.date.localeCompare(b.date) || (a.slot || "").localeCompare(b.slot || ""));
    return { counted: entries.filter((e) => e.counted), notCounted: entries.filter((e) => !e.counted) };
  }, [drillFaculty]);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Duty Count</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Per-faculty semester breakdown. Click any row for full detail.</div>
      <div style={{ ...S.card, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.textMid, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Counted:</span>
        {[...DUTY_DONE].map((s) => <Badge key={s} type={s} />)}
        <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>| Standby not deployed → NOT counted</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...S.inp, width: isMobile ? '100%' : 220 }} />
        <span style={{ fontSize: 11, color: C.textMid }}>Sort:</span>
        {[
          ["counted", "Count"],
          ["substituted", "Subst."],
          ["absent", "Absent"],
          ["relieved", "Relieved"],
          ["ifsCount", "IFS"],
          ["totalSlots", "Total"],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setSortKey(k)} style={{ padding: "5px 11px", borderRadius: 6, border: "1px solid " + (sortKey === k ? C.primary : C.border), background: sortKey === k ? "#8B000022" : "transparent", color: sortKey === k ? C.primaryL : C.textMid, cursor: "pointer", fontSize: 11, fontWeight: sortKey === k ? 700 : 400 }}>
            {l}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: C.textDim, padding: "40px 0" }}>No records.</div>
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Faculty", "Dept", "Done ✓", "Subst.", "Absent", "Late", "Relieved", "Standby", "IFS", "Total", "Progress"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.facultyId || r.facultyName || i} onClick={() => setDrillFaculty(r)} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#1e2d5520"} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#ffffff03"}>
                  <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700, color: C.text }}>{r.facultyName}</div>
                    {r.mobile && <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</div>}
                    {r.designation && <div style={{ fontSize: 11, color: C.purple }}>{r.designation}</div>}
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{r.dept || "-"}</td>
                  <td style={{ ...S.td, fontWeight: 900, color: C.green, fontSize: 18, textAlign: "center" }}>{r.counted}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.substituted > 0 ? C.teal : C.textDim, textAlign: "center" }}>{r.substituted || 0}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.absent > 0 ? C.red : C.textDim, textAlign: "center" }}>{r.absent || 0}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.late > 0 ? C.orange : C.textDim, textAlign: "center" }}>{r.late || 0}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.relieved > 0 ? C.purple : C.textDim, textAlign: "center" }}>{r.relieved || 0}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.reserved > 0 ? C.yellow : C.textDim, textAlign: "center" }}>{r.reserved || 0}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: r.ifsCount > 0 ? C.purple : C.textDim, textAlign: "center" }}>{r.ifsCount || "—"}</td>
                  <td style={{ ...S.td, color: C.textMid, textAlign: "center" }}>{r.totalSlots}</td>
                  <td style={{ ...S.td, minWidth: 120 }}>
                    <div style={{ height: 8, borderRadius: 4, background: C.textDim + "44", overflow: "hidden" }}><div style={{ height: "100%", width: Math.round((r.counted / maxCounted) * 100) + "%", background: C.accentGrad, borderRadius: 4 }} /></div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{r.totalSlots > 0 ? Math.round((r.counted / r.totalSlots) * 100) : 0}% of {r.totalSlots}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!drillFaculty} onClose={() => setDrillFaculty(null)} title={"Faculty Detail — " + (drillFaculty?.facultyName || "")} width={680}>
        {drillFaculty && drillData && (
          <>
            <div style={{ background: C.headerGrad, borderRadius: 10, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{drillFaculty.facultyName}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {drillFaculty.facultyId && <span style={{ fontSize: 11, color: C.gold, fontFamily: "monospace", background: C.gold + "16", borderRadius: 4, padding: "2px 8px" }}>{drillFaculty.facultyId}</span>}
                  {drillFaculty.mobile && <span style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>📞 {drillFaculty.mobile}</span>}
                  {drillFaculty.designation && <span style={{ fontSize: 11, color: C.purple }}>{drillFaculty.designation}</span>}
                  {drillFaculty.dept && <span style={{ fontSize: 11, color: C.textMid }}>{drillFaculty.dept}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  [drillFaculty.counted, C.green, "Done"],
                  [drillFaculty.absent, C.red, "Absent"],
                  [drillFaculty.late, C.orange, "Late"],
                  [drillFaculty.relieved, C.purple, "Relieved"],
                  [drillFaculty.reserved, C.yellow, "Standby"],
                  [drillFaculty.totalSlots, C.blue, "Total"],
                ].map(([v, col, l]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 7, padding: "8px 14px", textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: col }}>{v}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Counted Duties ({drillData.counted.length})</div>
              {drillData.counted.length === 0 ? (
                <div style={{ fontSize: 12, color: C.textDim, padding: "10px 14px", border: "1px dashed " + C.border, borderRadius: 7 }}>No counted duties yet.</div>
              ) : (
                <div style={{ ...S.card, overflowX: "auto", border: "1px solid " + C.green + "33" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={S.th}>Date</th><th style={S.th}>Slot</th><th style={S.th}>Room</th><th style={S.th}>Type</th><th style={S.th}>Status</th><th style={S.th}>Note</th></tr></thead>
                    <tbody>
                      {drillData.counted.map((e, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{fmtDate(e.date)}</td>
                          <td style={{ ...S.td, color: C.gold, fontWeight: 700 }}>Slot {e.slot}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: C.primaryL, fontWeight: 700 }}>{e.room}</td>
                          <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{e.dutyType}</td>
                          <td style={S.td}><Badge type={e.status} /></td>
                          <td style={{ ...S.td, fontSize: 11, color: C.teal }}>{e.substituteFor ? "Sub for " + e.substituteFor : e.incident?.note || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {drillData.notCounted.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Not Counted ({drillData.notCounted.length})</div>
                <div style={{ ...S.card, overflowX: "auto", border: "1px solid " + C.red + "33" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={S.th}>Date</th><th style={S.th}>Slot</th><th style={S.th}>Room</th><th style={S.th}>Type</th><th style={S.th}>Status</th><th style={S.th}>Note</th></tr></thead>
                    <tbody>
                      {drillData.notCounted.map((e, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{fmtDate(e.date)}</td>
                          <td style={{ ...S.td, color: C.gold, fontWeight: 700 }}>Slot {e.slot}</td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: C.textMid }}>{e.room}</td>
                          <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{e.dutyType}</td>
                          <td style={S.td}><Badge type={e.status} /></td>
                          <td style={{ ...S.td, fontSize: 11, color: C.textMid }}>{e.incident?.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}