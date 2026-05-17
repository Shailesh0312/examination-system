import { useState, useEffect, useMemo } from "react";
import { Badge } from "./ui";
import { fmtDate, C, S } from "../lib/constants";

export default function History({ duties }) {
  const days = useMemo(() => {
    const seen = new Set();
    const out = [];
    duties.forEach((d) => {
      const k = d.date + "|" + d.slot;
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ date: d.date, slot: d.slot, key: k });
      }
    });
    return out.sort((a, b) => b.date.localeCompare(a.date) || b.slot.localeCompare(a.slot));
  }, [duties]);

  const [sel, setSel] = useState(null);
  useEffect(() => { if (days.length && !sel) setSel(days[0]); }, [days]);

  const selRows = sel ? duties.filter((d) => d.date === sel.date && d.slot === sel.slot) : [];
  const assigned = selRows.filter((r) => !r.isReserved && r.status !== "reserved");
  const issues = assigned.filter((r) => r.status !== "present");
  const subs = assigned.filter((r) => r.substituteFor);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>History</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>All saved duty sessions</div>
      {days.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: C.textDim }}>No sessions recorded yet.</div>
      ) : (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: "0 0 220px", maxHeight: "80vh", overflowY: "auto" }}>
            {days.map((d) => {
              const r = duties.filter((x) => x.date === d.date && x.slot === d.slot);
              const inc = r.filter((x) => x.status !== "present" && x.status !== "reserved").length;
              const sub = r.filter((x) => x.substituteFor).length;
              return (
                <div key={d.key} onClick={() => setSel(d)} style={{ padding: "11px 14px", borderRadius: 8, marginBottom: 5, cursor: "pointer", border: "1px solid " + (sel?.key === d.key ? C.border2 : C.border), background: sel?.key === d.key ? "#111a38" : "transparent" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{fmtDate(d.date)}</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                    Slot {d.slot} — {r.length} total
                    {sub > 0 && <span style={{ color: C.teal, marginLeft: 6 }}>S{sub}</span>}
                    {inc > 0 && <span style={{ color: C.red, marginLeft: 6 }}>I{inc}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {sel ? (
              <>
                <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtDate(sel.date)} — Slot {sel.slot}</span>
                  <span style={{ fontSize: 12, color: C.textMid }}>{assigned.length} assigned · {issues.length} incidents · {subs.length} substitutions</span>
                </div>
                <div style={{ ...S.card, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={S.th}>#</th><th style={S.th}>Faculty</th><th style={S.th}>Room</th><th style={S.th}>Type</th><th style={S.th}>Status</th><th style={S.th}>Subst. For</th></tr></thead>
                    <tbody>
                      {assigned.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                          <td style={{ ...S.td, color: C.textMid, fontSize: 11 }}>{i + 1}</td>
                          <td style={S.td}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.facultyName}</div>
                            {r.mobile && <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>{r.mobile}</div>}
                          </td>
                          <td style={{ ...S.td, fontFamily: "monospace", color: C.primaryL, fontWeight: 700 }}>{r.room || "-"}</td>
                          <td style={{ ...S.td, fontSize: 12, color: C.textMid }}>{r.dutyType}</td>
                          <td style={S.td}><Badge type={r.status} /></td>
                          <td style={{ ...S.td, fontSize: 12, color: r.substituteFor ? C.orange : C.textMid }}>{r.substituteFor || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: C.textDim, fontSize: 13, border: "1px dashed " + C.border, borderRadius: 10 }}>Select a session</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}