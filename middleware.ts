import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  let hostname = req.headers.get('host') || '';
  
  // Limpiar el puerto si existe (localhost:3000 -> localhost)
  hostname = hostname.split(':')[0];
  // Limpiar 'www.' para que milibro.com y www.milibro.com funcionen igual
  const cleanHostname = hostname.replace(/^www\./, '');

  // Excluir el dominio principal, localhost, la IP del VPS, rutas de sistema y panel
  if (
    cleanHostname.includes('ingeniodigital.shop') ||
    cleanHostname === 'localhost' ||
    cleanHostname === '187.77.197.114' ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/os') ||
    url.pathname.startsWith('/hq') ||
    url.pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  // Si llegamos acá, significa que alguien está entrando desde un DOMINIO PERSONALIZADO (ej: miebook.com)
  
  // Hacemos una consulta rápida a Supabase vía REST (fetch estándar para compatibilidad con Edge Runtime)
  // Usamos las variables de entorno públicas que ya existen en el proyecto
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?select=slug&deployment_domain=eq.${cleanHostname}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          },
          next: { revalidate: 60 } // Cachear la consulta por 60 segundos por performance
        }
      );
      
      const products = await res.json();
      
      if (products && products.length > 0) {
        const product = products[0];
        // ¡Magia de Next.js! 
        // Reescribimos internamente la ruta. 
        // Si el usuario entra a miebook.com/contacto, internamente Next.js procesa /slug/contacto
        // pero la URL en el navegador del cliente sigue diciendo miebook.com
        url.pathname = `/${product.slug}${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
      }
    } catch (err) {
      console.error("Error consultando dominio personalizado en middleware:", err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto los estáticos internos de Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
