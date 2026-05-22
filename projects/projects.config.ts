/**
 * Ingenio OS — Project Registry
 *
 * This is the SINGLE SOURCE OF TRUTH for all SaaS products.
 * Adding a new project requires ONLY:
 *   1. Creating a folder under /projects/<key>
 *   2. Adding an entry here
 */

export type ProjectSection = "landing" | "demo" | "manual";
export type ProjectStatus = "idea" | "researching" | "validating" | "building" | "launched" | "scaling" | "paused";

export interface ProjectConfig {
  /** Display name */
  name: string;
  /** Business category */
  type: string;
  /** Brand color (hex) */
  color: string;
  /** Subdomain prefix (e.g. "verdepro" → verdepro.ingeniodigital.shop) */
  subdomain: string;
  /** Short tagline for OS dashboard */
  tagline: string;
  /** Which sections this project currently has published */
  sections: ProjectSection[];
  /** OS Platform Extensions */
  status: ProjectStatus;
  /** Marca este producto como template maestro reutilizable */
  isTemplate?: boolean;
  /** true = sirve HTML estático desde public/legacy/, false = componente React */
  legacy?: boolean;
  metrics?: {
    mrr?: number;
    leads?: number;
    roas?: number;
  };
  deployment?: {
    docker: boolean;
    ssl: boolean;
    domain: string;
    status: "live" | "down" | "deploying";
  };
}

export const projects: Record<string, ProjectConfig> = {
  verdepro: {
    name: "VerdePro",
    type: "verduleria",
    color: "#00ff88",
    subdomain: "verdepro",
    tagline: "Software de gestión para verdulerías",
    sections: ["landing", "demo", "manual"],
    status: "launched",
    isTemplate: true,
    legacy: true,
    metrics: { mrr: 450, leads: 120, roas: 3.5 },
    deployment: { docker: true, ssl: true, domain: "verdepro.ingeniodigital.shop", status: "live" },
  },
  lavapro: {
    name: "LavaPro",
    type: "lavanderia",
    color: "#00c8ff",
    subdomain: "lavapro",
    tagline: "Software de gestión para lavanderías",
    sections: ["landing", "demo", "manual"],
    status: "scaling",
    metrics: { mrr: 1200, leads: 350, roas: 5.2 },
    deployment: { docker: true, ssl: true, domain: "lavapro.ingeniodigital.shop", status: "live" },
  },
  carnigestion: {
    name: "CarniGestión",
    type: "carniceria",
    color: "#ff5c5c",
    subdomain: "carnigestion",
    tagline: "Software de gestión para carnicerías",
    sections: ["landing", "demo", "manual"],
    status: "building",
    metrics: { leads: 45 },
    deployment: { docker: true, ssl: false, domain: "carnigestion.ingeniodigital.shop", status: "deploying" },
  },
};

/** Returns all registered project keys */
export function getProjectKeys(): string[] {
  return Object.keys(projects);
}

/** Returns config for a given project key, or undefined */
export function getProject(key: string): ProjectConfig | undefined {
  return projects[key];
}
