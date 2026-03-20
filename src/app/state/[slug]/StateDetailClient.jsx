"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import StateMap from "@/components/StateMap";
import StateInfoPanel from "@/components/StateInfoPanel";
import MapLoadingSkeleton from "@/components/MapLoadingSkeleton";
import ResponsiveMapContainer from "@/components/ResponsiveMapContainer";

const StateMapDynamic = dynamic(() => Promise.resolve(StateMap), {
  loading: () => <MapLoadingSkeleton />,
  ssr: false,
});

export default function StateDetailClient({ state }) {
  const router = useRouter();
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-700 bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <Link
          href="/"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          ← Back to India Map
        </Link>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {state.name}
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative flex min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/30 sm:min-h-[320px] lg:min-h-[400px]">
            <Suspense fallback={<MapLoadingSkeleton />}>
              <ResponsiveMapContainer>
                {({ width, height }) => (
                  <StateMapDynamic
                    stateCode={state.code}
                    width={width}
                    height={height}
                  />
                )}
              </ResponsiveMapContainer>
            </Suspense>
          </div>
          {state.districtNames && state.districtNames.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">
                Districts (hover to highlight)
              </h3>
              <ul className="flex flex-wrap gap-2">
                {state.districtNames.map((name) => (
                  <li
                    key={name}
                    onMouseEnter={() => setHoveredDistrict(name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className={`cursor-pointer rounded-md px-2 py-1 text-sm transition ${
                      hoveredDistrict === name
                        ? "bg-amber-500/80 text-slate-900"
                        : "bg-slate-700/60 text-slate-200 hover:bg-slate-600"
                    }`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <aside className="w-full border-t border-slate-700 p-4 lg:w-96 lg:border-t-0 lg:border-l">
          <StateInfoPanel
            state={state}
            showBackButton
            onBack={() => router.push("/")}
          />
        </aside>
      </div>
    </div>
  );
}
