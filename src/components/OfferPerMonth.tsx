import { useMemo } from "react";
import { useFetch } from "../hooks/useFetch";
import { barX, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { fetchOutcomes } from "../api";
import { scaleLinear } from "@tanstack/charts/scales/linear";

export const OfferPerMonth = () => {
  const { data, error, loading } = useFetch(fetchOutcomes);

  const chart = useMemo(() => {
    if (!data?.length) return null;
    return defineChart({
      // barX = horizontal bars; twelve outcome labels need the vertical room
      marks: [barX(data, { y: "short", x: "n" })],
      scales: {
        y: { scale: () => scaleBand().padding(0.2) },
        x: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { label: "applications" },
        },
      },
      tooltip,
    });
  }, [data]);

  const awaiting = data?.find((d) => d.status_code === 10);
  const families = useMemo(() => {
    const seen = new Map<string, number>();
    for (const r of data ?? [])
      seen.set(r.family, (seen.get(r.family) ?? 0) + r.n);
    return [...seen.entries()];
  }, [data]);

  return <div></div>;
};
