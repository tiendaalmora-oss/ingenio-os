/**
 * Ingenio OS — Subdomain Proxy (Next.js 16)
 *
 * Resolves subdomains to internal paths:
 *
 *   verdepro.ingeniodigital.shop         → /verdepro
 *   demo.verdepro.ingeniodigital.shop    → /verdepro/demo
 *   manual.verdepro.ingeniodigital.shop  → /verdepro/manual
 *
 * Rules:
 *  - Works on localhost (verdepro.localhost:3000)
 *  - Works on production (*.ingeniodigital.shop)
 *  - Ignores _next, api, static assets, favicon
 *  - Never interferes with os.ingeniodigital.shop (root domain)
 *
 * Next.js 16: uses "proxy" file convention instead of deprecated "middleware"
 */

import { NextRequest, NextResponse } from "next/server";

/** Root domains that are treated as the main app (no subdomain routing) */
const ROOT_DOMAINS = ["os.ingeniodigital.shop", "localhost"];

/** Sections that can be used as a subdomain prefix (before the project) */
const SECTION_PREFIXES = ["demo", "manual", "app"];

/** Legacy projects that should be served purely as static HTML from public/legacy */
const LEGACY_PROJECTS = ["verdepro", "carnipro", "lavapro", "barberpro", "gympro"];

/** Paths to skip — _next assets, api, static files, favicon, and legacy folder */
const SKIP_PATTERN = /^\/((_next|api|favicon\.ico|robots\.txt|sitemap\.xml|legacy))/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (SKIP_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";

  // Strip port if present (e.g. localhost:3000 → localhost)
  const hostname = host.split(":")[0];

  // Determine if we're on a root domain
  if (ROOT_DOMAINS.includes(hostname)) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const project = parts[0];
      if (LEGACY_PROJECTS.includes(project)) {
        let targetPath: string | null = null;
        const subPath = parts.slice(1);

        if (subPath.length === 0) {
          // os.ingeniodigital.shop/verdepro -> /legacy/verdepro/landing/index.html
          targetPath = `/legacy/${project}/landing/index.html`;
        } else if (subPath[0] === "demo") {
          // os.ingeniodigital.shop/verdepro/demo -> /legacy/verdepro/demo/index.html
          const remaining = subPath.slice(1).join("/");
          targetPath = remaining ? `/legacy/${project}/demo/${remaining}` : `/legacy/${project}/demo/index.html`;
        } else if (subPath[0] === "manual") {
          // os.ingeniodigital.shop/verdepro/manual -> /legacy/verdepro/manual/index.html
          const remaining = subPath.slice(1).join("/");
          targetPath = remaining ? `/legacy/${project}/manual/${remaining}` : `/legacy/${project}/manual/index.html`;
        } else if (subPath[0] === "app") {
          // Do not rewrite /verdepro/app, let Next.js routing serve the React app dashboard
          return NextResponse.next();
        } else {
          // E.g. static assets loaded relative to landing, like /verdepro/img/logo.png
          targetPath = `/legacy/${project}/landing/${subPath.join("/")}`;
        }

        if (targetPath) {
          const url = request.nextUrl.clone();
          url.pathname = targetPath;
          return NextResponse.rewrite(url);
        }
      }
    }
    return NextResponse.next();
  }

  // Parse subdomain structure from hostname
  // Production: sub1.sub2.ingeniodigital.shop → parts = [sub1, sub2]
  // Local:      verdepro.localhost → parts = [verdepro]
  const isLocal = hostname.endsWith(".localhost");
  const rootDomain = isLocal ? "localhost" : "ingeniodigital.shop";

  // Remove root domain suffix to get subdomain parts
  const subdomain = hostname.replace(`.${rootDomain}`, "");
  const parts = subdomain.split(".");

  let targetPath: string | null = null;

  if (parts.length === 1) {
    // verdepro.ingeniodigital.shop
    const project = parts[0];
    if (LEGACY_PROJECTS.includes(project)) {
      targetPath = pathname === "/" ? `/legacy/${project}/landing/index.html` : `/legacy/${project}/landing${pathname}`;
    } else {
      targetPath = `/${project}${pathname === "/" ? "" : pathname}`;
    }
  } else if (parts.length === 2) {
    // demo.verdepro.ingeniodigital.shop
    const [section, project] = parts;
    if (SECTION_PREFIXES.includes(section)) {
      // Si es un proyecto legacy y no es el dashboard de la app (que será en React)
      if (LEGACY_PROJECTS.includes(project) && section !== "app") {
        targetPath = pathname === "/" ? `/legacy/${project}/${section}/index.html` : `/legacy/${project}/${section}${pathname}`;
      } else {
        targetPath = `/${project}/${section}${pathname === "/" ? "" : pathname}`;
      }
    }
  }

  if (targetPath) {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
