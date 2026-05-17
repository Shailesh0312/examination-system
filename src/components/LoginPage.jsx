import { useState } from "react";
import { COLLEGE, EXAM_TITLE, APP_NAME, C, S, USERS } from "../lib/constants";

export default function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const doLogin = () => {
    setLoading(true);
    setErr("");
    setTimeout(() => {
      const found = USERS.find((x) => x.username === u && x.password === p);
      if (found) onLogin(found);
      else {
        setErr("Invalid username or password.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "system-ui,-apple-system,sans-serif",
        background: C.bg,
      }}
    >
      <div
        style={{
          flex: "0 0 52%",
          background: C.headerGrad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
          borderRight: "1px solid " + C.border,
        }}
      >
        <div>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: C.goldGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              marginBottom: 24,
            }}
          >
            🎓
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            {COLLEGE}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 32,
            }}
          >
            Faizabad Road, Lucknow — 226 028
          </div>
          <div
            style={{
              width: 56,
              height: 3,
              background: C.accentGrad,
              borderRadius: 2,
              marginBottom: 32,
            }}
          />
          <div
            style={{
              background: "rgba(8,13,46,0.65)",
              border: "1px solid rgba(139,0,0,0.45)",
              borderRadius: 12,
              padding: "16px 20px",
              maxWidth: 380,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.gold,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              {APP_NAME}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.9,
              }}
            >
              {EXAM_TITLE}
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.gold,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            Internal Quality Assurance Cell (IQAC)
          </div>
          <div
            style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}
          >
            BBD City, Faizabad Road, Lucknow — 226 028
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: C.card,
            border: "1px solid " + C.border2,
            borderRadius: 16,
            padding: "36px 36px 32px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: C.text,
                marginBottom: 5,
              }}
            >
              Welcome Back
            </div>
            <div style={{ fontSize: 13, color: C.textMid }}>
              Sign in to the Examination Portal
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Username</label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              placeholder="Enter username"
              style={{ ...S.inp, fontSize: 14 }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                value={p}
                onChange={(e) => setP(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                placeholder="Enter password"
                style={{ ...S.inp, fontSize: 14, paddingRight: 46 }}
              />
              <button
                onClick={() => setShow((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.textMid,
                  fontSize: 15,
                }}
              >
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {err && (
            <div
              style={{
                background: "#ef44440f",
                border: "1px solid #ef444444",
                borderRadius: 7,
                padding: "10px 14px",
                fontSize: 13,
                color: C.red,
                marginBottom: 16,
              }}
            >
              ⚠ {err}
            </div>
          )}
          <button
            onClick={doLogin}
            disabled={loading || !u || !p}
            style={{
              width: "100%",
              padding: 13,
              fontSize: 14,
              fontWeight: 800,
              background: C.accentGrad,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: loading || !u || !p ? "not-allowed" : "pointer",
              opacity: loading || !u || !p ? 0.5 : 1,
            }}
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>
        </div>
      </div>
    </div>
  );
}