import { auth } from "@clerk/nextjs/server";
import { mockFolders } from "~/lib/mock-data";
import { db } from "~/server/db";
import { folders_table } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default async function SandboxPage() {
  const user = await auth();
  if (!user.userId) {
    throw new Error("User nto found");
  }

  const folders = await db
    .select()
    .from(folders_table)
    .where(eq(folders_table.ownerId, user.userId));

  console.log(folders);

  return (
    <div>
      <form
        action={async () => {
          "use server";

          const user = await auth();
          if (!user.userId) {
            throw new Error("User nto found");
          }

          const rootFolder = await db
            .insert(folders_table)
            .values({
              name: "root",
              ownerId: user.userId,
              parent: null,
            })
            .$returningId();

          const insertableFolder = mockFolders.map((folder) => ({
            name: folder.name,
            ownerId: user.userId,
            parent: rootFolder[0]!.id,
          }));

          const folderInsert = await db
            .insert(folders_table)
            .values(insertableFolder);

          console.log(folderInsert);
        }}
      >
        <button type="submit">Seed</button>
      </form>
    </div>
  );
}
