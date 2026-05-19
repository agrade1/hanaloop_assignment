import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { staticDataSource } from "@/lib/data-source";

/**
 * 대시보드 페이지 (서버 컴포넌트).
 *
 * 정적 JSON이라 SSG 친화적이도록 서버에서 한 번 페치하고,
 * 시나리오 인터랙션·재계산은 `DashboardClient`에 위임한다.
 *
 * HeaderBar는 ExcelUploadButton(클라이언트) 포함이지만 자체는 서버 렌더링 가능해 여기 두고,
 * DashboardClient에는 raw 활동·계수 데이터만 전달한다.
 */
export default async function DashboardPage() {
  const activities = await staticDataSource.getActivities();
  const factors = await staticDataSource.getEmissionFactors();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBar />
      <DashboardClient activities={activities} factors={factors} />
    </div>
  );
}
