-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MediaSourceType" AS ENUM ('none', 'local', 'external');

-- CreateEnum
CREATE TYPE "ContactIconType" AS ENUM ('builtin', 'image');

-- CreateEnum
CREATE TYPE "ProjectVisualType" AS ENUM ('icon', 'cover');

-- CreateEnum
CREATE TYPE "PublishActionType" AS ENUM ('publish', 'rollback');

-- CreateEnum
CREATE TYPE "HomeSectionKey" AS ENUM ('hero', 'skills', 'projects', 'contact', 'footer');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" VARCHAR(80) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "site_name" VARCHAR(100) NOT NULL,
    "site_subtitle" VARCHAR(255),
    "seo_title" VARCHAR(120),
    "seo_description" VARCHAR(255),
    "seo_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "footer_text" VARCHAR(255),
    "icp_text" VARCHAR(100),
    "icp_url" VARCHAR(255),
    "favicon_source_type" "MediaSourceType" NOT NULL DEFAULT 'none',
    "favicon_media_asset_id" UUID,
    "favicon_external_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_profiles" (
    "id" UUID NOT NULL,
    "greeting" VARCHAR(50),
    "name" VARCHAR(80) NOT NULL,
    "typing_titles" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "avatar_source_type" "MediaSourceType" NOT NULL DEFAULT 'none',
    "avatar_media_asset_id" UUID,
    "avatar_external_url" TEXT,
    "primary_button_label" VARCHAR(50),
    "primary_button_href" VARCHAR(255),
    "secondary_button_label" VARCHAR(50),
    "secondary_button_href" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hero_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_sections" (
    "id" UUID NOT NULL,
    "section_key" "HomeSectionKey" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "section_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "home_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" UUID NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "href" VARCHAR(255) NOT NULL,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_groups" (
    "id" UUID NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "subtitle" VARCHAR(120),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_items" (
    "id" UUID NOT NULL,
    "skill_group_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "level" SMALLINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "skill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "visual_type" "ProjectVisualType" NOT NULL DEFAULT 'icon',
    "icon_name" VARCHAR(80),
    "cover_source_type" "MediaSourceType" NOT NULL DEFAULT 'none',
    "cover_media_asset_id" UUID,
    "cover_external_url" TEXT,
    "repo_url" VARCHAR(255),
    "preview_url" VARCHAR(255),
    "tech_stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_items" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "href" VARCHAR(255),
    "icon_type" "ContactIconType" NOT NULL DEFAULT 'builtin',
    "icon_name" VARCHAR(80),
    "icon_source_type" "MediaSourceType" NOT NULL DEFAULT 'none',
    "icon_media_asset_id" UUID,
    "icon_external_url" TEXT,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "kind" VARCHAR(20) NOT NULL DEFAULT 'image',
    "original_name" VARCHAR(255) NOT NULL,
    "stored_name" VARCHAR(255) NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "public_url" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "extension" VARCHAR(20),
    "size_bytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" VARCHAR(255),
    "uploaded_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_theme_state" (
    "id" UUID NOT NULL,
    "template_id" VARCHAR(80) NOT NULL,
    "template_config" JSONB NOT NULL DEFAULT '{}',
    "published_snapshot_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "site_theme_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_number" INTEGER NOT NULL,
    "action_type" "PublishActionType" NOT NULL,
    "template_id" VARCHAR(80) NOT NULL,
    "template_config" JSONB NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "comment" VARCHAR(255),
    "published_by_user_id" UUID,
    "source_snapshot_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "publish_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100),
    "summary" VARCHAR(255) NOT NULL,
    "detail" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "home_sections_section_key_key" ON "home_sections"("section_key");

-- CreateIndex
CREATE INDEX "navigation_items_sort_order_idx" ON "navigation_items"("sort_order");

-- CreateIndex
CREATE INDEX "skill_groups_sort_order_idx" ON "skill_groups"("sort_order");

-- CreateIndex
CREATE INDEX "skill_items_skill_group_id_sort_order_idx" ON "skill_items"("skill_group_id", "sort_order");

-- CreateIndex
CREATE INDEX "projects_sort_order_is_enabled_idx" ON "projects"("sort_order", "is_enabled");

-- CreateIndex
CREATE INDEX "contact_items_sort_order_is_enabled_idx" ON "contact_items"("sort_order", "is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_path_key" ON "media_assets"("storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_public_url_key" ON "media_assets"("public_url");

-- CreateIndex
CREATE UNIQUE INDEX "publish_snapshots_snapshot_number_key" ON "publish_snapshots"("snapshot_number");

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_media_asset_id_fkey" FOREIGN KEY ("favicon_media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_profiles" ADD CONSTRAINT "hero_profiles_avatar_media_asset_id_fkey" FOREIGN KEY ("avatar_media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_items" ADD CONSTRAINT "skill_items_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_media_asset_id_fkey" FOREIGN KEY ("cover_media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_items" ADD CONSTRAINT "contact_items_icon_media_asset_id_fkey" FOREIGN KEY ("icon_media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_theme_state" ADD CONSTRAINT "site_theme_state_published_snapshot_id_fkey" FOREIGN KEY ("published_snapshot_id") REFERENCES "publish_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_snapshots" ADD CONSTRAINT "publish_snapshots_published_by_user_id_fkey" FOREIGN KEY ("published_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_snapshots" ADD CONSTRAINT "publish_snapshots_source_snapshot_id_fkey" FOREIGN KEY ("source_snapshot_id") REFERENCES "publish_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
