import React from "react";
import { LandingConfig } from "@/projects/shared/types";

interface TargetAudienceSectionProps {
  audience: LandingConfig["targetAudience"];
}

export function TargetAudienceSection({ audience }: TargetAudienceSectionProps) {
  return (
    <section className="paraquien" style={{ background: "var(--bg-light)", padding: "44px 20px" }}>
      <p className="section-label" style={{ textAlign: "center", fontSize: ".65rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, marginBottom: "8px" }}>
        Este kit es para vos si...
      </p>
      <h2 className="section-title" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", textAlign: "center", color: "var(--text-dark)", marginBottom: "8px", lineHeight: 1.1 }}>
        ¿Te <em style={{ color: "var(--primary)", fontStyle: "normal" }}>identificás?</em>
      </h2>
      <div className="dots" style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
        <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }}></div>
        <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--secondary-light)" }}></div>
        <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }}></div>
      </div>
      
      <div className="pq-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", maxWidth: "800px", margin: "20px auto 0" }}>
        {audience.items.map((item, index) => (
          <div key={index} className="pq-item" style={{ background: "var(--bg-white)", borderRadius: "6px", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: "12px", borderLeft: "4px solid var(--primary)", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
            <p style={{ fontSize: ".88rem", color: "var(--text-dark)", fontWeight: 700, lineHeight: 1.4 }}>
              ✅ {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
