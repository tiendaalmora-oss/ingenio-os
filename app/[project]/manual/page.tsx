/**
 * Dynamic route: /[project]/manual
 *
 * Loads the manual page from /projects/[project]/manual/page.tsx
 */
import { notFound, redirect } from "next/navigation";
import { getProject } from "@/projects/projects.config";

interface Props {
  params: Promise<{ project: string }>;
}

export default async function ProjectManualPage({ params }: Props) {
  const { project } = await params;

  const config = getProject(project);
  if (!config) notFound();

  // Legacy projects served statically
  if (config.legacy) {
    redirect(`/legacy/${project}/manual/index.html`);
  }

  try {
    const mod = await import(`@/projects/${project}/manual/page.tsx`);
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
