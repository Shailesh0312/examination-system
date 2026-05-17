import { useMemo, useState, useEffect } from "react";
import { DateSlotPicker, StatCard, Badge } from "./ui";
import { fmtDate, C, S } from "../lib/constants";

export default function Dashboard({
  duties,
  controlRows,
  setView,
  date,
  setDate,
  slot,
  setSlot,
  isReadOnly,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rows = duties.filter(
    (d) =>
      d.date === date &&
      d.slot === slot &&
      !d.isReserved &&
      d.status !== "reserved"
  );
  const reserved = duties.filter(
    (d) =>
      d.date === date &&
      d.slot === slot &&
      (d.isReserved || d.status === "reserved")
  );
  const ctrl = controlRows.filter((r) => r.date === date && r.slot === slot);
  const cnt = (k) => rows.filter((r) => r.status === k).length;
  const subs = duties.filter(
    (d) => d.date === date && d.slot === slot && d.substituteFor
  );
  const allDays = useMemo(() => {
    const s = new Set();
    duties.forEach((d) => s.add(d.date));
    return s.size;
  }, [duties]);
  const issues = rows.filter((r) => r.status !== "present");

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}
          >
            Dashboard
          </div>
          <div style={{ fontSize: 13, color: C.textMid }}>
            {date ? fmtDate(date) : "No date selected"} — Slot {slot}
          </div>
        </div>
        <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard value={rows.length} label="Assigned" color={C.green} />
        <StatCard value={cnt("absent")} label="Absent" color={C.red} />
        <StatCard value={subs.length} label="Substituted" color={C.teal} />
        <StatCard value={cnt("late")} label="Late" color={C.orange} />
        <StatCard value={reserved.length} label="Reserved" color={C.yellow} />
        <StatCard value={ctrl.length} label="Control Rm" color={C.blue} />
      </div>
      {ctrl.length > 0 && (
        <div
          style={{
            ...S.card,
            padding: "14px 20px",
            marginBottom: 20,
            border: "1.5px solid " + C.blue + "55",
            background: C.blue + "08",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.blue,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 10,
            }}
          >
            Control Room Staff
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ctrl.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "#111a38",
                  border: "1px solid " + C.blue + "44",
                  borderRadius: 7,
                  padding: "8px 14px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: C.blue }}>
                  {r.facultyName}
                </div>
                <div style={{ fontSize: 11, color: C.textMid }}>
                  {r.controlRole || "Control Room"}
                </div>
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
      {subs.length > 0 && (
        <div
          style={{
            ...S.card,
            padding: "14px 20px",
            marginBottom: 20,
            border: "1.5px solid " + C.teal + "55",
            background: C.teal + "08",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.teal,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 10,
            }}
          >
            Active Substitutions
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {subs.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "#111a38",
                  border: "1px solid " + C.teal + "44",
                  borderRadius: 7,
                  padding: "8px 14px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>
                  {s.facultyName}
                </div>
                <div style={{ fontSize: 11, color: C.textMid }}>
                  Room {s.room} — for{" "}
                  <b style={{ color: C.orange }}>{s.substituteFor}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}
      >
        <div style={{ ...S.card, padding: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.textMid,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Today Roster
          </div>
          {rows.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: C.textDim,
                fontSize: 13,
                padding: "24px 0",
              }}
            >
              No duties loaded.
            </div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "8px 0",
                    borderBottom: "1px solid " + C.border,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      {r.facultyName}
                    </div>
                    {r.mobile && (
                      <div style={{ fontSize: 11, color: C.teal, fontFamily: "monospace" }}>
                        {r.mobile}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: C.textMid, fontFamily: "monospace" }}>
                      {r.room || "-"}
                    </div>
                  </div>
                  <Badge type={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ ...S.card, padding: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.textMid,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Active Issues
          </div>
          {issues.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: C.textDim,
                fontSize: 13,
                padding: "24px 0",
              }}
            >
              No incidents today.
            </div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {issues.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "8px 10px",
                    background: C.bg,
                    borderRadius: 6,
                    marginBottom: 6,
                    border: "1px solid " + C.border,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      {r.facultyName}
                    </span>
                    <Badge type={r.status} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, fontFamily: "monospace" }}>
                    {r.room || "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          ...S.card,
          padding: "14px 22px",
          display: "flex",
          gap: 36,
          flexWrap: "wrap",
        }}
      >
        {[
          [duties.length, "Total Entries", C.primaryL],
          [
            duties.filter((d) => d.status !== "present" && d.status !== "reserved")
              .length,
            "Total Incidents",
            C.red,
          ],
          [duties.filter((d) => d.substituteFor).length, "Total Substitutions", C.teal],
          [allDays, "Days Logged", C.gold],
        ].map(([v, l, color]) => (
          <div key={l}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{v}</div>
            <div
              style={{
                fontSize: 11,
                color: C.textMid,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}