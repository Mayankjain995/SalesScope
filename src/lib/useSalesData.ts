// src/lib/useSalesData.ts
'use client';

import { useState, useEffect } from "react";
import Papa, { ParseResult } from "papaparse";

export type SalesRow = {
  Year: string;
  Month: string;
  Sales: number;
};

export function useSalesData() {
  const [data, setData] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_SALES_API_URL || "/api/sales";

    const fetchFromApi = async (): Promise<boolean> => {
      try {
        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) return false;
        const json = await res.json();
        setData(json as SalesRow[]);
        setLoading(false);
        return true;
      } catch {
        return false;
      }
    };

    // The source CSV has headers like: date, sku, ..., units_sold
    // We transform it into aggregated monthly sales per year for sku MI-006.
    type RawRow = {
      date: string;
      sku?: string;
      units_sold?: number | string;
    } & Record<string, unknown>;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const fetchFromCsv = () => Papa.parse<RawRow>("/data/FMCG_2022_2024.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results: ParseResult<RawRow>) => {
        try {
          const aggregation = new Map<string, number>();

          for (const row of results.data) {
            if (!row || !row.date) continue;

            // Filter to the primary product series used in the dashboard
            if (row.sku && row.sku !== "MI-006") continue;

            const parsedDate = new Date(row.date);
            if (isNaN(parsedDate.getTime())) continue;

            const year = String(parsedDate.getFullYear());
            const monthIndex = parsedDate.getMonth(); // 0-11
            const key = `${year}-${monthIndex}`;

            const units = typeof row.units_sold === "number"
              ? row.units_sold
              : row.units_sold
              ? Number(row.units_sold)
              : 0;

            aggregation.set(key, (aggregation.get(key) ?? 0) + (isNaN(units) ? 0 : units));
          }

          // Convert aggregation map to the expected { Year, Month, Sales } rows
          const transformed: SalesRow[] = Array.from(aggregation.entries())
            .map(([key, total]) => {
              const [year, monthIndexStr] = key.split("-");
              const mi = Number(monthIndexStr);
              return {
                Year: year,
                Month: monthNames[Math.max(0, Math.min(11, mi))],
                Sales: total,
              };
            })
            // Sort by Year then by month index
            .sort((a, b) => {
              if (a.Year !== b.Year) return Number(a.Year) - Number(b.Year);
              return monthNames.indexOf(a.Month) - monthNames.indexOf(b.Month);
            });

          setData(transformed);
          setLoading(false);
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Failed to transform CSV data";
          setError(message);
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
    (async () => {
      const ok = await fetchFromApi();
      if (!ok) fetchFromCsv();
    })();
  }, []);

  return { data, loading, error };
}
