import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <h2 className="font-semibold mb-2">Something went wrong:</h2>
      <p className="mb-4">{error.message}</p>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        className="hover:bg-destructive/20"
      >
        Try again
      </Button>
    </div>
  );
}