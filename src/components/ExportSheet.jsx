import { useState, useEffect, useMemo } from "react";
import { DateSlotPicker, StatCard, BtnP, BtnG } from "./ui";
import { fmtDate, fmtDateLong, fmtDateDMY, C, S, SLOT_TIMES, COLLEGE, EXAM_TITLE } from "../lib/constants";
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

  const getHeaderFooterInfo = () => {
    const today = fmtDateDMY(new Date().toISOString().split("T")[0]);
    return {
      college: COLLEGE,
      examTitle: EXAM_TITLE,
      dateInfo: `${fmtDate(date)} - ${SLOT_TIMES[slot] || "Slot " + slot}`,
      footerText: `Centre Superintendent, BBD University`,
      dateGenerated: `Date: ${today}`,
    };
  };

  const handleExportExcel = () => {
    if (!xlsxReady || !dayDuties.length) return;
    const wb = window.XLSX.utils.book_new();

    const data = dayDuties.map((d, i) => ({
      "S.No": i + 1,
      "Faculty Name": d.facultyName || "",
      Department: d.dept || "",
      Designation: d.designation || "",
      Mobile: d.mobile || "",
      Room: d.room || "-",
      "Duty Type": d.dutyType || "Invigilation",
      Status: d.status || "present",
      Signature: "",
    }));
    const ws = window.XLSX.utils.json_to_sheet(data);

    ws["!rows"] = [
      { hpt: 20 },
      { hpt: 20 },
      { hpt: 20 },
      ...Array(data.length + 2).fill({ hpt: 25 }),
    ];

    const colWidths = [
      { wch: 6 },
      { wch: 28 },
      { wch: 18 },
      { wch: 22 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
    ];
    ws["!cols"] = colWidths;

    window.XLSX.utils.book_append_sheet(wb, ws, "Duty Sheet");
    const dateStr = date || "all";
    window.XLSX.writeFile(wb, `DutySheet_${dateStr}_Shift${slot}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!dayDuties.length) return;
    const { college, examTitle, dateInfo, footerText, dateGenerated } = getHeaderFooterInfo();
    void college; void examTitle; void dateInfo; void footerText; void dateGenerated;
    const printWindow = window.open("", "_blank");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Duty Sheet - ${fmtDateLong(date)} Shift ${slot}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 30px 40px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 18px; color: #333; margin-bottom: 4px; }
          .header h2 { font-size: 13px; color: #666; margin-bottom: 8px; font-weight: normal; }
          .header .date-info { font-size: 12px; color: #555; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th, td { border: 1px solid #444; padding: 10px; text-align: left; font-size: 11px; }
          th { background: #f0f0f0; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; text-align: right; font-size: 11px; color: #666; page-break-after: always; }
          .footer .superintendent { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${college}</h1>
          <h2>${examTitle}</h2>
          <div class="date-info">${dateInfo}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40px">S.No</th>
              <th>Faculty Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th style="width:100px">Mobile</th>
              <th style="width:80px">Room</th>
              <th style="width:100px">Duty Type</th>
              <th style="width:80px">Status</th>
              <th style="width:120px">Signature</th>
            </tr>
          </thead>
          <tbody>
            ${dayDuties
              .map(
                (d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${d.facultyName || ""}</strong></td>
                <td>${d.dept || "-"}</td>
                <td>${d.designation || "-"}</td>
                <td>${d.mobile || "-"}</td>
                <td style="font-weight:bold">${d.room || "-"}</td>
                <td>${d.dutyType || "Invigilation"}</td>
                <td>${d.status || "present"}</td>
                <td></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <span class="superintendent">${footerText}</span> &nbsp;|&nbsp; ${dateGenerated}
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportRoomWiseExcel = () => {
    if (!xlsxReady || !dayDuties.length) return;

    const invigilationDuties = dayDuties.filter(
      (d) => d.dutyType === "Invigilation" || (!d.dutyType && d.room && !d.isReserved)
    );

    if (!invigilationDuties.length) {
      alert("No invigilation duties found for export.");
      return;
    }

    const hd = getHeaderFooterInfo();
    const wb = window.XLSX.utils.book_new();

    const sheetData = [];

    sheetData.push([hd.college]);
    sheetData.push([hd.examTitle]);
    sheetData.push([hd.dateInfo]);
    sheetData.push([]);

    const rooms = {};
    invigilationDuties.forEach((d) => {
      const room = d.room || "Unassigned";
      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(d);
    });

    const roomNames = Object.keys(rooms).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b, undefined, { numeric: true });
    });

    roomNames.forEach((room) => {
      const roomDuties = rooms[room];
      sheetData.push([`Room: ${room}`]);
      sheetData.push(["S.No", "Faculty Name", "Department", "Designation", "Mobile"]);

      roomDuties.forEach((d, i) => {
        sheetData.push([
          i + 1,
          d.facultyName || "",
          d.dept || "",
          d.designation || "",
          d.mobile || "",
        ]);
      });

      sheetData.push([]);
    });

    sheetData.push([`Centre Superintendent, BBD University | ${hd.dateGenerated}`]);

    const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
    const totalRows = sheetData.length;
    const totalCols = 5;

    ws["!ref"] = `A1:${String.fromCharCode(64 + totalCols)}${totalRows}`;

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    ];

    let rowOffset = 0;
    const titleRowStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center" } };
    const subtitleRowStyle = { font: { sz: 12 }, alignment: { horizontal: "center" }, fill: { fgColor: { rgb: "E8E8E8" } } };
    const dateRowStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } };

    ws["A1"].s = titleRowStyle;
    ws["A2"].s = subtitleRowStyle;
    ws["A3"].s = dateRowStyle;
    rowOffset = 4;

    roomNames.forEach((room) => {
      const roomDuties = rooms[room];
      const roomRow = rowOffset;
      ws["!merges"].push({ s: { r: roomRow, c: 0 }, e: { r: roomRow, c: 4 } });
      ws[`A${roomRow + 1}`].s = { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 13 }, fill: { fgColor: { rgb: "8B0000" } }, alignment: { horizontal: "left" } };
      rowOffset += 1;

      const headerRow = rowOffset;
      ws["!merges"].push({ s: { r: headerRow, c: 0 }, e: { r: headerRow, c: 4 } });
      for (let c = 0; c < totalCols; c++) {
        ws[`${String.fromCharCode(65 + c)}${headerRow + 1}`].s = { font: { bold: true }, fill: { fgColor: { rgb: "F0F0F0" } }, alignment: { horizontal: "center" } };
      }
      rowOffset += 1;

      rowOffset += roomDuties.length;
      rowOffset += 1;
    });

    const footerRow = totalRows - 1;
    ws["!merges"].push({ s: { r: footerRow, c: 0 }, e: { r: footerRow, c: 4 } });
    ws[`A${footerRow + 1}`].s = { font: { italic: true, sz: 10 }, alignment: { horizontal: "right" } };

    ws["!rows"] = Array.from({ length: totalRows }, () => ({ hpt: 20 }));

    ws["!cols"] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 20 },
      { wch: 22 },
      { wch: 15 },
    ];

    window.XLSX.utils.book_append_sheet(wb, ws, "Room-wise Duty");
    const dateStr = date || "all";
    window.XLSX.writeFile(wb, `RoomWiseDuties_${dateStr}_Shift${slot}.xlsx`);
  };

  const handleExportRoomWisePDF = () => {
    if (!dayDuties.length) return;
    const { college, examTitle, dateInfo, footerText, dateGenerated } = getHeaderFooterInfo();

    const rooms = {};
    dayDuties.forEach((d) => {
      const room = d.room || "Unassigned";
      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(d);
    });

    const roomNames = Object.keys(rooms).sort();

    let tablesHtml = "";
    roomNames.forEach((room) => {
      const roomDuties = rooms[room];
      const rowsHtml = roomDuties
        .map(
          (d, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="font-size:13px"><strong>${d.facultyName || ""}</strong></td>
          <td>${d.mobile || "-"}</td>
          <td>${d.designation || "-"}</td>
        </tr>
      `
        )
        .join("");

      tablesHtml += `
        <div class="room-section">
          <h3 class="room-header">Room: ${room}</h3>
          <table>
            <thead>
              <tr>
                <th style="width:40px">S.No</th>
                <th>Faculty Name</th>
                <th style="width:100px">Mobile</th>
                <th style="width:150px">Designation</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    const printWindow = window.open("", "_blank");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Room-wise Duty Sheet - ${fmtDateLong(date)} Shift ${slot}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 30px 40px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 18px; color: #333; margin-bottom: 4px; }
          .header h2 { font-size: 13px; color: #666; margin-bottom: 8px; font-weight: normal; }
          .header .date-info { font-size: 12px; color: #555; font-weight: bold; }
          .room-section { margin-bottom: 25px; page-break-inside: avoid; }
          .room-header { font-size: 14px; color: #8B0000; margin-bottom: 8px; font-weight: bold; background: #f5f5f5; padding: 6px 10px; border-left: 4px solid #8B0000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #444; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #f0f0f0; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ccc; text-align: right; font-size: 11px; color: #666; page-break-after: always; }
          .footer .superintendent { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${college}</h1>
          <h2>${examTitle}</h2>
          <div class="date-info">${dateInfo}</div>
        </div>
        ${tablesHtml}
        <div class="footer">
          <span class="superintendent">${footerText}</span> &nbsp;|&nbsp; ${dateGenerated}
        </div>
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

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <BtnP onClick={handleExportExcel} disabled={!xlsxReady || !dayDuties.length}>
            {xlsxReady ? "Export Excel" : "Loading..."}
          </BtnP>
          <BtnP onClick={handleExportRoomWiseExcel} disabled={!xlsxReady || !dayDuties.length} style={xlsxReady ? { background: "linear-gradient(135deg," + C.green + ",#077a4f)" } : {}}>
            {xlsxReady ? "Room-wise Duty" : "Loading..."}
          </BtnP>
          <BtnG onClick={handleExportRoomWisePDF} disabled={!dayDuties.length}>
            📄 Room-wise PDF
          </BtnG>
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