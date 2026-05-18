import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBar />
      <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <FiltersBar />
          </div>
        </div>
      </main>
    </div>
  );
}
