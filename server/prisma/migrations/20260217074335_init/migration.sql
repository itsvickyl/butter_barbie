-- Enable Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create Schemas (Safe Mode)
DO $$
BEGIN
    CREATE SCHEMA IF NOT EXISTS auth;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore permission errors (e.g. on Supabase Prod)
END $$;

DO $$
BEGIN
    CREATE SCHEMA IF NOT EXISTS storage;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create Dummy auth.users (Safe Mode)
DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS "auth"."users" (
      "id" uuid not null primary key,
      "email" text,
      "encrypted_password" text,
      "raw_user_meta_data" jsonb
    );
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if table exists or permission denied
END $$;

-- Create Dummy storage tables (Safe Mode)
DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS "storage"."buckets" (
      "id" text not null primary key,
      "name" text not null,
      "public" boolean default false
    );
    CREATE TABLE IF NOT EXISTS "storage"."objects" (
      "id" uuid not null default gen_random_uuid() primary key,
      "bucket_id" text,
      "name" text,
      "owner" uuid,
      "created_at" timestamptz default now(),
      "updated_at" timestamptz default now(),
      "last_accessed_at" timestamptz default now(),
      "metadata" jsonb,
      "path_tokens" text[] generated always as (string_to_array(name, '/')) stored
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Dummy Functions (Safe Creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
        EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid AS $f$ SELECT ''00000000-0000-0000-0000-000000000000''::uuid $f$ LANGUAGE SQL';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'role' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
        EXECUTE 'CREATE FUNCTION auth.role() RETURNS text AS $f$ SELECT ''anon''::text $f$ LANGUAGE SQL';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;


-- =============================================
-- ORIGINAL MIGRATION CONTENT BELOW (Modified to remove FK to auth.users)
-- =============================================

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('NOTES', 'PAST_PAPER', 'REFERENCE_BOOK', 'PROJECT_REPORT', 'ASSIGNMENT');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(), -- Removed REFERENCES "auth"."users" to avoid cross-schema issues in migration
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "year" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    -- timestamp(3) is Prisma's default precision
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "subject" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "uploader_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "user_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "resources_subject_semester_idx" ON "resources"("subject", "semester");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- =============================================
-- RLS & POLICIES (Appended)
-- =============================================

-- Enable RLS
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "downloads" ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone" 
      ON "profiles" FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" 
      ON "profiles" FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Resources
DO $$ BEGIN
    CREATE POLICY "Resources are viewable by everyone" 
      ON "resources" FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can upload resources" 
      ON "resources" FOR INSERT WITH CHECK (auth.uid() = uploader_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own resources" 
      ON "resources" FOR UPDATE USING (auth.uid() = uploader_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Ratings
DO $$ BEGIN
    CREATE POLICY "Ratings are viewable by everyone" 
      ON "ratings" FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can rate" 
      ON "ratings" FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Downloads
DO $$ BEGIN
    CREATE POLICY "Users can view own download history" 
      ON "downloads" FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can record downloads" 
      ON "downloads" FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Optional: Trigger to delete profile on user delete
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_delete();


-- =============================================
-- STORAGE (Ideally running separately, but included for completeness)
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resource_files', 'resource_files', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Public Access" 
      ON storage.objects FOR SELECT 
      USING ( bucket_id = 'resource_files' );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can upload" 
      ON storage.objects FOR INSERT 
      WITH CHECK ( bucket_id = 'resource_files' AND auth.role() = 'authenticated' );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
