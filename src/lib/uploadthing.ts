import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

export interface FileInputItem {
  id?: string;
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
  file?: File;
}

export interface UploadedMediaPayload {
  id?: string;
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

type UploadResultLike = {
  ufsUrl: string;
  key: string;
  name: string;
  size: number;
  type: string;
};

/**
 * Transfère uniquement les nouveaux fichiers locaux (`item.file`) vers UploadThing
 * avant l'appel à la Server Action, et retourne la liste ordonnée des médias persistables.
 */
export async function resolveUploadedFiles(
  items: FileInputItem[],
  startUpload: (files: File[]) => Promise<UploadResultLike[] | undefined>,
): Promise<UploadedMediaPayload[]> {
  const pendingIndices: number[] = [];
  const pendingFiles: File[] = [];

  items.forEach((item, index) => {
    if (item.file instanceof File) {
      pendingIndices.push(index);
      pendingFiles.push(item.file);
    }
  });

  if (pendingFiles.length === 0) {
    return items.map((item) => ({
      id: item.id,
      url: item.url,
      key: item.key,
      name: item.name,
      size: item.size,
      type: item.type,
    }));
  }

  const uploaded = await startUpload(pendingFiles);

  if (!uploaded || uploaded.length !== pendingFiles.length) {
    throw new Error(
      "L'importation d'un ou plusieurs fichiers vers le stockage a échoué.",
    );
  }

  const resolved: UploadedMediaPayload[] = items.map((item) => ({
    id: item.id,
    url: item.url,
    key: item.key,
    name: item.name,
    size: item.size,
    type: item.type,
  }));

  pendingIndices.forEach((itemIndex, uploadIdx) => {
    const original = items[itemIndex];
    const cloud = uploaded[uploadIdx];

    if (original.url.startsWith("blob:")) {
      URL.revokeObjectURL(original.url);
    }

    resolved[itemIndex] = {
      id: undefined,
      url: cloud.ufsUrl,
      key: cloud.key,
      name: cloud.name || original.name,
      size: cloud.size || original.size,
      type: cloud.type || original.type,
    };
  });

  return resolved;
}

/**
 * Transfère un fichier unique (`item.file`) vers UploadThing ou retourne l'existant.
 */
export async function resolveUploadedFile(
  item: FileInputItem | null | undefined,
  startUpload: (files: File[]) => Promise<UploadResultLike[] | undefined>,
): Promise<UploadedMediaPayload | null> {
  if (!item) return null;
  if (!item.file) {
    return {
      id: item.id,
      url: item.url,
      key: item.key,
      name: item.name,
      size: item.size,
      type: item.type,
    };
  }
  const list = await resolveUploadedFiles([item], startUpload);
  return list[0] ?? null;
}
