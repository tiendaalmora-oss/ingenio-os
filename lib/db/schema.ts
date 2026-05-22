/**
 * Database Schema Definitions (Draft)
 * 
 * This file serves as the preparation layer for integrating PostgreSQL
 * (e.g., via Prisma or Supabase). It defines the core domain models for
 * the Ingenio OS Operations Platform.
 */

export interface Project {
  id: string;
  slug: string;
  name: string;
  status: 'idea' | 'validation' | 'building' | 'scaling' | 'killed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricSnapshot {
  id: string;
  projectId: string;
  date: Date;
  mrr: number;
  activeUsers: number;
  churnRate: number;
}

export interface MetaCampaignSnapshot {
  id: string;
  campaignId: string;
  date: Date;
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number; // For ROAS calculation
}

export interface CreativeAsset {
  id: string;
  projectId: string;
  hook: string;
  format: 'video' | 'image' | 'carousel';
  copy: string;
  status: 'testing' | 'winning' | 'killed';
  createdAt: Date;
}

export interface AIAgentDefinition {
  id: string;
  name: string;
  role: string;
  webhookUrl: string; // Integration with n8n
  isActive: boolean;
}
