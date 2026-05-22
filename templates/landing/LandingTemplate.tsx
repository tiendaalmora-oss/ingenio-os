import React from "react";
import { LandingConfig, AppConfig } from "@/projects/shared/types";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { TargetAudienceSection } from "./TargetAudienceSection";
import { PricingSection } from "./PricingSection";
import Head from "next/head";

interface LandingTemplateProps {
  landing: LandingConfig;
  app: AppConfig;
}

export function LandingTemplate({ landing, app }: LandingTemplateProps) {
  // Configuración de variables CSS globales inyectadas para este producto
  const cssVariables = {
    "--primary": app.colors.primary,
    "--primary-light": app.colors.primaryLight || app.colors.primary,
    "--primary-dark": app.colors.primaryDark || app.colors.primary,
    "--secondary": app.colors.gold,
    "--secondary-light": app.colors.goldLight || app.colors.gold,
    "--secondary-dark": app.colors.goldDark || app.colors.gold,
    "--bg-dark": "#16120E",
    "--bg-light": "#FAF5EE",
    "--text-dark": "#16120E",
    "--text-light": "#FFFFFF",
  } as React.CSSProperties;

  return (
    <div style={cssVariables} className="product-landing-factory">
      <Head>
        <title>{app.name} · Sistema de Gestión</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: "var(--bg-dark)", color: "var(--text-dark)", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", overflowX: "hidden" }}>
        
        {/* STICKY BAR */}
        <div className="vp-sticky-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(22, 18, 14, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(168, 130, 10, 0.2)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="vp-sticky-brand" style={{ fontWeight: 800, color: "var(--secondary-light)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{app.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="vp-sticky-urgency" style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600, textAlign: "right", marginRight: "12px" }}>
              Solo <strong style={{ color: "var(--primary-light)", fontWeight: 800 }}>30</strong> cupos
            </div>
            <a href="#precio" className="vp-sticky-btn" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "#fff", padding: "8px 18px", borderRadius: "4px", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none", border: "1px solid var(--secondary)" }}>
              Ordenar Hoy →
            </a>
          </div>
        </div>

        <HeroSection hero={landing.hero} />
        <ProblemSection problem={landing.problem} />
        <TargetAudienceSection audience={landing.targetAudience} />
        <PricingSection pricing={landing.pricing} />

        {/* FOOTER */}
        <footer style={{ background: "#0E0A06", textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,.2)", fontSize: ".76rem", lineHeight: 1.8 }}>
          &copy; {new Date().getFullYear()} <strong>{app.name}</strong>. Todos los derechos reservados.<br/>
          <span style={{ fontSize: "10px" }}>Desarrollado con Ingenio OS</span>
        </footer>

      </div>
    </div>
  );
}
