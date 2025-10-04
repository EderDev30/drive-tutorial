"use client";
import { useState } from "react";
import { LoadingButton } from "~/components/button-loading";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { showToast } from "~/lib/toast-message";
import { createFolder } from "~/server/actions";

export function NewFolderDialog(props: { folderId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.toString().trim() ?? "";

    try {
      const result = await createFolder(name, props.folderId);

      if (result?.error) {
        setError(result.error);
        showToast.create.error("folder", name);
      } else {
        setError(null);
        setOpen(false);
        showToast.create.success("folder", name);
      }
    } catch (err) {
      console.error("Failed to create folder:", err);
      showToast.create.error("folder", name);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          New folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleOnSubmit}>
          <Input id="folder-name" name="name" defaultValue="" />
          {error && <p className="text-red-500">{error}</p>}
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <LoadingButton loading={isLoading} type="submit">
              Create
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
