"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { files_table, folders_table } from "~/server/db/schema";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const utApi = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    return {
      error: "Unauthorized",
    };
  }
  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return {
      error: "File not found",
    };
  }

  const utpApiResult = await utApi.deleteFiles([
    file.url.replace("https://x6o0nv7rr8.ufs.sh/f/", ""),
  ]);

  console.log(utpApiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log(dbDeleteResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function createFolder(name: string, parentId: number) {
  console.log("createFolder");
  const session = await auth();
  if (!session.userId) {
    return {
      error: "Unauthorized",
    };
  }

  if (!name) {
    return {
      error: "Folder name cannot be empty",
    };
  }

  await db.insert(folders_table).values({
    name: name,
    parent: parentId,
    ownerId: session.userId,
  });

  revalidatePath(`/f/${parentId}`);

  return { success: true };
}
