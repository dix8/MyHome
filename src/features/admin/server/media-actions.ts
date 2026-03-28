"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";

import { getCurrentAdmin } from "./settings";
import { getMediaUsageSummary, getUploadStoragePath } from "./media";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get("file");
  const altText = normalizeText(formData.get("altText"));

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/media?status=upload-error");
  }

  const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

  if (!allowedMimeTypes.has(file.type)) {
    redirect("/admin/media?status=unsupported-type");
  }

  const currentUser = await getCurrentAdmin(getPrismaClient());
  const storage = getUploadStoragePath(file.name);
  const absoluteDirectory = path.join(process.cwd(), "public", storage.relativeDirectory);
  const absolutePath = path.join(process.cwd(), "public", storage.relativePath);
  const publicUrl = `/${storage.relativePath.replaceAll(path.sep, "/")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(absolutePath, buffer);

  const prisma = getPrismaClient();

  const asset = await prisma.mediaAsset.create({
    data: {
      kind: "image",
      originalName: file.name,
      storedName: storage.filename,
      storagePath: storage.relativePath.replaceAll(path.sep, "/"),
      publicUrl,
      mimeType: file.type,
      extension: storage.extension || null,
      sizeBytes: BigInt(file.size),
      altText: altText || null,
      uploadedByUserId: currentUser.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: "upload_media",
      entityType: "media_asset",
      entityId: asset.id,
      summary: `上传媒体资源：${asset.originalName}`,
      detail: {
        publicUrl: asset.publicUrl,
        mimeType: asset.mimeType,
      },
    },
  });

  revalidatePath("/admin/media");
  revalidatePath("/admin/settings");

  redirect("/admin/media?status=uploaded");
}

export async function deleteMediaAction(formData: FormData) {
  const mediaAssetId = normalizeText(formData.get("mediaAssetId"));

  if (!mediaAssetId) {
    redirect("/admin/media?status=delete-error");
  }

  const usage = await getMediaUsageSummary(mediaAssetId);

  if (usage.total > 0) {
    redirect("/admin/media?status=in-use");
  }

  const prisma = getPrismaClient();
  const currentUser = await getCurrentAdmin(prisma);
  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id: mediaAssetId,
    },
  });

  if (!asset) {
    redirect("/admin/media?status=delete-error");
  }

  const absolutePath = path.join(process.cwd(), "public", asset.storagePath);

  await prisma.mediaAsset.update({
    where: {
      id: mediaAssetId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  await unlink(absolutePath).catch(() => undefined);

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: "delete_media",
      entityType: "media_asset",
      entityId: asset.id,
      summary: `删除媒体资源：${asset.originalName}`,
      detail: {
        publicUrl: asset.publicUrl,
      } as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/admin/media");
  revalidatePath("/admin/settings");

  redirect("/admin/media?status=deleted");
}
