import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      style={{
        background: "#111a38",
        border: "1px solid #1e2d55",
        borderTop: "3px solid " + color,
        borderRadius: 9,
        padding: isMobile ? "12px 14px" : "14px 18px",
        minWidth: isMobile ? 90 : 110,
        flex: isMobile ? '1 1 calc(50% - 6px)' : 'none',
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 24 : 28,
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
          fontSize: isMobile ? 10 : 11,
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

// Responsive table that converts to card view on mobile
export function ResponsiveTable({ data, columns, keyField = "id", onRowClick }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: C.textDim }}>
        No data available
      </div>
    );
  }

  // Mobile: Card view
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((row, idx) => (
          <div
            key={row[keyField] || idx}
            onClick={() => onRowClick && onRowClick(row)}
            style={{
              background: '#111a38',
              border: '1px solid #1e2d55',
              borderRadius: 10,
              padding: 14,
              cursor: onRowClick ? 'pointer' : 'default',
              borderLeft: `3px solid ${C.primary}`,
            }}
          >
            {columns.map((col, colIdx) => (
              <div
                key={col.key || colIdx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: colIdx < columns.length - 1 ? '1px solid #1e2d55' : 'none',
                }}
              >
                <span style={{ fontSize: 11, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  {col.label}
                </span>
                <span style={{ fontSize: 13, color: C.text, textAlign: 'right', fontWeight: 500, maxWidth: '60%' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Regular table
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} style={S.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row[keyField] || idx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                background: idx % 2 === 0 ? 'transparent' : '#ffffff03',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {columns.map((col, colIdx) => (
                <td key={col.key || colIdx} style={S.td}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  const [modalWidth, setModalWidth] = useState(width);

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      const newWidth = Math.min(width, screenWidth * 0.95);
      setModalWidth(newWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width]);

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
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111a38",
          border: "1px solid #2a3f72",
          borderRadius: 13,
          padding: window.innerWidth < 768 ? 20 : 28,
          width: modalWidth,
          maxWidth: "100%",
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
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      style={{ 
        display: "flex", 
        gap: isMobile ? 6 : 8, 
        alignItems: "center", 
        flexWrap: "wrap",
        width: '100%',
      }}
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ ...S.inp, width: isMobile ? '100%' : 152, flex: isMobile ? '1 1 100%' : 'none' }}
      />
      <div style={{ display: 'flex', gap: isMobile ? 6 : 8, flex: isMobile ? '1 1 100%' : 'none' }}>
        {["I", "II"].map((sl) => (
          <button
            key={sl}
            onClick={() => setSlot(sl)}
            style={{
              ...(slot === sl ? S.btnP : S.btnG),
              flex: 1,
              minHeight: 44,
              padding: isMobile ? '10px 12px' : '9px 20px',
            }}
          >
            Shift {sl}
          </button>
        ))}
      </div>
    </div>
  );
}