import React from "react";
import { LandingConfig } from "@/projects/shared/types";

interface PricingSectionProps {
  pricing: LandingConfig["pricing"];
}

export function PricingSection({ pricing }: PricingSectionProps) {
  return (
    <section id="precio" className="precio-section" style={{ background: "linear-gradient(160deg, #1A1008, #2A1C10)", padding: "56px 0", position: "relative", overflow: "hidden" }}>
      <div className="single-plan" style={{ maxWidth: "480px", margin: "0 auto", background: "#1E1410", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, var(--primary), var(--primary-dark), var(--secondary), var(--primary-dark), var(--primary))" }}></div>
        
        <div className="sp-inner" style={{ padding: "32px 28px 36px" }}>
          <div style={{ display: "inline-block", background: "linear-gradient(90deg, var(--primary), var(--primary-dark))", color: "#fff", fontSize: "9px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px", marginBottom: "16px" }}>
            MÁS ELEGIDO
          </div>
          
          <h3 className="sp-name" style={{ fontSize: "22px", fontWeight: 900, color: "#fff", marginBottom: "6px", fontFamily: "'Montserrat', sans-serif", textAlign: "center" }}>
            Licencia de Por Vida
          </h3>
          <p className="sp-desc" style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", lineHeight: 1.6, marginBottom: "18px", textAlign: "center" }}>
            Acceso completo al kit. Sin pagos mensuales ni comisiones ocultas. Pagás una vez, lo usás para siempre.
          </p>
          
          <div className="sp-price-old" style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", textDecoration: "line-through", fontWeight: 600, textAlign: "center", marginBottom: "4px" }}>
            Precio Normal: {pricing.originalPrice}
          </div>
          
          <div className="sp-price-row" style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="sp-price-num" style={{ fontSize: "52px", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, fontFamily: "'Montserrat', sans-serif", color: "var(--secondary-light)" }}>
              {pricing.currentPrice}
            </span>
            <span className="sp-price-period" style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,.4)", textAlign: "center", marginBottom: "6px" }}>
              / PAGO ÚNICO
            </span>
          </div>
          
          <div className="sp-features" style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: 0, marginTop: "24px" }}>
            <div className="sp-feature" style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.07)", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,.85)", lineHeight: 1.4 }}>
              <span className="sp-check" style={{ color: "var(--secondary-light)", flexShrink: 0, fontSize: "13px", fontWeight: 900 }}>✓</span>
              Sistema de Gestión Permanente
            </div>
            {pricing.bonuses.map((bono, idx) => (
              <div key={idx} className="sp-feature" style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.07)", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,.85)", lineHeight: 1.4 }}>
                <span className="sp-check" style={{ color: "var(--secondary-light)", flexShrink: 0, fontSize: "13px", fontWeight: 900 }}>✓</span>
                BONO: {bono}
                <span className="sp-new" style={{ display: "inline-block", fontSize: "8px", fontWeight: 800, letterSpacing: ".05em", background: "rgba(168,130,10,.25)", color: "var(--secondary-light)", padding: "1px 6px", borderRadius: "4px", marginLeft: "5px", verticalAlign: "middle" }}>GRATIS</span>
              </div>
            ))}
          </div>
          
          <a href="#" className="sp-btn" style={{ display: "block", width: "100%", textAlign: "center", padding: "18px", borderRadius: "8px", fontFamily: "'Montserrat', sans-serif", fontSize: "15px", fontWeight: 800, textDecoration: "none", cursor: "pointer", border: "none", letterSpacing: ".06em", textTransform: "uppercase", transition: "all .15s", background: "linear-gradient(135deg, var(--secondary), var(--secondary-dark))", color: "var(--text-dark)", boxShadow: "0 6px 24px rgba(168,130,10,.5)" }}>
            ORDENAR AHORA
          </a>
          <div className="sp-note" style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,.3)", marginTop: "10px" }}>
            🔒 Pago seguro · Entrega inmediata al email
          </div>
        </div>
      </div>
    </section>
  );
}
