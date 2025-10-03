"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
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

  await utApi.deleteFiles([
    file.url.replace("https://x6o0nv7rr8.ufs.sh/f/", ""),
  ]);

  await db.delete(files_table).where(eq(files_table.id, fileId));

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function getAllFolderIds(folderId: number): Promise<number[]> {
  const queue: number[] = [folderId];
  const allIds: number[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    allIds.push(current);

    const children = await db
      .select({
        id: folders_table.id,
      })
      .from(folders_table)
      .where(eq(folders_table.parent, current));

    for (const child of children) {
      queue.push(child.id);
    }
  }

  return allIds;
}

export async function deleteFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) {
    return {
      error: "Unauthorized",
    };
  }

  const folderIds = await getAllFolderIds(folderId);

  const files = await db
    .select({
      id: files_table.id,
      url: files_table.url,
    })
    .from(files_table)
    .where(inArray(files_table.parent, folderIds));

  const filesKeys = files.map((f) =>
    f.url.replace("https://x6o0nv7rr8.ufs.sh/f/", ""),
  );
  const fileIds = files.map((f) => f.id);

  const [, dbDeleteFileResult, dbDeleteFolderResult] = await Promise.all([
    utApi.deleteFiles(filesKeys),
    db.delete(files_table).where(inArray(files_table.id, fileIds)),
    db.delete(folders_table).where(inArray(folders_table.id, folderIds)),
  ]);

  const affectedRows =
    dbDeleteFileResult[0].affectedRows + dbDeleteFolderResult[0].affectedRows;

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true, affectedRows: affectedRows };
}

export async function createFolder(name: string, parentId: number) {
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
