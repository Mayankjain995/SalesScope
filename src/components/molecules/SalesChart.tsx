"use client";  // if using app router, mark client component

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";


type Props = {
  data: { month: string; sales: number }[];
  year: string | number;
};

export const SalesChart = ({ data, year }: Props) => {
  const [type, setType] = useState<"line" | "bar" | "pie">("line");
  const colors = ["#4f46e5", "#16a34a", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];

  const handleExport = () => {
    const header = "month,sales";
    const rows = data.map(d => `${d.month},${d.sales}`).join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const navAny = window.navigator as Navigator & { msSaveOrOpenBlob?: (blob: Blob, fileName?: string) => void };
    if (navAny && typeof navAny.msSaveOrOpenBlob === "function") {
      navAny.msSaveOrOpenBlob(blob, `sales_${year}.csv`);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales_${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-neutral-900 text-neutral-100 shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Sales — {year}</h3>
        <div className="space-x-2">
          <button className={`px-2 py-1 text-sm rounded ${type === "line" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`} onClick={() => setType("line")}>Line</button>
          <button className={`px-2 py-1 text-sm rounded ${type === "bar" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`} onClick={() => setType("bar")}>Bar</button>
          <button className={`px-2 py-1 text-sm rounded ${type === "pie" ? "bg-indigo-600 text-white" : "bg-neutral-800"}`} onClick={() => setType("pie")}>Pie</button>
          <button className="px-2 py-1 text-sm rounded bg-neutral-800" onClick={handleExport}>Export CSV</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => Intl.NumberFormat().format(v)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => Intl.NumberFormat().format(v)} />
            <Legend />
            <defs>
              <linearGradient id={`grad-${year}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Line type="monotone" dataKey="sales" stroke="#4f46e5" name="Sales" dot={false} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${year})`} />
          </LineChart>
        ) : type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => Intl.NumberFormat().format(v)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => Intl.NumberFormat().format(v)} />
            <Legend />
            <Bar dataKey="sales" fill="#4f46e5" name="Sales" radius={[4,4,0,0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Tooltip formatter={(v: number) => Intl.NumberFormat().format(v)} />
            <Legend />
            <Pie data={data} dataKey="sales" nameKey="month" outerRadius={100}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
