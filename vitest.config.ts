import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Vitest 설정.
 *
 * - `vite-tsconfig-paths`: `tsconfig.json`의 `@/*` 같은 import alias를 테스트에서도 그대로 사용 가능.
 * - `environment: "node"`: 우리 lib 코드는 순수 계산 함수 위주라 DOM 불필요.
 * - `include`: `src/**/*.test.ts` 파일만 테스트로 인식.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
