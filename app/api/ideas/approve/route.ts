import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const rawModel = process.env.OPENROUTER_MODEL || "";
const DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "deepseek/deepseek-chat";

// Helper to create clean slugs
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export async function POST(req: Request) {
  try {
    const { ideaId, landingTemplate, productoTemplate, manualTemplate, checkoutUrl } = await req.json();

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: "El ID de la idea es obligatorio" },
        { status: 400 }
      );
    }

    // 1. Obtener la idea de la base de datos
    const { data: idea, error: ideaErr } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (ideaErr || !idea) {
      return NextResponse.json(
        { success: false, error: "No se encontró la idea especificada" },
        { status: 404 }
      );
    }

    const slug = generateSlug(idea.title);
    const title = idea.title;
    const niche = idea.niche;
    const offer = idea.offer || idea.title;
    const desc = idea.product_description || idea.notes || "";
    
    // Parse arrays
    const painPoints = Array.isArray(idea.pain_points) 
      ? idea.pain_points 
      : typeof idea.pain_points === 'string' 
        ? JSON.parse(idea.pain_points) 
        : [];
    const desires = Array.isArray(idea.desires) 
      ? idea.desires 
      : typeof idea.desires === 'string' 
        ? JSON.parse(idea.desires) 
        : [];

    // 2. Crear el Producto en la base de datos
    const { error: prodErr } = await supabase.from("products").insert([
      {
        slug,
        name: title,
        niche: niche,
        type: "Producto Digital", // Tipo obligatorio en BD
        color: "#10b981",         // Color por defecto
        status: "CONSTRUYENDO",
        price: 29.99, // precio base por defecto
        checkout_url: checkoutUrl || "", // editable en la ficha, inicializado por UI
        delivery_manual: ""
      },
    ]);

    if (prodErr && !prodErr.message.includes("duplicate key")) {
      throw new Error(`Error al crear producto: ${prodErr.message}`);
    }

    // 3. Crear variante de landing principal en la DB
    const { data: variant, error: varErr } = await supabase
      .from("landing_variants")
      .insert([
        {
          product_slug: slug,
          name: "Landing Principal",
          type: "direct_response",
          is_main: true,
          status: "PUBLISHED",
          config: {
            folder: "landing",
            hook: offer,
            copy: desc,
            ctaText: `Quiero obtener ${title}`,
            checkoutUrl: checkoutUrl || "",
            primaryColor: "#10b981",
          },
        },
      ])
      .select()
      .single();

    if (varErr) {
      console.warn("Advertencia al crear variante de landing:", varErr.message);
    }

    // 4. Copiar y Adaptar la Estructura de Plantillas Ganadoras (File System)
    const baseLegacyDir = path.join(process.cwd(), "public", "legacy", slug);
    const landingDir = path.join(baseLegacyDir, "landing");
    const demoDir = path.join(baseLegacyDir, "demo");
    const manualDir = path.join(baseLegacyDir, "manual");
    const productDir = path.join(baseLegacyDir, "producto");

    // Crear todas las carpetas físicas
    [landingDir, demoDir, manualDir, productDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const templateSource = path.join(process.cwd(), "pantillas");

    // A. Adaptar Landing
    if (landingTemplate && landingTemplate !== "") {
      const landingTemplatePath = path.join(templateSource, "landing", landingTemplate);
      if (fs.existsSync(landingTemplatePath)) {
        let html = fs.readFileSync(landingTemplatePath, "utf8");

        // Dividir el nombre del logo
        const nameParts = title.split(" ");
        const firstWord = nameParts[0] || "";
        const remainingWords = nameParts.slice(1).join(" ") || "";

        // Reemplazos genéricos
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title} - ${niche}</title>`);
        html = html.replace(
          /<div class="brand"><span class="v">Verde<\/span><span class="p">Pro<\/span><\/div>/g,
          `<div class="brand"><span class="v">${firstWord}</span><span class="p">${remainingWords}</span></div>`
        );
        html = html.replace(/VerdePro/g, title);

        // Reemplazo del Hero Title (Hook) y Hero Sub (Copy)
        html = html.replace(
          /Transformá tu verdulería en un negocio <b>con orden, control y ganancia real.<\/b>/,
          offer
        );
        html = html.replace(
          /Dejá de hacer cuentas a mano y vivir apagando incendios\. Con VerdePro controlás ventas, caja, stock, fiado y compras desde un solo lugar — y podés delegar con tranquilidad\./,
          desc
        );
        html = html.replace(
          /SISTEMA EXCLUSIVO PARA VERDULEROS ARGENTINOS/g,
          `SOLUCIÓN INTEGRAL PARA EL NICHO: ${niche.toUpperCase()}`
        );
        html = html.replace(/QUIERO ORDENAR MI VERDULERÍA/g, `OBTENER ${title.toUpperCase()}`);

        if (painPoints.length >= 1) html = html.replace(/La caja tiene plata… pero no sabés cuánto ganaste/g, painPoints[0]);
        if (painPoints.length >= 2) html = html.replace(/Pérdida silenciosa de mercadería/g, painPoints[1]);
        if (painPoints.length >= 3) html = html.replace(/El fiado está en papel o en tu cabeza/g, painPoints[2]);
        if (painPoints.length >= 4) html = html.replace(/Todo depende de vos para funcionar/g, painPoints[3]);

        if (desires.length >= 1) html = html.replace(/Sabés exactamente cuánto ganás por día/g, desires[0]);
        if (desires.length >= 2) html = html.replace(/Eliminás la calculadora y la libreta/g, desires[1]);
        if (desires.length >= 3) html = html.replace(/Delegás el local sin perder el control/g, desires[2]);

        fs.writeFileSync(path.join(landingDir, "index.html"), html, "utf8");
      }
    }

    // B. Adaptar Manual
    if (manualTemplate && manualTemplate !== "") {
      const manualTemplatePath = path.join(templateSource, "entrega de producto", manualTemplate);
      if (fs.existsSync(manualTemplatePath)) {
        let html = fs.readFileSync(manualTemplatePath, "utf8");

        const nameParts = title.split(" ");
        const firstWord = nameParts[0] || "";
        const remainingWords = nameParts.slice(1).join(" ") || "";

        html = html.replace(/<title>.*?<\/title>/i, `<title>Manual de Entrega - ${title}</title>`);
        html = html.replace(
          /<div class="brand"><span class="v">Verde<\/span><span class="p">Pro<\/span><\/div>/g,
          `<div class="brand"><span class="v">${firstWord}</span><span class="p">${remainingWords}</span></div>`
        );
        html = html.replace(/VerdePro/g, title);
        html = html.replace(
          /Bienvenido al Centro de Control y Capacitación\. Aquí encontrarás todo el material, accesos y el manual paso a paso para dominar tu sistema\./,
          `Bienvenido al área de entrega de ${title}. A continuación encontrarás los accesos y el manual paso a paso para utilizar tu nuevo producto.`
        );

        fs.writeFileSync(path.join(manualDir, "index.html"), html, "utf8");
        
        // Guardar el manual en la DB del producto para edición Markdown futura
        await supabase.from("products").update({
          delivery_manual: `# Manual de Entrega: ${title}\n\nEste es tu manual de entrega autogenerado. Puedes editarlo desde la pestaña de manual.`
        }).eq("slug", slug);
      }
    }

    // C. Adaptar Producto
    if (productoTemplate && productoTemplate !== "") {
      const productTemplatePath = path.join(templateSource, "producto", productoTemplate);
      if (fs.existsSync(productTemplatePath)) {
        let html = fs.readFileSync(productTemplatePath, "utf8");
        html = html.replace(/VerdePro/g, title);
        fs.writeFileSync(path.join(productDir, "index.html"), html, "utf8");
      }
      
      // Buscar archivos complementarios con el mismo nombre base (ej: zip)
      const prodExt = path.extname(productoTemplate);
      const prodBase = path.basename(productoTemplate, prodExt);
      const folderPath = path.join(templateSource, "producto");
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.startsWith(prodBase) && file.endsWith(".zip")) {
            fs.copyFileSync(path.join(folderPath, file), path.join(productDir, `${slug}_Software.zip`));
          }
        }
      }
    }

    // 5. Generar 3 Conceptos Creativos y Scripts mediante IA (DeepSeek)
    if (OPENROUTER_API_KEY) {
      try {
        const aiPrompt = `Estás lanzando una campaña de anuncios en Meta para validar un nuevo producto digital.
Producto: "${title}"
Nicho: "${niche}"
Oferta irresistible: "${offer}"
Dolores principales: ${painPoints.join(", ")}

Genera exactamente 3 hipótesis creativas (ángulos de anuncio) con sus respectivos guiones de video y copys de texto.
La respuesta debe ser obligatoriamente un objeto JSON con la estructura:
{
  "angles": [
    {
      "name": "Nombre corto del ángulo 1 (ej: Dolor Directo, Caso de Estudio)",
      "description": "Explicación del ángulo y por qué funcionaría en 1 oración.",
      "hook": "Gancho de 3 segundos agresivo (texto principal del video).",
      "copy": "Copy escrito para Meta Ads.",
      "script": "Guión completo de video corto (30s) estructurado: [GANCHO 3s] -> [PROBLEMA 10s] -> [SOLUCIÓN 10s] -> [CTA 7s]"
    },
    {
      "name": "Nombre corto del ángulo 2",
      "description": "Explicación...",
      "hook": "Gancho...",
      "copy": "Copy...",
      "script": "Guión..."
    },
    {
      "name": "Nombre corto del ángulo 3",
      "description": "Explicación...",
      "hook": "Gancho...",
      "copy": "Copy...",
      "script": "Guión..."
    }
  ]
}
Responde únicamente con el JSON válido.`;

        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://os.ingeniodigital.shop",
            "X-Title": "Ingenio OS",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: aiPrompt }],
            temperature: 0.8,
            max_tokens: 2500,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          let content = aiData.choices?.[0]?.message?.content || "{}";
          
          content = content.trim();
          if (content.startsWith("```json")) {
            content = content.replace(/^```json/, "").replace(/```$/, "").trim();
          } else if (content.startsWith("```")) {
            content = content.replace(/^```/, "").replace(/```$/, "").trim();
          }

          const parsed = JSON.parse(content);

          if (parsed.angles && Array.isArray(parsed.angles)) {
            for (let i = 0; i < parsed.angles.length; i++) {
              const angle = parsed.angles[i];
              
              // 1. Guardar concepto
              const { data: concept } = await supabase
                .from("creative_concepts")
                .insert({
                  product_slug: slug,
                  name: angle.name,
                  description: angle.description,
                })
                .select()
                .single();

              if (concept) {
                // 2. Guardar script base como asset físico
                const { data: assetScript } = await supabase
                  .from("creative_assets")
                  .insert({
                    product_slug: slug,
                    type: "script",
                    content: angle.script,
                  })
                  .select()
                  .single();

                // 3. Crear paquete creativo operacional en Testing
                await supabase.from("creative_packages").insert({
                  product_slug: slug,
                  name: `Fase 1: ${angle.name}`,
                  concept_id: concept.id,
                  hook_text: angle.hook,
                  copy_text: angle.copy,
                  status: "TESTING",
                  landing_variant_id: variant?.id || null,
                  metrics: { ctr: 0, cpc: 0, hook_rate: 0, thumb_stop: 0, roas: 0 },
                });
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error generating AI creatives during approval:", err.message);
      }
    }

    // 6. Crear checklist operacional básica en product_tasks
    const defaultTasks = [
      "Definir oferta final y precio del producto",
      "Revisar y corregir textos de la Landing Page",
      "Comprobar el correcto funcionamiento de los botones de pago (Checkout)",
      "Revisar y ajustar el Manual de Entrega del Producto",
      "Subir y enlazar el producto digital final (.zip o pdf)",
      "Grabar o crear las piezas de anuncios (6 imágenes/videos basados en los guiones autogenerados)",
      "Configurar la campaña publicitaria en Meta Ads Manager",
    ];

    await supabase.from("product_tasks").insert(
      defaultTasks.map((t) => ({
        product_slug: slug,
        title: t,
        completed: false,
      }))
    );

    // 7. Actualizar el estado de la idea a 'approved' en la base de datos
    await supabase.from("ideas").update({ status: "approved" }).eq("id", ideaId);

    return NextResponse.json({ success: true, productSlug: slug });
  } catch (err: any) {
    console.error("Error approving idea:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la aprobación" },
      { status: 500 }
    );
  }
}
