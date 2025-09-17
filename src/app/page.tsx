
import { SalesSectionFromCSV } from "@/components/organisms/SalesSectionFromCSV";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <h1 className="text-3xl font-bold mb-6">SalesScope</h1>
      <SalesSectionFromCSV />
    </main>
  );
}
