import { getSB } from "./supabase";

const TBL_DUTIES = "exam_duties";
const TBL_FACULTY = "faculty_master";
const TBL_CONFIG = "app_config";
const TBL_UFM = "ufm_cases";
const TBL_PROCTORIAL = "proctorial_board";
const TBL_CONTROL = "control_room";
const BUCKET_UFM = "ufm-docs";

export const rowToDuty = (r) => ({
  id: r.id,
  date: r.date,
  slot: r.slot,
  facultyId: r.faculty_id || "",
  facultyName: r.faculty_name || "",
  dept: r.dept || "",
  designation: r.designation || "",
  mobile: r.mobile || "",
  room: r.room || "",
  dutyType: r.duty_type || "Invigilation",
  students: r.students || 0,
  isReserved: r.is_reserved || false,
  status: r.status || "present",
  substituteFor: r.substitute_for || null,
  incident: r.incident || null,
  controlRole: r.control_role || null,
});

export const dutyToRow = (d) => ({
  id: d.id,
  date: d.date,
  slot: d.slot,
  faculty_id: d.facultyId || "",
  faculty_name: d.facultyName || "",
  dept: d.dept || "",
  designation: d.designation || "",
  mobile: d.mobile || "",
  room: d.room || "",
  duty_type: d.dutyType || "Invigilation",
  students: d.students || 0,
  is_reserved: d.isReserved || false,
  status: d.status || "present",
  substitute_for: d.substituteFor || null,
  incident: d.incident || null,
  control_role: d.controlRole || null,
});

export async function dbGetDuties() {
  const sb = await getSB();
  const { data, error } = await sb.from(TBL_DUTIES).select("*");
  if (error) throw error;
  return (data || []).map(rowToDuty);
}

export async function dbUpsertDuties(duties) {
  const sb = await getSB();
  const rows = duties.map(dutyToRow);
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await sb.from(TBL_DUTIES).upsert(rows.slice(i, i + 50), {
      onConflict: "id",
    });
    if (error) throw error;
  }
}

export async function dbDeleteDuty(id) {
  const sb = await getSB();
  const { error } = await sb.from(TBL_DUTIES).delete().eq("id", id);
  if (error) throw error;
}

export async function dbClearDateSlot(date, slot) {
  const sb = await getSB();
  const { error } = await sb
    .from(TBL_DUTIES)
    .delete()
    .eq("date", date)
    .eq("slot", slot);
  if (error) throw error;
}

export async function dbGetFaculty() {
  const sb = await getSB();
  const { data, error } = await sb.from(TBL_FACULTY).select("*");
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.faculty_id,
    facultyId: r.faculty_id,
    facultyName: r.faculty_name,
    dept: r.dept,
    designation: r.designation,
    mobile: r.mobile,
  }));
}

export async function dbSaveFaculty(fm) {
  const sb = await getSB();
  const rows = fm.map((f) => ({
    faculty_id: f.facultyId || f.id || "",
    faculty_name: f.facultyName || "",
    dept: f.dept || "",
    designation: f.designation || "",
    mobile: f.mobile || "",
  }));
  for (let i = 0; i < rows.length; i += 50) {
    await sb.from(TBL_FACULTY).upsert(rows.slice(i, i + 50), {
      onConflict: "faculty_id",
    });
  }
}

export async function dbGetDateSlot() {
  const sb = await getSB();
  const { data } = await sb.from(TBL_CONFIG).select("*").in("key", ["date", "slot"]);
  const m = {};
  (data || []).forEach((r) => (m[r.key] = r.value));
  return { date: m["date"] || "", slot: m["slot"] || "I" };
}

export async function dbSaveDateSlot(date, slot) {
  const sb = await getSB();
  await sb
    .from(TBL_CONFIG)
    .upsert([{ key: "date", value: date }, { key: "slot", value: slot }], {
      onConflict: "key",
    });
}

export async function dbGetUFM() {
  const sb = await getSB();
  const { data, error } = await sb
    .from(TBL_UFM)
    .select("*")
    .order("ts", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => {
    let ai = r.authority_info || {};
    if (typeof ai === "string") {
      try {
        ai = JSON.parse(ai);
      } catch {
        ai = {};
      }
    }
    return {
      id: r.id,
      date: r.date,
      slot: r.slot,
      shift: r.shift || r.slot,
      rollNo: r.roll_no || "",
      studentName: r.student_name || "",
      roomNo: r.room_no || "",
      school: r.school || "",
      docLink: r.doc_link || "",
      ts: r.ts,
      authorityInfo: ai,
    };
  });
}

export async function dbUpsertUFM(c) {
  const sb = await getSB();
  const { error } = await sb.from(TBL_UFM).upsert(
    {
      id: c.id,
      date: c.date,
      slot: c.slot,
      shift: c.shift || c.slot,
      roll_no: c.rollNo || "",
      student_name: c.studentName || "",
      room_no: c.roomNo || "",
      school: c.school || "",
      doc_link: c.docLink || "",
      ts: c.ts || new Date().toISOString(),
      authority_info: c.authorityInfo || null,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function dbDeleteUFM(id) {
  const sb = await getSB();
  await sb.from(TBL_UFM).delete().eq("id", id);
}

export async function dbUploadUFMFile(file, caseId) {
  const sb = await getSB();
  const ext = file.name.split(".").pop();
  const path = `${caseId}_doc.${ext}`;
  const { error } = await sb.storage.from(BUCKET_UFM).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = sb.storage.from(BUCKET_UFM).getPublicUrl(path);
  return data.publicUrl;
}

export async function dbGetProctorial() {
  const sb = await getSB();
  const { data, error } = await sb.from(TBL_PROCTORIAL).select("*");
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name || "",
    designation: r.designation || "",
    department: r.department || "",
    mobile: r.mobile || "",
    school: r.school || "",
  }));
}

export async function dbUpsertProctorial(m) {
  const sb = await getSB();
  const { error } = await sb
    .from(TBL_PROCTORIAL)
    .upsert(
      {
        id: m.id,
        name: m.name,
        designation: m.designation || "",
        department: m.department || "",
        mobile: m.mobile || "",
        school: m.school || "",
      },
      { onConflict: "id" }
    );
  if (error) throw error;
}

export async function dbDeleteProctorial(id) {
  const sb = await getSB();
  await sb.from(TBL_PROCTORIAL).delete().eq("id", id);
}

export async function dbGetControl() {
  const sb = await getSB();
  const { data, error } = await sb.from(TBL_CONTROL).select("*");
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    date: r.date,
    slot: r.slot,
    facultyId: r.faculty_id || "",
    facultyName: r.faculty_name || "",
    dept: r.dept || "",
    designation: r.designation || "",
    mobile: r.mobile || "",
    room: "Control Room",
    dutyType: "Control Room",
    students: 0,
    isReserved: false,
    status: "present",
    incident: null,
    substituteFor: null,
    controlRole: r.control_role || "Control Room",
  }));
}

export async function dbUpsertControl(r) {
  const sb = await getSB();
  const { error } = await sb.from(TBL_CONTROL).upsert(
    {
      id: r.id,
      date: r.date,
      slot: r.slot,
      faculty_id: r.facultyId || "",
      faculty_name: r.facultyName || "",
      dept: r.dept || "",
      designation: r.designation || "",
      mobile: r.mobile || "",
      control_role: r.controlRole || "Control Room",
      status: r.status || "present",
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function dbDeleteControl(id) {
  const sb = await getSB();
  await sb.from(TBL_CONTROL).delete().eq("id", id);
}

export async function subscribeRealtime(table, cb) {
  const sb = await getSB();
  const chName = "rt-" + table;
  try {
    await sb.removeChannel(sb.channel(chName));
  } catch {}
  const channel = sb
    .channel(chName)
    .on("postgres_changes", { event: "*", schema: "public", table }, cb)
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setTimeout(() => subscribeRealtime(table, cb), 3000);
      }
    });
  return () => {
    try {
      sb.removeChannel(channel);
    } catch {}
  };
}

export { getSB };