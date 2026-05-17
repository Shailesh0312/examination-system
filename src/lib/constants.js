export const COLLEGE = "Babu Banarasi Das University, Lucknow";
export const XLSX_CDN = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
export const EXAM_TITLE = "End Semester Examination (2025-26) Even Semester";
export const APP_NAME = "University Examination System";

export const SLOT_TIMES = {
  I: "Shift I (10:00 AM – 01:00 PM)",
  II: "Shift II (02:00 PM – 05:00 PM)",
};

export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "HOD",
  "Dean of Schools",
  "Vice Chancellor",
  "Lab Instructor",
  "Guest Faculty",
  "Admin Staff",
  "Computer Lab Instructor",
];

export const DUTY_TYPES = ["Invigilation", "IFS", "Control Room", "Standby"];

export const UFM_MATERIALS = [
  "Chits / Paper Slips",
  "Mobile Phone",
  "Written on Body",
  "Written on Question Paper",
  "Electronic Device",
  "Book / Notes",
  "Other",
];

export const STATUS = {
  present: { label: "Present", color: "#10b981" },
  absent: { label: "Absent", color: "#ef4444" },
  late: { label: "Late", color: "#f59e0b" },
  relieved: { label: "Relieved", color: "#a78bfa" },
  replaced: { label: "Replaced", color: "#8b5cf6" },
  swapped: { label: "Swapped Out", color: "#3b82f6" },
  swapped_in: { label: "Swapped In", color: "#14b8a6" },
  emergency: { label: "Emergency", color: "#ec4899" },
  roomchg: { label: "Room Change", color: "#14b8a6" },
  cancelled: { label: "Cancelled", color: "#8fa8d0" },
  reserved: { label: "Standby", color: "#fbbf24" },
  ifs: { label: "IFS", color: "#a78bfa" },
  control: { label: "Control Room", color: "#60a5fa" },
  exchanged: { label: "Exchanged", color: "#ec4899" },
};

export const DUTY_DONE = new Set([
  "present",
  "late",
  "roomchg",
  "emergency",
  "swapped_in",
  "ifs",
  "control",
  "exchanged",
]);

export const DUTY_NOT_COUNTED = new Set([
  "absent",
  "cancelled",
  "reserved",
  "replaced",
  "swapped",
  "relieved",
]);

export const DEPLOY_TRIGGER = new Set([
  "absent",
  "cancelled",
  "ifs",
  "control",
  "relieved",
]);

export const REPLACEMENT_TYPES = ["absent", "replaced", "swapped"];

export const USERS = [
  { username: "admin", password: "admin123", role: "Admin", name: "Administrator" },
  { username: "controller", password: "exam2025", role: "Controller", name: "Controller of Examinations" },
  { username: "deputy", password: "deputy123", role: "Deputy", name: "Deputy Controller" },
  { username: "vc", password: "vc2025", role: "Vice Chancellor", name: "Vice Chancellor" },
  { username: "dean", password: "dean2025", role: "Dean of Schools", name: "Dean of Schools" },
  { username: "viewer", password: "view123", role: "Viewer", name: "Read-Only Viewer" },
];

export const READ_ONLY_ROLES = ["Vice Chancellor", "Dean of Schools", "Viewer"];
export const UPLOAD_ROLES = ["Admin", "Controller", "Deputy"];
export const DELETE_UFM_ROLES = ["Admin"];

export const uid = (p) => p + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
export const fmtDate = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
export const fmtDateLong = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
export const fmtDateDMY = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const C = {
  bg: "#080d1e",
  surface: "#0d1530",
  card: "#111a38",
  border: "#1e2d55",
  border2: "#2a3f72",
  primary: "#8B0000",
  primaryL: "#c0392b",
  gold: "#c9a227",
  text: "#e2e8f0",
  textMid: "#8fa8d0",
  textDim: "#3a5080",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  blue: "#3b82f6",
  yellow: "#fbbf24",
  headerGrad: "linear-gradient(135deg,#0a1628 0%,#0d1f3c 60%,#12082a 100%)",
  accentGrad: "linear-gradient(135deg,#8B0000 0%,#5c0000 100%)",
  goldGrad: "linear-gradient(135deg,#c9a227 0%,#a07b15 100%)",
};

export const S = {
  inp: {
    background: "#080d1e",
    border: "1px solid #1e2d55",
    borderRadius: 6,
    color: "#e2e8f0",
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  sel: {
    background: "#080d1e",
    border: "1px solid #1e2d55",
    borderRadius: 6,
    color: "#e2e8f0",
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btnP: {
    background: "linear-gradient(135deg,#8B0000 0%,#5c0000 100%)",
    color: "#fff",
    border: "none",
    padding: "9px 20px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  btnG: {
    background: "transparent",
    color: "#8fa8d0",
    border: "1px solid #1e2d55",
    padding: "8px 16px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
  },
  label: {
    display: "block",
    fontSize: 11,
    color: "#8fa8d0",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontWeight: 600,
  },
  th: {
    padding: "9px 12px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "#8fa8d0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #1e2d55",
    whiteSpace: "nowrap",
    background: "#080d1e",
  },
  td: {
    padding: "9px 12px",
    borderBottom: "1px solid #1e2d55",
    fontSize: 13,
    color: "#e2e8f0",
  },
  card: {
    background: "#111a38",
    border: "1px solid #1e2d55",
    borderRadius: 10,
  },
};

// ============ RESPONSIVE HELPERS ============

// Check if we're on mobile
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Check if we're on tablet
export const isTablet = () => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

// Responsive input style - full width on mobile, fixed on desktop
export const getResponsiveInputStyle = (mobileWidth = '100%', desktopWidth = 240) => ({
  ...S.inp,
  width: typeof window !== 'undefined' && window.innerWidth < 768 ? mobileWidth : desktopWidth,
});

// Responsive card padding
export const getCardPadding = () => ({
  ...S.card,
  padding: typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 20,
});

// Responsive modal width
export const getModalWidth = (maxWidth) => {
  if (typeof window === 'undefined') return maxWidth;
  return Math.min(maxWidth, window.innerWidth * 0.95);
};

// Responsive grid columns
export const getGridColumns = (desktop = '1fr 1fr') => ({
  display: 'grid',
  gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 768 ? '1fr' : desktop,
  gap: 16,
});

export function getFairnessScore(f, duties) {
  const key = (f.facultyId || f.id || f.facultyName || "").trim().toLowerCase();
  let score = 0;
  duties.forEach((d) => {
    const dk = (d.facultyId || d.facultyName || "").trim().toLowerCase();
    if (dk !== key) return;
    if (d.status === "reserved" || (d.isReserved && !d.substituteFor))
      score += 2;
    if (d.status === "relieved") score += 1;
    if (DUTY_DONE.has(d.status) && !d.isReserved) score -= 1;
    if (d.substituteFor && DUTY_DONE.has(d.status)) score -= 1;
    if (d.status === "absent") score -= 2;
  });
  return score;
}

export function smartAllocate(facultyList, roomList, date, slot, duties = []) {
  const scored = facultyList.map((f) => ({
    ...f,
    _score: getFairnessScore(f, duties),
  }));
  scored.sort(
    (a, b) =>
      b._score !== a._score
        ? b._score - a._score
        : Math.random() - 0.5
  );
  const assigned = [];
  const reserved = [];
  let fi = 0;
  for (const rm of roomList) {
    const need = rm.students > 56 ? 3 : 2;
    for (let k = 0; k < need && fi < scored.length; k++, fi++) {
      const f = scored[fi];
      assigned.push({
        id: uid("D"),
        date,
        slot,
        facultyId: f.facultyId || f.id || "",
        facultyName: f.facultyName || "",
        dept: f.dept || "",
        designation: f.designation || "",
        mobile: f.mobile || "",
        room: rm.room,
        dutyType: "Invigilation",
        students: rm.students,
        isReserved: false,
        status: "present",
        incident: null,
        substituteFor: null,
        controlRole: null,
        _score: f._score,
      });
    }
  }
  scored.slice(fi).forEach((f) => {
    reserved.push({
      id: uid("D"),
      date,
      slot,
      facultyId: f.facultyId || f.id || "",
      facultyName: f.facultyName || "",
      dept: f.dept || "",
      designation: f.designation || "",
      mobile: f.mobile || "",
      room: "",
      dutyType: "Standby",
      students: 0,
      isReserved: true,
      status: "reserved",
      incident: null,
      substituteFor: null,
      controlRole: null,
      _score: f._score,
    });
  });
  return { assigned, reserved };
}