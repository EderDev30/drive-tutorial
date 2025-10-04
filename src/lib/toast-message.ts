import { toast } from "sonner";

export const showToast = {
  delete: {
    success: (type: "file" | "folder", name: string) =>
      toast.success(
        `${type === "folder" ? "Folder" : "File"} "${name}" deleted successfully.`,
      ),
    error: (type: "file" | "folder", name: string) =>
      toast.error(`Failed to delete ${type}: "${name}".`),
  },
  create: {
    success: (type: "file" | "folder", name: string) =>
      toast.success(`${type} "${name}" created successfully.`),
    error: (type: "file" | "folder", name: string) =>
      toast.error(`Failed to create ${type}: "${name}".`),
  },
};
