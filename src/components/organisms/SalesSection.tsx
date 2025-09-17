import { SalesChart } from "../molecules/SalesChart";
import { salesData } from "@/lib/mockData";
import { Heading } from "../atoms/Heading";

export const SalesSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Heading text="Sales Overview" />
      {Object.entries(salesData).map(([year, data]) => (
        <SalesChart key={year} year={Number(year)} data={data} />
      ))}
    </section>
  );
};
