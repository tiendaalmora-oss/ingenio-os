/**
 * Dynamic route: /[project]
 *
 * Loads the landing page for a given project.
 * It will look for a specific Next.js page at /projects/[project]/landing/page.tsx
 * If it doesn't exist, it will fallback to the Landing Factory using data.ts
 */
import { notFound, redirect } from "next/navigation";
import { getProject } from "@/projects/projects.config";
import { LandingTemplate } from "@/templates/landing/LandingTemplate";

interface Props {
  params: Promise<{ project: string }>;
}

export default async function ProjectLandingPage({ params }: Props) {
  const { project } = await params;

  const config = getProject(project);
  if (!config) notFound();

  // Legacy projects served statically
  if (config.legacy) {
    redirect(`/legacy/${project}/landing/index.html`);
  }

  // 1. Try to load custom page
  try {
    const mod = await import(`@/projects/${project}/landing/page.tsx`);
    const Page = mod.default;
    return <Page />;
  } catch {
    // 2. Fallback to Landing Factory
    try {
      const dataMod = await import(`@/projects/${project}/data.ts`);
      const data = dataMod.default;
      if (data.landing && data.app) {
        return <LandingTemplate landing={data.landing} app={data.app} />;
      }
    } catch {
      notFound();
    }
    notFound();
  }
}

export async function generateStaticParams() {
  const { getProjectKeys } = await import("@/projects/projects.config");
  return getProjectKeys().map((project) => ({ project }));
}
