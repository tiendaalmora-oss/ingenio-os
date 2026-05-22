import { ProjectData } from "../shared/types";

const lavaproData: ProjectData = {
  id: "lavapro",
  name: "LavaPro",
  app: {
    name: "LavaPro",
    colors: {
      primary: "#0EA5E9", // Sky blue
      lime: "#38BDF8",
      gold: "#FDE047", // Yellow for highlight
    }
  },
  landing: {
    hero: {
      badge: "🌊 El kit de gestión para lavanderías",
      title: "Automatizá tu lavandería y dejá de ",
      titleHighlight: "perder tiempo con cada cliente",
      subtitle: "Controlá máquinas, recepción de prendas y caja chica en un solo lugar. Software simple para lavanderías que quieren crecer sin volverse locas.",
      ctaText: "🔵 ORDENAR MI LAVANDERÍA →",
      checkoutUrl: "#",
      mockupImage: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1400&q=80",
    },
    problem: {
      items: [
        { icon: "👗", text: "Prendas perdidas o entregadas al cliente equivocado." },
        { icon: "💰", text: "Problemas con el vuelto y la caja chica todos los días." },
        { icon: "⏱", text: "Clientes quejándose porque su ropa no está lista a tiempo." },
      ]
    },
    targetAudience: {
      items: [
        "Tu lavandería atiende a más de 20 personas por día",
        "Querés dejar empleados a cargo sin miedo a que se descontrole",
        "Necesitás saber cuánto ganás exactamente por mes"
      ]
    },
    pricing: {
      originalPrice: "$45.000 ARS",
      currentPrice: "$25.990 ARS",
      bonuses: [
        "Plantilla Excel de control de químicos",
        "Guía de reclamos de clientes"
      ]
    }
  }
};

export default lavaproData;
