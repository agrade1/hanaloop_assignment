import { HeaderBar } from "@/components/dashboard/HeaderBar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBar />
      <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-4">
          {/* 구성 슬롯은 후속 커밋에서 채움 */}
        </div>
      </main>
    </div>
  );
}
