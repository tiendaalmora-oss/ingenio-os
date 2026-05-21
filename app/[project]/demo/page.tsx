/**
 * Dynamic route: /[project]/demo
 *
 * Loads the demo page from /projects/[project]/demo/page.tsx
 */
import { notFound } from "next/navigation";
import { getProject } from "@/projects/projects.config";

interface Props {
  params: Promise<{ project: string }>;
}

export default async function ProjectDemoPage({ params }: Props) {
  const { project } = await params;

  const config = getProject(project);
  if (!config) notFound();

  try {
    const mod = await import(`@/projects/${project}/demo/page`);
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
