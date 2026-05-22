export interface Campaign {
  id: string;
  name: string;
  product: string;
  status: "active" | "paused" | "completed";
  budget: number;
  objective: string;
}

export interface Creative {
  id: string;
  campaignId: string;
  hook: string;
  copy: string;
  format: "video" | "image" | "carousel";
  status: "testing" | "winning" | "killed";
  winner?: boolean;
}

export const mockCampaigns: Campaign[] = [
  { id: "c1", name: "Lanzamiento LavaPro - May 26", product: "LavaPro", status: "active", budget: 1500, objective: "Leads" },
  { id: "c2", name: "VerdePro Remarketing", product: "VerdePro", status: "active", budget: 500, objective: "Conversión" },
];

export const mockCreatives: Creative[] = [
  { id: "cr1", campaignId: "c1", hook: "¿Perdés ropa en tu lavandería?", copy: "LavaPro es el sistema que...", format: "video", status: "winning", winner: true },
  { id: "cr2", campaignId: "c1", hook: "Gestioná turnos más rápido", copy: "Automatizá los retiros...", format: "image", status: "killed" },
  { id: "cr3", campaignId: "c1", hook: "El software para lavanderías", copy: "LavaPro te permite...", format: "carousel", status: "testing" },
  { id: "cr4", campaignId: "c2", hook: "¿Aún usás Excel en tu verdulería?", copy: "Cambiá a VerdePro hoy", format: "video", status: "winning", winner: true },
];
