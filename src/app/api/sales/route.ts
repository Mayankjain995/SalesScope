import { NextResponse } from "next/server";
import { readFile } from "fs/promises";

type SalesRow = {
  Year: string;
  Month: string;
  Sales: number;
};

export async function GET() {
  try {
    const csvPath = `${process.cwd()}/public/data/FMCG_2022_2024.csv`;
    const csvText = await readFile(csvPath, "utf8");

    // Minimal CSV parsing tailored to known schema for performance without extra deps
    // Header: date,sku,brand,segment,category,channel,region,pack_type,price_unit,promotion_flag,delivery_days,stock_available,delivered_qty,units_sold
    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return NextResponse.json<SalesRow[]>([]);

    const header = lines[0].split(",");
    const idxDate = header.indexOf("date");
    const idxSku = header.indexOf("sku");
    const idxUnits = header.indexOf("units_sold");
    if (idxDate === -1 || idxSku === -1 || idxUnits === -1) {
      return NextResponse.json(
        { error: "CSV headers not found" },
        { status: 500 }
      );
    }

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

    const aggregation = new Map<string, number>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // naive split works because dataset does not contain quoted commas in these fields
      const cols = line.split(",");
      if (cols.length <= Math.max(idxDate, idxSku, idxUnits)) continue;

      const sku = cols[idxSku];
      if (sku && sku !== "MI-006") continue;

      const dateStr = cols[idxDate];
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) continue;

      const unitsStr = cols[idxUnits];
      const units = Number(unitsStr);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      aggregation.set(key, (aggregation.get(key) ?? 0) + (isNaN(units) ? 0 : units));
    }

    const results: SalesRow[] = Array.from(aggregation.entries())
      .map(([key, total]) => {
        const [year, mi] = key.split("-");
        const monthIndex = Number(mi);
        return {
          Year: year,
          Month: monthNames[Math.max(0, Math.min(11, monthIndex))],
          Sales: total,
        };
      })
      .sort((a, b) => {
        if (a.Year !== b.Year) return Number(a.Year) - Number(b.Year);
        return monthNames.indexOf(a.Month) - monthNames.indexOf(b.Month);
      });

    return NextResponse.json(results);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


