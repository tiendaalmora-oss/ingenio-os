import React from "react";
import { LandingConfig } from "@/projects/shared/types";

interface HeroSectionProps {
  hero: LandingConfig["hero"];
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="hero" style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px" }}>
      <div className="hero-badge" style={{ display: "inline-block", border: "1px solid var(--secondary)", color: "var(--secondary-light)", fontSize: ".65rem", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700, padding: "7px 22px", marginBottom: "16px" }}>
        {hero.badge}
      </div>
      
      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "clamp(1.7rem, 4.5vw, 3.2rem)", color: "var(--text-light)", lineHeight: 1.05, letterSpacing: "-.5px", maxWidth: "780px" }}>
        {hero.title}
        <span style={{ color: "var(--primary-light)", display: "block", marginTop: "6px" }}>
          {hero.titleHighlight}
        </span>
      </h1>
      
      <p className="hero-sub" style={{ fontSize: "clamp(.9rem, 2vw, 1.05rem)", color: "rgba(255,255,255,.72)", maxWidth: "560px", lineHeight: 1.7, margin: "18px auto 0" }}>
        {hero.subtitle}
      </p>

      <div className="hero-mockup" style={{ margin: "28px auto 24px", maxWidth: "600px", width: "88%" }}>
        <img src={hero.mockupImage} alt="Mockup" style={{ width: "100%", display: "block", borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }} />
      </div>

      <div className="hero-cta" style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <a href="#precio" className="btn-primary" style={{ display: "inline-block", background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "var(--text-light)", fontFamily: "'Montserrat', sans-serif", fontSize: "1rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", textDecoration: "none", padding: "20px 52px", borderRadius: "4px", border: "2px solid var(--secondary)", cursor: "pointer", transition: "all .3s" }}>
          {hero.ctaText}
        </a>
        <a href="#precio" className="hero-skip" style={{ color: "rgba(255,255,255,.4)", fontSize: ".75rem", fontWeight: 600, textDecoration: "none", letterSpacing: "1px" }}>
          Ver precio →
        </a>
      </div>
    </section>
  );
}
