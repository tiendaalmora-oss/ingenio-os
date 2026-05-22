import React from "react";
import { LandingConfig } from "@/projects/shared/types";

interface ProblemSectionProps {
  problem: LandingConfig["problem"];
}

export function ProblemSection({ problem }: ProblemSectionProps) {
  return (
    <section className="problema" style={{ background: "#1A1410", padding: "52px 20px" }}>
      <p className="section-label" style={{ textAlign: "center", fontSize: ".65rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--primary-light)", fontWeight: 700, marginBottom: "8px" }}>
        ¿Te pasa esto?
      </p>
      <h2 className="section-title" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", textAlign: "center", color: "var(--text-light)", marginBottom: "8px", lineHeight: 1.1 }}>
        No necesitás trabajar más.<br/>
        <span style={{ color: "var(--primary-light)", fontSize: "90%" }}>Necesitás método.</span>
      </h2>
      
      <div className="prob-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px", maxWidth: "860px", margin: "24px auto 0" }}>
        {problem.items.map((item, index) => (
          <div key={index} className="prob-item" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(184,92,56,.25)", borderRadius: "6px", padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: "14px", transition: "all .3s" }}>
            <span style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
            <p style={{ fontSize: ".88rem", color: "rgba(255,255,255,.8)", fontWeight: 600, lineHeight: 1.5 }}>
              {item.highlight && <strong style={{ color: "var(--primary-light)" }}>{item.highlight} </strong>}
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
