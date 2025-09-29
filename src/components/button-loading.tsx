import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? (loadingText ?? "Loading...") : children}
    </Button>
  );
}
