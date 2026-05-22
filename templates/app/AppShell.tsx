import React from "react";
import { AppConfig } from "@/projects/shared/types";
import Head from "next/head";

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface AppShellProps {
  app: AppConfig;
  navItems: NavItem[];
  activeNavId: string;
  onNavClick?: (id: string) => void;
  children: React.ReactNode;
  headerBadges?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function AppShell({ app, navItems, activeNavId, onNavClick, children, headerBadges, headerRight }: AppShellProps) {
  const cssVariables = {
    "--primary": app.colors.primary,
    "--lime": app.colors.lime,
    "--bg": "#081008",
    "--surface": "#121A12",
    "--surface2": "#182218",
    "--surface3": "#1E2C1E",
    "--sidebar-bg": "#0A120A",
    "--txt": "#F3F4F6",
    "--txt2": "#9CA3AF",
    "--border": "#273527",
    "--border2": "#344734",
    "--primary-g": "rgba(16, 185, 129, 0.15)", // This should be dynamic based on primary color, simplified here
  } as React.CSSProperties;

  return (
    <div style={cssVariables} className="app-factory-shell">
      <Head>
        <title>{app.name} - Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          .app-factory-shell { height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--txt); font-family: 'Inter', sans-serif; overflow: hidden; }
          .app-factory-shell * { box-sizing: border-box; margin: 0; padding: 0; }
          
          /* HDR */
          .af-hdr { height: 54px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: var(--surface); border-bottom: 1px solid var(--border); }
          .af-hdr-brand { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
          .af-hdr-brand span { color: var(--primary); }
          .af-hdr-center { display: flex; gap: 12px; }
          .af-hdr-right { display: flex; align-items: center; gap: 16px; }

          /* LAYOUT */
          .af-shell { display: flex; flex: 1; overflow: hidden; }
          .af-sidebar { width: 76px; flex-shrink: 0; background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 6px 0; gap: 2px; }
          .af-nitem { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; height: 68px; cursor: pointer; border-left: 2.5px solid transparent; transition: all 0.15s; }
          .af-nitem:hover { background: var(--surface2); }
          .af-nitem.on { background: var(--primary-g); border-left-color: var(--primary); }
          .af-nitem .ni { font-size: 1.35rem; }
          .af-nitem .nl { font-size: 0.6rem; color: var(--txt2); letter-spacing: 0.02em; }
          .af-nitem.on .nl { color: var(--primary); }
          
          .af-main { flex: 1; overflow-y: auto; overflow-x: hidden; }
          
          /* UI COMPONENTS BASE */
          .af-btn { background: var(--primary); color: var(--bg); border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
          .af-btn:hover { filter: brightness(1.1); }
          .af-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; border-top: 3px solid var(--border); }
          .af-table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 16px; overflow: hidden; }
          .af-table th { font-size: 0.7rem; color: var(--txt2); text-transform: uppercase; padding: 12px 16px; border-bottom: 1px solid var(--border2); text-align: left; background: var(--surface2); }
          .af-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 0.86rem; }
        `}</style>
      </Head>

      <header className="af-hdr">
        <div className="af-hdr-brand">
          <span>{app.name.substring(0, app.name.length / 2)}</span>
          <span style={{ color: "var(--lime)" }}>{app.name.substring(app.name.length / 2)}</span>
        </div>
        <div className="af-hdr-center">
          {headerBadges}
        </div>
        <div className="af-hdr-right">
          {headerRight || <span style={{ fontFamily: "'Outfit'", color: "var(--lime)", fontWeight: 700, fontSize: "0.9rem" }}>00:00</span>}
        </div>
      </header>

      <div className="af-shell">
        <nav className="af-sidebar">
          {navItems.map(item => (
            <div 
              key={item.id} 
              className={`af-nitem ${activeNavId === item.id ? "on" : ""}`}
              onClick={() => onNavClick?.(item.id)}
            >
              <span className="ni">{item.icon}</span>
              <span className="nl">{item.label}</span>
            </div>
          ))}
        </nav>
        <main className="af-main">
          {children}
        </main>
      </div>
    </div>
  );
}
