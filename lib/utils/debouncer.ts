// lib/utils/debouncer.ts

// Usamos globalThis para que los temporizadores sobrevivan a múltiples ejecuciones de la API route
// en el mismo proceso de Node.js (Next.js standalone).
if (!(globalThis as any).__messageDebouncers) {
  (globalThis as any).__messageDebouncers = new Map<string, NodeJS.Timeout>();
}

const debouncers: Map<string, NodeJS.Timeout> = (globalThis as any).__messageDebouncers;

/**
 * Programa la ejecución de la IA para un contacto.
 * Si ya había una ejecución programada, la cancela y reinicia el contador.
 * Esto agrupa múltiples mensajes rápidos en una sola ejecución.
 */
export function scheduleAIProcessing(contactId: string, phone: string, from: string, delayMs: number = 20000) {
  console.log(`[Debouncer] Recibido mensaje de ${phone}. Esperando ${delayMs / 1000}s para procesar IA...`);

  // 1. Limpiar el temporizador anterior si existe
  if (debouncers.has(contactId)) {
    console.log(`[Debouncer] Cancelando ejecución previa de ${phone}. Reiniciando contador...`);
    clearTimeout(debouncers.get(contactId)!);
  }

  // 2. Programar la nueva ejecución
  const timeout = setTimeout(async () => {
    // Al ejecutarse, limpiamos la referencia
    debouncers.delete(contactId);
    
    console.log(`[Debouncer] 🚀 Tiempo cumplido para ${phone}. Ejecutando IA con el contexto agrupado...`);
    
    try {
      // Importamos dinámicamente para evitar dependencias circulares complejas
      const { executeAIForContact } = await import('@/lib/ai/processor');
      await executeAIForContact(contactId, phone, from);
    } catch (error) {
      console.error(`[Debouncer] Error crítico ejecutando IA para ${phone}:`, error);
    }
  }, delayMs);

  // 3. Guardar el nuevo temporizador
  debouncers.set(contactId, timeout);
}
