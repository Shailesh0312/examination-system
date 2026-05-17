import { STATUS, C, S } from "../../lib/constants";

export function Badge({ type }) {
  const st = STATUS[type] || { label: type, color: "#8fa8d0" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        background: st.color + "22",
        color: st.color,
        border: "1px solid " + st.color + "44",
        whiteSpace: "nowrap",
      }}
    >
      {st.label}
    </span>
  );
}

export function Field({ label, children, col }) {
  return (
    <div style={{ marginBottom: 13, gridColumn: col }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

export function BtnP({ children, style, ...p }) {
  return (
    <button style={{ ...S.btnP, ...style }} {...p}>
      {children}
    </button>
  );
}

export function BtnG({ children, style, ...p }) {
  return (
    <button style={{ ...S.btnG, ...style }} {...p}>
      {children}
    </button>
  );
}

export function StatCard({ value, label, color }) {
  return (
    <div
      style={{
        background: "#111a38",
        border: "1px solid #1e2d55",
        borderTop: "3px solid " + color,
        borderRadius: 9,
        padding: "14px 18px",
        minWidth: 110,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#8fa8d0",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid #1e2d55",
        borderTopColor: C.primaryL,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        verticalAlign: "middle",
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
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
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111a38",
          border: "1px solid #2a3f72",
          borderRadius: 13,
          padding: 28,
          width,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px #000e",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>
            {title}
          </span>
          <button
            onClick={onClose}
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
        {children}
      </div>
    </div>
  );
}

export function DateSlotPicker({ date, setDate, slot, setSlot }) {
  return (
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ ...S.inp, width: 152 }}
      />
      {["I", "II"].map((sl) => (
        <button
          key={sl}
          onClick={() => setSlot(sl)}
          style={slot === sl ? S.btnP : S.btnG}
        >
          Shift {sl}
        </button>
      ))}
    </div>
  );
}