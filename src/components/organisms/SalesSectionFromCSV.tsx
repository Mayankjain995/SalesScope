"use client";

// src/components/organisms/SalesSectionFromCSV.tsx
import { useSalesData } from "@/lib/useSalesData";
import { SalesChart } from "../molecules/SalesChart";
import { useMemo, useState } from "react";

type SimpleData = { month: string; sales: number };

export const SalesSectionFromCSV = () => {
  const { data, loading, error } = useSalesData();
  const [threshold, setThreshold] = useState<number>(0);
  const [yearFilters, setYearFilters] = useState<{[year: string]: boolean}>({
    "2022": true,
    "2023": true,
    "2024": true,
  });

  // No debounce for responsiveness; input changes filter immediately

  // Hooks must run unconditionally before any early returns
  const filtered = useMemo(() => data.filter(r => r.Sales >= (Number.isFinite(threshold) ? threshold : 0)), [data, threshold]);
  const data2022: SimpleData[] = [];
  const data2023: SimpleData[] = [];
  const data2024: SimpleData[] = [];

  filtered.forEach((row) => {
    const yr = String(row.Year);
    if (yr === "2022") {
      data2022.push({ month: row.Month, sales: row.Sales });
    } else if (yr === "2023") {
      data2023.push({ month: row.Month, sales: row.Sales });
    } else if (yr === "2024") {
      data2024.push({ month: row.Month, sales: row.Sales });
    }
  });

  // Optionally: sort by month, etc.

  if (loading) return (
    <section className="space-y-4">
      <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0,1,2].map((i) => (
          <div key={i} className="bg-neutral-900 rounded-lg shadow p-4 h-[300px]">
            <div className="h-6 w-40 bg-neutral-800 rounded mb-4"></div>
            <div className="h-[220px] bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const hasAnyData = data2022.length || data2023.length || data2024.length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-sm font-medium">Sales threshold</label>
            <input
              type="number"
              className="border border-neutral-700 bg-neutral-900 text-neutral-100 rounded px-2 py-1 w-40"
              value={Number.isFinite(threshold) ? threshold : 0}
              onChange={(e) => setThreshold(Number(e.target.value) || 0)}
              placeholder="0"
              min={0}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(["2022","2023","2024"]).map((yr) => (
            <label key={yr} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!yearFilters[yr]}
                onChange={(e) => setYearFilters((prev) => ({ ...prev, [yr]: e.target.checked }))}
              />
              {yr}
            </label>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <div className="text-center text-neutral-400 bg-neutral-900 rounded-lg shadow p-8">
          No data matches the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {yearFilters["2022"] && <SalesChart year={2022} data={data2022} />}
          {yearFilters["2023"] && <SalesChart year={2023} data={data2023} />}
          {yearFilters["2024"] && <SalesChart year={2024} data={data2024} />}
        </div>
      )}
    </section>
  );
};
