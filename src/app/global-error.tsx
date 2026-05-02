'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen text-center p-4 font-sans">
        <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-muted-foreground mb-6">
          A critical error occurred. Please try refreshing the application.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#0f172a] text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
