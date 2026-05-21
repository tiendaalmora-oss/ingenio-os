/**
 * Dynamic route: /[project]
 *
 * Loads the landing page from /projects/[project]/landing/page.tsx
 * using dynamic imports. Adding a new project requires ONLY:
 *   1. Creating /projects/<key>/landing/page.tsx
 *   2. Adding the entry to projects.config.ts
 */
import { notFound } from "next/navigation";
import { getProject } from "@/projects/projects.config";

interface Props {
  params: Promise<{ project: string }>;
}

export default async function ProjectLandingPage({ params }: Props) {
  const { project } = await params;

  const config = getProject(project);
  if (!config) notFound();

  try {
    const mod = await import(`@/projects/${project}/landing/page`);
    const Page = mod.default;
    return <Page />;
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  const { getProjectKeys } = await import("@/projects/projects.config");
  return getProjectKeys().map((project) => ({ project }));
}
