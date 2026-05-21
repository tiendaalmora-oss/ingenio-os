/**
 * Ingenio OS — Shared Types
 * Used across projects and templates.
 */

export type ProjectSection = "landing" | "demo" | "manual";

export interface PageProps {
  params: Promise<{ project: string }>;
}

export interface SectionPageProps {
  params: Promise<{ project: string }>;
}
