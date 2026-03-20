import React from "react";
import { notFound } from "next/navigation";
import { getStateBySlug } from "@/data/statesData";
import StateDetailClient from "./StateDetailClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return { title: "State Not Found" };
  return {
    title: `${state.name} | India Dashboard`,
    description: `${state.name} - Capital: ${state.capital}. Population: ${state.population.toLocaleString()}, Area: ${state.areaSqKm} sq km, ${state.districts} districts.`,
  };
}

export default async function StatePage({ params }) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <StateDetailClient state={state} />
    </div>
  );
}
