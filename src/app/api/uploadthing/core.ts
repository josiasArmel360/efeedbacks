import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/lib/auth";

const uploadThing = createUploadthing();

const authMiddleware = async ({ req }: { req: NextRequest }) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new UploadThingError("Non autorisé : veuillez vous reconnecter.");
  }
  return { userId: session.user.id };
};

export const ourFileRouter = {
  image: uploadThing({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
