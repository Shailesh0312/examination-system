import { APP_NAME, COLLEGE, C } from "../lib/constants";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "import", icon: "↑", label: "Import Duties" },
  { id: "liveops", icon: "!", label: "Live Ops" },
  { id: "controlroom", icon: "⊕", label: "Control Room" },
  { id: "proctorial", icon: "🛡", label: "Proctorial Board" },
  { id: "ufm", icon: "⚠", label: "UFM Cases" },
  { id: "dutycount", icon: "≡", label: "Duty Count" },
  { id: "history", icon: "⏱", label: "History" },
  { id: "xlexport", icon: "↓", label: "Export Sheet" },
  { id: "facultyduty", icon: "🔍", label: "Faculty Duty Lookup" },
  { id: "whatsapp", icon: "✉", label: "WhatsApp Msg" },
];

export default function Sidebar({
  view,
  setView,
  todayIssues,
  user,
  syncStatus,
  isReadOnly,
  isMobile = false,
  isOpen = true,
  onClose = null,
}) {
  const handleNavClick = (navId) => {
    setView(navId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const sidebarStyle = isMobile
    ? {
        position: "fixed",
        left: isOpen ? 0 : -260,
        top: 0,
        bottom: 0,
        width: 260,
        zIndex: 200,
        transition: "left 0.25s ease",
        boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.5)" : "none",
        overflowY: "auto",
      }
    : {
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 220,
        zIndex: 100,
        overflowY: "auto",
      };

  return (
    <div
      style={{
        ...sidebarStyle,
        borderRight: "1px solid " + C.border,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        background: C.bg,
        ...(isMobile && { minHeight: "100vh" }),
      }}
    >
      <div
        style={{
          background: C.headerGrad,
          padding: "18px 18px 16px",
          borderBottom: "1px solid " + C.border,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: C.goldGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            🎓
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "0.03em",
              lineHeight: 1.4,
              marginBottom: 2,
            }}
          >
            {APP_NAME}
          </div>
          <div style={{ fontSize: 10, color: C.textMid, lineHeight: 1.4 }}>
            {COLLEGE}
          </div>
        </div>
        {isMobile && isOpen && onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8fa8d0",
              fontSize: 24,
              cursor: "pointer",
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        )}
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid " + C.border,
        }}
      >
        <div
          style={{
            background: "#080d1e",
            borderRadius: 8,
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: C.accentGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: C.textMid }}>{user.role}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            background: "#080d1e",
            borderRadius: 6,
            border: "1px solid " + C.border,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background:
                syncStatus === "live"
                  ? C.green
                  : syncStatus === "syncing"
                  ? C.orange
                  : C.red,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              color:
                syncStatus === "live" ? C.green : C.textMid,
              fontWeight: 700,
            }}
          >
            {syncStatus === "live"
              ? "Live – Supabase"
              : syncStatus === "syncing"
              ? "Syncing..."
              : "Connection Error"}
          </span>
        </div>
        {isReadOnly && (
          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              color: C.yellow,
              background: "#fbbf2412",
              borderRadius: 5,
              padding: "4px 8px",
              textAlign: "center",
              border: "1px solid #fbbf2433",
            }}
          >
            View Only
          </div>
        )}
      </div>
      <nav style={{ flex: 1, paddingTop: 6 }}>
        {NAV.map((n) => {
          const active = view === n.id;
          const badge = n.id === "liveops" && todayIssues > 0;
          return (
            <div
              key={n.id}
              onClick={() => handleNavClick(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                cursor: "pointer",
                color: active ? C.primaryL : C.textMid,
                background: active ? "#8B000018" : "transparent",
                borderLeft: "3px solid " + (active ? C.primary : "transparent"),
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                userSelect: "none",
                minHeight: 44,
              }}
            >
              <span style={{ fontSize: 13, minWidth: 14 }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {badge && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.red,
                    display: "inline-block",
                  }}
                />
              )}
            </div>
          );
        })}
      </nav>
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid " + C.border,
        }}
      >
        <div style={{ fontSize: 10, color: C.textDim, textAlign: "center" }}>
          v19 — Supabase Live
        </div>
      </div>
    </div>
  );
}