"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadButton } from "~/components/uploadthing";
import type { files_table, folders_table } from "~/server/db/schema";
import { FileRow, FolderRow } from "./file-row";
import { NewFolderDialog } from "./new-folder-dialog";
import { useState } from "react";
import {
  DeleteConfirmationDialog,
  type DeleteTarget,
} from "./delete-confirmation-dialog";
import { deleteFile, deleteFolder } from "~/server/actions";
import { showToast } from "~/lib/toast-message";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];
  currentFolderId: number;
}) {
  const navigate = useRouter();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [open, setOpen] = useState(false);

  async function handleOnConfirm() {
    if (!target) return;

    try {
      if (target.type === "folder") {
        await deleteFolder(target.id);
      } else {
        await deleteFile(target.id);
      }

      showToast.delete.success(target.type, target.name);
      setTarget(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      showToast.delete.error(target.type, target.name);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            {props.parents.map((folder, index) => {
              const isRoot =
                folder.name.toLowerCase() === "root" && !folder.parent;
              const label = isRoot ? "My Drive" : folder.name;

              return (
                <div key={folder.id} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="mx-2 text-gray-500" size={16} />
                  )}
                  <Link
                    href={`/f/${folder.id}`}
                    className="text-gray-300 hover:text-white"
                  >
                    {label}
                  </Link>
                </div>
              );
            })}
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                onDeleteClick={() => {
                  setTarget({
                    id: folder.id,
                    name: folder.name,
                    type: "folder",
                  });
                  setOpen(true);
                }}
              />
            ))}
            {props.files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onDeleteClick={() => {
                  setTarget({
                    id: file.id,
                    name: file.name,
                    type: "file",
                  });
                  setOpen(true);
                }}
              />
            ))}
          </ul>
        </div>
        {target && (
          <DeleteConfirmationDialog
            open={open}
            onOpenChange={setOpen}
            target={target}
            onConfirm={() => handleOnConfirm()}
          />
        )}
        <div className="mt-2 flex gap-2">
          <NewFolderDialog folderId={props.currentFolderId} />
          <UploadButton
            endpoint="driveUploader"
            onClientUploadComplete={(res) => {
              if (!res) return;
              if (res.length === 1) {
                showToast.create.success("file", res[0]!.name);
              } else {
                showToast.create.success("file", `${res.length} files`);
              }
              navigate.refresh();
            }}
            onUploadError={(error) => {
              showToast.create.error("file", error.message);
            }}
            input={{
              folderId: props.currentFolderId,
            }}
          />
        </div>
      </div>
    </div>
  );
}
