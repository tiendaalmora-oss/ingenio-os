import { ProjectData } from "../shared/types";

const carnigestionData: ProjectData = {
  id: "carnigestion",
  name: "CarniGestión",
  app: {
    name: "CarniGestión",
    colors: {
      primary: "#ff5c5c", // Red
      lime: "#ff8080",
      gold: "#FDE047",
    }
  },
  landing: {
    hero: {
      badge: "🥩 El kit de gestión para carnicerías",
      title: "Controlá el stock y las mermas de tu ",
      titleHighlight: "carnicería sin dolores de cabeza",
      subtitle: "Software simple para carniceros. Deja de adivinar cuánto ganás y empezá a tener rentabilidad real.",
      ctaText: "🔴 ORDENAR MI CARNICERÍA →",
      checkoutUrl: "#",
      mockupImage: "https://images.unsplash.com/photo-1607006411011-8664426569eb?w=1400&q=80",
    },
    problem: {
      items: [
        { icon: "🥩", text: "Falta de control exacto sobre el stock de medias reses." },
        { icon: "🔪", text: "Mermas por desposte no calculadas." },
        { icon: "📉", text: "Variación de precios sin actualización rápida en mostrador." },
      ]
    },
    targetAudience: {
      items: [
        "Tu carnicería maneja más de 2 medias reses por semana",
        "Querés saber exactamente cuál es tu margen de ganancia",
        "Necesitás que tus empleados sigan un protocolo estandarizado"
      ]
    },
    pricing: {
      originalPrice: "$45.000 ARS",
      currentPrice: "$25.990 ARS",
      bonuses: [
        "Calculadora de Desposte en Excel",
        "Guía de cortes rentables"
      ]
    }
  }
};

export default carnigestionData;
