"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080A12] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-950/20 p-6 text-center shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-rose-300">Application Error</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            {error?.message || "An unexpected error occurred while loading FairDrop."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
