import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { staticDataSource } from "@/lib/data-source";

/**
 * 대시보드 페이지 (서버 컴포넌트).
 *
 * 활동 데이터는 엑셀 업로드를 통해 입력받는 흐름이므로 초기엔 빈 배열로 시작한다.
 * 배출계수만 시스템 표준값으로 사전 페치 — DECISIONS의 계수 버전 관리 정책상
 * 계수는 사용자가 임의 변경하지 않는 시스템 자산.
 */
export default async function DashboardPage() {
  const factors = await staticDataSource.getEmissionFactors();

  return <DashboardClient initialActivities={[]} factors={factors} />;
}
