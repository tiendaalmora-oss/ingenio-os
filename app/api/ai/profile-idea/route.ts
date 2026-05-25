import { NextResponse } from "next/server";

import { invokeCognitiveEngine } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const { title, niche } = await req.json();

    if (!title || !niche) {
      return NextResponse.json(
        { success: false, error: "Título y Nicho son obligatorios" },
        { status: 400 }
      );
    }

    const systemPrompt = `Eres el Director Creativo de Ingenio OS, una plataforma de validación ultra rápida de productos (SaaS e info-productos de alta conversión).
Tu tarea es tomar una idea de producto y su nicho, perfilar el ecosistema de validación comercial y definir una estética y branding únicos y sumamente atractivos para el nicho.

Debes devolver obligatoriamente un objeto JSON con la siguiente estructura exacta:
{
  "avatar": "Perfil detallado del comprador ideal (avatar) en 2-3 oraciones enfocadas en su perfil psicológico y operativo.",
  "pain_points": ["Dolor de cabeza principal 1", "Dolor de cabeza principal 2", "Dolor de cabeza principal 3"],
  "desires": ["Deseo principal 1", "Deseo principal 2", "Deseo principal 3"],
  "offer": "Una oferta irresistible y promesa principal agresiva para la landing (ej: 'Consigue X en Y tiempo sin Z').",
  "product_description": "Breve descripción comercial del producto digital que se entregará (ej: 'Guía práctica con plantillas listas para usar que automatizan el stock').",
  "creative_brief": {
    "slang": ["Expresión o palabra clave 1 usada por el nicho", "Expresión o palabra clave 2", "Expresión o palabra clave 3"],
    "emotional_hook_angle": "El ángulo emocional de conversión dominante para persuadir a este avatar (ej: miedo a que le roben mercadería, deseo de delegar, frustración por vivir apagando incendios).",
    "buyer_sophistication": 3
  },
  "branding": {
    "style_concept": "Concepto visual y de diseño detallado (ej: 'SaaS Premium Dark Mode', 'Warm Maternity Pastel Grid', 'Clean Minimalist Apple Style', 'Bold Street Food Neon Red & Black', 'Vintage Organic Editorial').",
    "colors": {
      "bg": "#CódigoHexaFondo",
      "surface": "#CódigoHexaSuperficieTarjetas",
      "surface2": "#CódigoHexaSuperficieHover",
      "primary": "#CódigoHexaColorPrincipal",
      "primary_hover": "#CódigoHexaColorPrincipalHover",
      "accent": "#CódigoHexaColorDeAcentoGlow",
      "text": "#CódigoHexaTextoPrincipal",
      "text_secondary": "#CódigoHexaTextoSecundario",
      "border": "#CódigoHexaBordes"
    },
    "fonts": {
      "title_font": "Nombre de Google Font para títulos (ej: Space Grotesque, Outfit, Playfair Display, Montserrat, Cabinet Grotesk)",
      "body_font": "Nombre de Google Font para cuerpo (ej: Inter, Plus Jakarta Sans, Roboto)"
    },
    "google_fonts_url": "URL de importación completa de Google Fonts (ej: https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Inter:wght@400;600&display=swap)",
    "icon_style": "Estilo visual de los iconos (ej: minimalist outline stroke, playful filled rounded, high-contrast neon)"
  }
}

Pautas para paletas de color y fuentes:
- Elige paletas de color con excelente contraste y coherentes con la temática:
  * Si es SaaS/Soft/Tech: Colores de fondo oscuros (#0A0F0D) con acentos neón azul, cian o verde, y fuentes geométricas.
  * Si es Infantil/Maternidad: Colores de fondo pasteles suaves (#FAF6F0) con acentos rosa/crema/verde suave y fuentes redondeadas cálidas.
  * Si es Comida/Restaurantes: Fondos oscuros/cálidos con acentos rojos, naranjas o amarillos de alto impacto.
  * Si es Industrial/Herramientas: Fondos oscuros o grises con acento naranja seguridad o amarillo industrial y fuentes bold gruesas.
- Asegúrate de que las fuentes estén bien escritas y el google_fonts_url coincida con las fuentes seleccionadas en formato de URL válida.

Responde únicamente con el objeto JSON válido. No agregues texto adicional antes o después del JSON.`;

    const userPrompt = `Idea: "${title}"\nNicho: "${niche}"`;

    const content = await invokeCognitiveEngine({
      taskType: 'DATA_EXTRACTION',
      format: 'json',
      systemPrompt,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.7
    });

    const profileData = JSON.parse(content);
    return NextResponse.json({ success: true, profile: profileData });
  } catch (err: any) {
    console.error("Error profiling idea:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al perfilar la idea" },
      { status: 500 }
    );
  }
}
