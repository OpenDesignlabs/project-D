-- ============================================================================
-- Vectra Marketplace — Supabase Migration
-- File: supabase/migrations/001_initial.sql
--
-- Run this in your Supabase project:
--   Supabase Dashboard → SQL Editor → New Query → paste and run
-- ============================================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── components ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.components (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  version           TEXT        NOT NULL DEFAULT '1.0.0',
  slug              TEXT        NOT NULL UNIQUE,
  label             TEXT        NOT NULL,
  description       TEXT        NOT NULL DEFAULT '',
  category          TEXT        NOT NULL,
  tags              TEXT[]      NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  preview_code      TEXT,

  -- CIS-1 compatible import identity (stored as JSONB)
  import_meta       JSONB       NOT NULL DEFAULT '{}',

  -- Component source and schema
  source_code       TEXT        NOT NULL DEFAULT '',
  default_props     JSONB       NOT NULL DEFAULT '{}',
  props_schema      JSONB       NOT NULL DEFAULT '[]',

  -- Authorship
  published_by      TEXT        NOT NULL DEFAULT 'vectra',
  is_official       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_verified       BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Analytics
  downloads         INTEGER     NOT NULL DEFAULT 0,
  stars             INTEGER     NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT category_check CHECK (
    category IN (
      'basic','layout','forms','media','sections',
      'navigation','marketing','data','feedback','ecommerce'
    )
  )
);

-- ── component_installs ────────────────────────────────────────────────────────
-- Tracks which Studio projects have used which components.
-- Powers "popular" sort and future "update available" notifications.

CREATE TABLE IF NOT EXISTS public.component_installs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id      UUID        NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  studio_project_id TEXT        NOT NULL,
  installed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_components_category    ON public.components(category);
CREATE INDEX IF NOT EXISTS idx_components_is_official ON public.components(is_official);
CREATE INDEX IF NOT EXISTS idx_components_downloads   ON public.components(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_components_created_at  ON public.components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_components_slug        ON public.components(slug);

-- Full-text search index across name, label, description
CREATE INDEX IF NOT EXISTS idx_components_fts ON public.components
  USING GIN (to_tsvector('english', name || ' ' || label || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_installs_component_id ON public.component_installs(component_id);

-- ── auto-update updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_components_updated_at
  BEFORE UPDATE ON public.components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── increment_downloads RPC ───────────────────────────────────────────────────
-- Called fire-and-forget from API routes when Studio fetches a component.

CREATE OR REPLACE FUNCTION public.increment_downloads(component_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.components
  SET downloads = downloads + 1
  WHERE id = component_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Public read for all components.
-- Writes only via service role (API routes use service key).

ALTER TABLE public.components         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_installs ENABLE ROW LEVEL SECURITY;

-- Anyone can read components
CREATE POLICY "Public read components"
  ON public.components FOR SELECT
  USING (TRUE);

-- Only service role can insert/update/delete
CREATE POLICY "Service role write components"
  ON public.components FOR ALL
  USING (auth.role() = 'service_role');

-- Anyone can insert installs (Studio logs usage)
CREATE POLICY "Public insert installs"
  ON public.component_installs FOR INSERT
  WITH CHECK (TRUE);

-- Only service role can read installs (analytics)
CREATE POLICY "Service role read installs"
  ON public.component_installs FOR SELECT
  USING (auth.role() = 'service_role');
