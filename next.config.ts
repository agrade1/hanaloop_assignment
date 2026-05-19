import type { NextConfig } from "next";

/**
 * Next.js 설정.
 *
 * `reactCompiler: true` — React 19 Compiler를 빌드 타임에 활성화한다.
 * `useMemo`/`useCallback` 같은 수동 메모이제이션을 자동으로 적용해주는 컴파일러.
 * Next.js 16에서는 top-level 옵션 (이전 버전의 `experimental.reactCompiler`에서 승격).
 * `babel-plugin-react-compiler`가 함께 설치되어 있어야 한다 (devDependency).
 */
const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
