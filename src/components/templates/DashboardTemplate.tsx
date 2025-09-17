import { SalesSection } from "../organisms/SalesSection";

export const DashboardTemplate = () => {
  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <SalesSection />
    </main>
  );
};
