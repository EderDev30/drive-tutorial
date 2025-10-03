"use client";
import { useState } from "react";
import { LoadingButton } from "~/components/button-loading";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export type DeleteTarget = {
  type: "file" | "folder";
  name: string;
  id: number;
};

type props = {
  target: DeleteTarget;
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteConfirmationDialog(props: props) {
  const [loading, setLoading] = useState<boolean>(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await props.onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete {props.target.type}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete <strong>{props.target.name}</strong>?
        </DialogDescription>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton
            onClick={() => handleConfirm()}
            loading={loading}
            loadingText="Deleting"
            type="submit"
          >
            Confirm
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
