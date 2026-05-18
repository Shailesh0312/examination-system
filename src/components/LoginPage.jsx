import { useState, useEffect } from "react";
import { COLLEGE, EXAM_TITLE, APP_NAME, C, S, USERS } from "../lib/constants";

export default function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 400);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
        flexDirection: isMobile ? "column" : "row",
        fontFamily: "system-ui,-apple-system,sans-serif",
        background: C.bg,
      }}
    >
<div
            style={{
              flex: isMobile ? "none" : "0 0 52%",
              background: C.headerGrad,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: isSmallMobile ? "20px 16px" : isMobile ? "24px 20px" : "48px 52px",
              borderRight: isMobile ? "none" : "1px solid " + C.border,
              borderBottom: isMobile ? "1px solid " + C.border : "none",
              minHeight: isMobile ? 220 : "100vh",
              boxSizing: "border-box",
            }}
          >
        <div>
          <div
            style={{
              width: isSmallMobile ? 56 : isMobile ? 64 : 88,
              height: isSmallMobile ? 56 : isMobile ? 64 : 88,
              borderRadius: isSmallMobile ? 14 : isMobile ? 16 : 20,
              background: C.goldGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isSmallMobile ? 28 : isMobile ? 32 : 42,
              marginBottom: isSmallMobile ? 16 : isMobile ? 20 : 24,
            }}
          >
            🎓
          </div>
          <div
            style={{
              fontSize: isSmallMobile ? 22 : isMobile ? 26 : 38,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 8,
              textAlign: "left",
            }}
          >
            {COLLEGE}
          </div>
          <div
            style={{
              fontSize: isSmallMobile ? 12 : isMobile ? 13 : 15,
              color: "rgba(255,255,255,0.6)",
              marginBottom: isSmallMobile ? 20 : isMobile ? 24 : 32,
              textAlign: "left",
            }}
          >
            Faizabad Road, Lucknow — 226 028
          </div>
          <div
            style={{
              width: isSmallMobile ? 40 : isMobile ? 48 : 56,
              height: 3,
              background: C.accentGrad,
              borderRadius: 2,
              marginBottom: isSmallMobile ? 16 : isMobile ? 20 : 32,
            }}
          />
          <div
            style={{
              background: "rgba(8,13,46,0.65)",
              border: "1px solid rgba(139,0,0,0.45)",
              borderRadius: isSmallMobile ? 8 : 12,
              padding: isSmallMobile ? "12px 14px" : "16px 20px",
              maxWidth: isSmallMobile ? "100%" : 380,
            }}
          >
            <div
              style={{
                fontSize: isSmallMobile ? 10 : 11,
                fontWeight: 800,
                color: C.gold,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {APP_NAME}
            </div>
            <div
              style={{
                fontSize: isSmallMobile ? 11 : 12,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.7,
              }}
            >
              {EXAM_TITLE}
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)",
            paddingTop: isMobile ? 16 : 18,
            marginTop: isMobile ? 20 : 0,
          }}
        >
          <div
            style={{
              fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
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
            style={{ fontSize: isSmallMobile ? 10 : 11, color: "rgba(255,255,255,0.35)" }}
          >
            BBD City, Faizabad Road, Lucknow — 226 028
          </div>
        </div>
      </div>
      <div
          style={{
            flex: isMobile ? "none" : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isSmallMobile ? "16px" : isMobile ? "24px" : "48px 40px",
            width: isMobile ? "100%" : "auto",
            boxSizing: "border-box",
          }}
        >
        <div
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : 400,
            background: C.card,
            border: "1px solid " + C.border2,
            borderRadius: isSmallMobile ? 10 : isMobile ? 12 : 16,
            padding: isSmallMobile ? "20px 16px" : isMobile ? "24px 20px" : "36px 36px 32px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: isMobile ? 24 : 28 }}>
            <div
              style={{
                fontSize: isSmallMobile ? 18 : isMobile ? 20 : 22,
                fontWeight: 800,
                color: C.text,
                marginBottom: 5,
              }}
            >
              Welcome Back
            </div>
            <div style={{ fontSize: isSmallMobile ? 12 : isMobile ? 12 : 13, color: C.textMid }}>
              Sign in to the Examination Portal
            </div>
          </div>
          <div style={{ marginBottom: isMobile ? 14 : 16 }}>
            <label style={{ ...S.label, fontSize: isMobile ? 12 : 11 }}>Username</label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              placeholder="Enter username"
              style={{
                ...S.inp,
                fontSize: isMobile ? 15 : 14,
                minHeight: isMobile ? 48 : "auto",
                padding: isMobile ? "12px 14px" : "9px 12px",
              }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: isMobile ? 18 : 20 }}>
            <label style={{ ...S.label, fontSize: isMobile ? 12 : 11 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                value={p}
                onChange={(e) => setP(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                placeholder="Enter password"
                style={{
                  ...S.inp,
                  fontSize: isMobile ? 15 : 14,
                  minHeight: isMobile ? 48 : "auto",
                  padding: isMobile ? "12px 40px 12px 14px" : "9px 46px 9px 12px",
                }}
              />
              <button
                onClick={() => setShow((v) => !v)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.textMid,
                  fontSize: isMobile ? 20 : 15,
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
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
                fontSize: isMobile ? 12 : 13,
                color: C.red,
                marginBottom: isMobile ? 14 : 16,
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
              padding: isMobile ? "14px" : 13,
              fontSize: isMobile ? 15 : 14,
              fontWeight: 800,
              background: C.accentGrad,
              color: "#fff",
              border: "none",
              borderRadius: isMobile ? 8 : 8,
              cursor: loading || !u || !p ? "not-allowed" : "pointer",
              opacity: loading || !u || !p ? 0.5 : 1,
              minHeight: isMobile ? 48 : 44,
            }}
          >
            {loading ? "Authenticating..." : "Sign In →"}
          </button>
        </div>
      </div>
    </div>
  );
}