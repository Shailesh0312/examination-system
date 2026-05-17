import { useState, useEffect, useMemo } from "react";
import { DateSlotPicker, StatCard, BtnP, BtnG } from "./ui";
import { fmtDate, fmtDateLong, C, S, SLOT_TIMES } from "../lib/constants";
import { XLSX_CDN } from "../lib/supabase";

export default function ExportSheet({ duties = [] }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("I");
  const [xlsxReady, setXlsxReady] = useState(false);

  useEffect(() => {
    if (window.XLSX) {
      setXlsxReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = XLSX_CDN;
    s.onload = () => setXlsxReady(true);
    document.head.appendChild(s);
  }, []);

  const dayDuties = useMemo(() => {
    if (!date) return [];
    return duties.filter((d) => d.date === date && d.slot === slot);
  }, [duties, date, slot]);

  const stats = useMemo(() => {
    const total = dayDuties.length;
    const assigned = dayDuties.filter((d) => d.room && !d.isReserved).length;
    const standby = dayDuties.filter((d) => d.isReserved || d.status === "reserved").length;
    const control = dayDuties.filter((d) => d.dutyType === "Control Room" || d.status === "control").length;
    const ifs = dayDuties.filter((d) => d.dutyType === "IFS" || d.status === "ifs").length;
    return { total, assigned, standby, control, ifs };
  }, [dayDuties]);

  const handleExportExcel = () => {
    if (!xlsxReady || !dayDuties.length) return;
    const wb = window.XLSX.utils.book_new();
    const data = dayDuties.map((d) => ({
      Faculty: d.facultyName || "",
      Department: d.dept || "",
      Designation: d.designation || "",
      Mobile: d.mobile || "",
      Room: d.room || "-",
      DutyType: d.dutyType || "Invigilation",
      Status: d.status || "present",
      Students: d.students || 0,
    }));
    const ws = window.XLSX.utils.json_to_sheet(data);
    window.XLSX.utils.book_append_sheet(wb, ws, "Duty Sheet");
    const dateStr = date || "all";
    window.XLSX.writeFile(wb, `DutySheet_${dateStr}_Shift${slot}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!dayDuties.length) return;
    const printWindow = window.open("", "_blank");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Duty Sheet - ${fmtDateLong(date)} Shift ${slot}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #666; text-align: center; margin-top: -10px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f5f5f5; }
          .slot-info { text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Duty Sheet</h1>
        <h2>${fmtDateLong(date)} - ${SLOT_TIMES[slot]}</h2>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Faculty</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Mobile</th>
              <th>Room</th>
              <th>Duty Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dayDuties
              .map(
                (d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${d.facultyName || ""}</td>
                <td>${d.dept || ""}</td>
                <td>${d.designation || ""}</td>
                <td>${d.mobile || ""}</td>
                <td>${d.room || "-"}</td>
                <td>${d.dutyType || "Invigilation"}</td>
                <td>${d.status || "present"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>Export Sheet</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        Export duty sheets to Excel or PDF for printing and distribution.
      </div>

      <div style={{ ...S.card, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Select Date & Shift</label>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
        </div>

        {date && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <StatCard value={stats.total} label="Total" color={C.blue} />
            <StatCard value={stats.assigned} label="Assigned" color={C.green} />
            <StatCard value={stats.standby} label="Standby" color={C.yellow} />
            <StatCard value={stats.control} label="Control" color={C.purple} />
            <StatCard value={stats.ifs} label="IFS" color={C.red} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <BtnP onClick={handleExportExcel} disabled={!xlsxReady || !dayDuties.length}>
            {xlsxReady ? "Export Excel" : "Loading..."}
          </BtnP>
          <BtnG onClick={handleExportPDF} disabled={!dayDuties.length}>
            Export PDF
          </BtnG>
        </div>
      </div>

      {dayDuties.length > 0 && (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Faculty", "Dept", "Designation", "Mobile", "Room", "Duty Type", "Status"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dayDuties.map((d, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff03" }}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{d.facultyName || "-"}</td>
                  <td style={{ ...S.td, color: C.textMid }}>{d.dept || "-"}</td>
                  <td style={{ ...S.td, color: C.purple }}>{d.designation || "-"}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.teal }}>{d.mobile || "-"}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: d.room ? C.primaryL : C.textDim }}>
                    {d.room || (d.isReserved ? "Standby" : "-")}
                  </td>
                  <td style={{ ...S.td, color: C.gold }}>{d.dutyType || "Invigilation"}</td>
                  <td style={S.td}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      background: d.status === "present" ? C.green + "22" : C.yellow + "22",
                      color: d.status === "present" ? C.green : C.yellow,
                    }}>
                      {d.status || "present"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {date && dayDuties.length === 0 && (
        <div style={{ textAlign: "center", color: C.textDim, padding: "40px 0" }}>
          No duties found for {fmtDateLong(date)} Shift {slot}.
        </div>
      )}
    </div>
  );
}