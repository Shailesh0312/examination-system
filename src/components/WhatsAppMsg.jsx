import { useState, useMemo } from "react";
import { DateSlotPicker, StatCard } from "./ui";
import { fmtDate, C, S } from "../lib/constants";

export default function WhatsAppMsg({ duties = [] }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("I");
  const [selected, setSelected] = useState(new Set());

  const dayDuties = useMemo(() => {
    if (!date) return [];
    return duties.filter((d) => d.date === date && d.slot === slot);
  }, [duties, date, slot]);

  const stats = useMemo(() => {
    const total = dayDuties.length;
    const withMobile = dayDuties.filter((d) => d.mobile).length;
    const selectedCount = selected.size;
    return { total, withMobile, selectedCount };
  }, [dayDuties, selected]);

  const toggleSelect = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  const selectAll = () => {
    const allIds = new Set(dayDuties.filter((d) => d.mobile).map((d) => d.id));
    setSelected(allIds);
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const getWhatsAppLink = (mobile, msg) => {
    const cleanMobile = (mobile || "").replace(/\D/g, "");
    const encodedMsg = encodeURIComponent(msg);
    return `https://wa.me/${cleanMobile}?text=${encodedMsg}`;
  };

  const handleSendMessage = (msg) => {
    const selectedDuties = dayDuties.filter((d) => selected.has(d.id) && d.mobile);
    selectedDuties.forEach((d) => {
      const link = getWhatsAppLink(d.mobile, msg);
      window.open(link, "_blank");
    });
  };

  const templates = [
    { label: "Duty Reminder", msg: `Dear Faculty,\n\nThis is a reminder for your invigilation duty on ${fmtDate(date)}, Shift ${slot}.\n\nPlease be present 15 minutes before the exam starts.\n\nRegards,\nExam Controller` },
    { label: "Room Details", msg: `Dear Faculty,\n\nYour invigilation room for ${fmtDate(date)} Shift ${slot} is Room ________.\n\nPlease report to the Control Room before the exam.\n\nRegards,\nExam Controller` },
    { label: "Custom Message", msg: "" },
  ];
  const [customMsg, setCustomMsg] = useState("");

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>WhatsApp Message</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        Send WhatsApp messages to faculty about their duties.
      </div>

      <div style={{ ...S.card, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Select Date & Shift</label>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
        </div>

        {date && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <StatCard value={stats.total} label="Total Faculty" color={C.blue} />
            <StatCard value={stats.withMobile} label="With Mobile" color={C.green} />
            <StatCard value={stats.selectedCount} label="Selected" color={C.gold} />
          </div>
        )}

        {date && dayDuties.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={selectAll} style={S.btnG}>
              Select All ({stats.withMobile})
            </button>
            <button onClick={clearSelection} style={S.btnG}>
              Clear
            </button>
          </div>
        )}
      </div>

      {date && dayDuties.length > 0 && (
        <>
          <div style={{ ...S.card, overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === stats.withMobile && stats.withMobile > 0}
                      onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                    />
                  </th>
                  {["Faculty", "Department", "Mobile", "Room", "Duty Type"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayDuties.map((d, i) => (
                  <tr
                    key={i}
                    style={{
                      background: selected.has(d.id) ? C.primary + "15" : i % 2 === 0 ? "transparent" : "#ffffff03",
                      cursor: d.mobile ? "pointer" : "default",
                    }}
                    onClick={() => d.mobile && toggleSelect(d.id)}
                  >
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {d.mobile && (
                        <input
                          type="checkbox"
                          checked={selected.has(d.id)}
                          onChange={() => toggleSelect(d.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{d.facultyName || "-"}</td>
                    <td style={{ ...S.td, color: C.textMid }}>{d.dept || "-"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: d.mobile ? C.teal : C.textDim }}>
                      {d.mobile || "—"}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700, color: d.room ? C.primaryL : C.textDim }}>
                      {d.room || (d.isReserved ? "Standby" : "-")}
                    </td>
                    <td style={{ ...S.td, color: C.gold }}>{d.dutyType || "Invigilation"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ ...S.card, padding: "16px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>
              Message Templates
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    if (t.msg) {
                      handleSendMessage(t.msg);
                    } else if (customMsg) {
                      handleSendMessage(customMsg);
                    }
                  }}
                  disabled={selected.size === 0}
                  style={{
                    ...S.btnP,
                    opacity: selected.size === 0 ? 0.5 : 1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div>
              <label style={S.label}>Custom Message</label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your custom message here..."
                style={{
                  ...S.inp,
                  minHeight: 80,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              {customMsg && (
                <button
                  onClick={() => handleSendMessage(customMsg)}
                  disabled={selected.size === 0}
                  style={{ ...S.btnG, marginTop: 10 }}
                >
                  Send to {selected.size} selected
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {date && dayDuties.length === 0 && (
        <div style={{ textAlign: "center", color: C.textDim, padding: "40px 0" }}>
          No duties found for {fmtDate(date)} Shift {slot}.
        </div>
      )}
    </div>
  );
}