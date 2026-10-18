import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { barY, defineChart } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/charts/react";

export interface AlphabetRow {
  letter: string;
  frequency: number;
}

export const alphabet: readonly AlphabetRow[] = [
  { letter: "E", frequency: 0.12702 },
  { letter: "T", frequency: 0.09056 },
  { letter: "A", frequency: 0.08167 },
  { letter: "O", frequency: 0.07507 },
  { letter: "I", frequency: 0.06966 },
];

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const letterFrequencyChart = defineChart({
  marks: [
    barY(alphabet, {
      x: "letter",
      y: "frequency",
    }),
  ],
  scales: {
    x: {
      scale: () => scaleBand().padding(0.18),
    },
    y: {
      scale: scaleLinear,
      nice: true,
      grid: true,
      axis: {
        label: "Frequency",
        ticks: { format: (value) => percent.format(value) },
      },
    },
  },

  tooltip,
});

export const CustomChart = () => {
  return (
    <Chart
      definition={letterFrequencyChart}
      height={320}
      ariaLabel="English letter frequencies"
    />
  );
};
