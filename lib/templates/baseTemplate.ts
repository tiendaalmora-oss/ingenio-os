export interface LandingConfig {
  hook?: string;
  copy?: string;
  ctaText?: string;
  checkoutUrl?: string;
  primaryColor?: string;
  productName?: string;
  videoUrl?: string;
  logoUrl?: string;
}

export function generateLandingHTML(config: LandingConfig, variantName: string): string {
  const hook = config.hook || "Descubre cómo transformar tu negocio hoy";
  const copy = config.copy || "Deja de perder tiempo y dinero con procesos manuales. Nuestro sistema te ayuda a automatizar y escalar sin dolores de cabeza.";
  const ctaText = config.ctaText || "¡Quiero Empezar Ahora!";
  const checkoutUrl = config.checkoutUrl || "#";
  const primaryColor = config.primaryColor || "#0ea5e9";
  const productName = config.productName || variantName;
  const logoUrl = config.logoUrl || "";
  const videoUrl = config.videoUrl || "";

  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName} - ${hook}</title>
    <!-- Tailwind CSS (CDN for standalone static deployment) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              display: ['Outfit', 'sans-serif'],
            },
            colors: {
              brand: '${primaryColor}',
            }
          }
        }
      }
    </script>
    <style>
        body {
            background-color: #000;
            color: #fff;
            overflow-x: hidden;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .glow-effect {
            position: absolute;
            width: 600px;
            height: 600px;
            background: ${primaryColor};
            filter: blur(150px);
            opacity: 0.15;
            border-radius: 50%;
            z-index: -1;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
        }
        .btn-glow {
            box-shadow: 0 0 20px -5px ${primaryColor};
            transition: all 0.3s ease;
        }
        .btn-glow:hover {
            box-shadow: 0 0 30px 0 ${primaryColor};
            transform: translateY(-2px) scale(1.02);
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col items-center selection:bg-brand selection:text-white">
    <div class="glow-effect"></div>
    
    <header class="w-full max-w-5xl mx-auto py-8 px-6 flex justify-center md:justify-start">
        ${logoUrl ? `<img src="${logoUrl}" alt="${productName} Logo" class="h-10 object-contain" />` : `<h2 class="text-2xl font-display font-bold tracking-tight">${productName}</h2>`}
    </header>

    <main class="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center z-10">
        
        <div class="inline-block mb-6 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand text-xs md:text-sm font-semibold tracking-wide uppercase">
            Nueva Generación Operacional
        </div>

        <h1 class="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight">
            ${hook.replace(/\n/g, '<br/>')}
        </h1>
        
        <p class="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            ${copy.replace(/\n/g, '<br/>')}
        </p>

        ${videoUrl ? `
        <div class="w-full max-w-3xl mx-auto mb-12 glass-panel rounded-2xl overflow-hidden aspect-video border border-zinc-800">
            <video src="${videoUrl}" controls class="w-full h-full object-cover" poster="/assets/poster-placeholder.jpg"></video>
        </div>
        ` : ''}

        <a href="${checkoutUrl}" class="btn-glow inline-flex items-center justify-center bg-brand text-white font-bold text-lg md:text-xl px-10 py-5 rounded-2xl w-full md:w-auto transition-all">
            ${ctaText}
            <svg class="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>

        <div class="mt-8 flex items-center gap-6 text-sm text-zinc-500 font-medium">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Garantía de 30 días
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                Pago Seguro
            </div>
        </div>
    </main>

    <footer class="mt-auto w-full border-t border-zinc-900 py-8 text-center text-zinc-600 text-sm">
        <p>&copy; ${new Date().getFullYear()} ${productName}. Todos los derechos reservados.</p>
    </footer>
</body>
</html>`;
}
