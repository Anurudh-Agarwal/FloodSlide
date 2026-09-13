"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

const TYPES = ["Flood", "Landslide", "Fire", "Other"];

export default function ReportForm({ villages, onClose }) {
  const addReport = useStore((s) => s.addReport);
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
    }, 900);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6, 12, 13, 0.7)",
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
          width: "min(440px, 100%)",
          background: "var(--bg-panel-raised)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: 22,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: 0 }}>
            Report an incident
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
        <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "6px 0 16px" }}>
          This goes into the shared demo feed the rescue team can see. It does not notify anyone in real life.
        </p>

        {submitted ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--accent)", fontSize: 14, fontWeight: 500 }}>
            Report submitted.
          </div>
        ) : (
          <>
            <label style={fieldLabel}>Type</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1px solid ${type === t ? "var(--accent)" : "var(--line)"}`,
                    background: type === t ? "rgba(79,209,197,0.12)" : "transparent",
                    color: type === t ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <label style={fieldLabel}>Nearest village</label>
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

            <label style={{ ...fieldLabel, marginTop: 12 }}>What's happening</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Water rising near the lower bridge"
              style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
            />

            <label style={{ ...fieldLabel, marginTop: 12 }}>Photo (optional)</label>
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
                marginTop: 18,
                width: "100%",
                padding: "11px 0",
                borderRadius: 7,
                border: "none",
                background: "var(--accent)",
                color: "#0f1a1c",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Submit report
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
  color: "var(--text-faint)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
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
