"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

const TYPES = ["Flood", "Landslide", "Fire", "Other"];

export default function ReportForm({ villages, onClose }) {
  const addReport = useStore((s) => s.addReport);
  const t = useStore((s) => s.t);
  const [type, setType] = useState("Flood");
  const [villageId, setVillageId] = useState(villages[0]?.id || "");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    addReport({ villageId, type, description, image });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 12, 13, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: "min(460px, 100%)",
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: 0, fontWeight: 700 }}>
            🚨 {t("reportFormTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "6px 0 16px", lineHeight: 1.4 }}>
          {t("reportFormSubtitle")}
        </p>

        {submitted ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>
            ✓ {t("reportSuccess")}
          </div>
        ) : (
          <>
            <label style={fieldLabel}>{t("incidentType")}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {TYPES.map((typeKey) => {
                const label =
                  typeKey === "Flood" ? t("flood") : typeKey === "Landslide" ? t("landslide") : typeKey === "Fire" ? t("fire") : t("other");
                return (
                  <button
                    type="button"
                    key={typeKey}
                    onClick={() => setType(typeKey)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${type === typeKey ? "var(--accent)" : "var(--line)"}`,
                      background: type === typeKey ? "rgba(79,209,197,0.15)" : "transparent",
                      color: type === typeKey ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <label style={fieldLabel}>{t("nearestVillage")}</label>
            <select
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              style={inputStyle}
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.ward})
                </option>
              ))}
            </select>

            <label style={{ ...fieldLabel, marginTop: 12 }}>{t("whatsHappening")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder={t("placeholderDescription")}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
            />

            <label style={{ ...fieldLabel, marginTop: 12 }}>{t("photoAttachment")}</label>
            <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 12.5, color: "var(--text-muted)" }} />
            {image && (
              <img
                src={image}
                alt="Attached preview"
                style={{ marginTop: 10, maxHeight: 120, borderRadius: 6, border: "1px solid var(--line)" }}
              />
            )}

            <button
              type="submit"
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 0",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#0f1a1c",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t("btnSubmitReport")}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

const fieldLabel = {
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
  padding: "9px 10px",
  borderRadius: 6,
  border: "1px solid var(--line)",
  background: "var(--bg-panel)",
  color: "var(--text-primary)",
  fontSize: 13.5,
};
