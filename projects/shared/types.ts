/**
 * Ingenio OS — Shared Types
 * Used across projects and templates.
 */

export type ProjectSection = "landing" | "demo" | "manual";

export interface PageProps {
  params: Promise<{ project: string }>;
}

export interface SectionPageProps {
  params: Promise<{ project: string }>;
}

export interface LandingConfig {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaText: string;
    checkoutUrl: string;
    mockupImage: string;
  };
  problem: {
    items: { icon: string; text: string; highlight?: string }[];
  };
  targetAudience: {
    items: string[];
  };
  pricing: {
    originalPrice: string;
    currentPrice: string;
    bonuses: string[];
  };
}

export interface AppConfig {
  name: string;
  colors: {
    primary: string;
    lime: string;
    gold: string;
    [key: string]: string;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  isTemplate?: boolean;
  legacy?: boolean;
  landing?: LandingConfig;
  app?: AppConfig;
}
