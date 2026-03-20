import React from "react";
import Link from "next/link";

export default function StateNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-6 text-white">
      <h1 className="text-2xl font-bold">State not found</h1>
      <p className="mt-2 text-slate-400">
        The state or union territory you're looking for doesn't exist or the URL is invalid.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-400"
      >
        Back to India Map
      </Link>
    </div>
  );
}
