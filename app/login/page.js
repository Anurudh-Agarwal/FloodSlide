"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const authError = useStore((s) => s.authError);
  const t = useStore((s) => s.t);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("NDMA - National Operations");

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login({ username, password, department });
    if (success) {
      router.push("/rescue");
    }
  };

  const handleDemoLogin = () => {
    login({
      username: "NDMA-OPERATOR",
      password: "password123",
      department: "National Disaster Management Authority (NDMA)",
    });
    router.push("/rescue");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        background: "radial-gradient(circle at top, rgba(79, 209, 197, 0.05) 0%, transparent 70%)",
      }}
    >
      <div
        style={{
          width: "min(460px, 100%)",
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #4fd1c5 0%, #2b6cb0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 12px",
              boxShadow: "0 4px 16px rgba(79, 209, 197, 0.3)",
            }}
          >
            🛡️
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              margin: 0,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {t("loginTitle")}
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>
            {t("loginSubtitle")}
          </p>
        </div>

        {authError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 6,
              background: "rgba(214, 65, 44, 0.15)",
              border: "1px solid rgba(214, 65, 44, 0.4)",
              color: "var(--risk-critical)",
              fontSize: 12.5,
              marginBottom: 16,
            }}
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t("officerId")}</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. NDMA-OPERATOR / SHARMA"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t("password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{t("department")}</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={inputStyle}
            >
              <option value="National Disaster Management Authority (NDMA)">
                NDMA - National Control Center
              </option>
              <option value="State Disaster Response Force (SDRF)">
                SDRF - State Control Room
              </option>
              <option value="District Disaster Management Authority (DDMA)">
                DDMA - Field Response Unit
              </option>
              <option value="Central Water Commission (CWC)">
                CWC - Hydrological Telemetry Cell
              </option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#0f1a1c",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            {t("loginSubmit")}
          </button>
        </form>

        <div style={{ position: "relative", textAlign: "center", margin: "18px 0" }}>
          <div style={{ height: 1, background: "var(--line)" }} />
          <span
            className="mono"
            style={{
              position: "absolute",
              top: -9,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--bg-panel-raised)",
              padding: "0 10px",
              fontSize: 10,
              color: "var(--text-faint)",
              letterSpacing: "0.05em",
            }}
          >
            EVALUATION / DEMO
          </span>
        </div>

        <button
          onClick={handleDemoLogin}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px dashed var(--accent)",
            background: "rgba(79, 209, 197, 0.08)",
            color: "var(--accent)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ⚡ {t("btnDemoLogin")} ({t("demoOfficer")})
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-faint)", marginTop: 18, marginBotton: 0 }}>
          🔒 Protected National Incident Response Network · Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11.5,
  color: "var(--text-muted)",
  marginBottom: 6,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid var(--line)",
  background: "var(--bg-panel)",
  color: "var(--text-primary)",
  fontSize: 13.5,
  fontFamily: "var(--font-body)",
};
