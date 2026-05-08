"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  BarChart, Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

const billion = (n: number) => (n / 1_000_000_000).toFixed(1);

export function RevenueTrendChart({ data }: { data: { month: string; lastYear: number; thisYear: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: 12, right: 12, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${billion(v)}B`} />
        <Tooltip
          formatter={(v: number) => formatCurrency(v)}
          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="lastYear" name="작년" stroke="#94a3b8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="thisYear" name="올해" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CountryBarChart({ data }: { data: { country: string; revenue: number; delta: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${billion(v)}B`} />
        <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={90} />
        <Tooltip
          formatter={(v: number) => formatCurrency(v)}
          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
