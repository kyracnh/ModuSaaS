"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
export function UsageChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div
      className="h-52"
      role="img"
      aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <Tooltip />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
