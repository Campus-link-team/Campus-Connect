
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const isPresentation = mode === 'presentation'

  return {
    base: isPresentation ? './' : '/',

    plugins: [
      react(),

      // 발표용 빌드에서만 HTML 파일 하나로 통합
      ...(isPresentation ? [viteSingleFile()] : []),
    ],

    build: {
      // 일반 빌드와 발표용 빌드의 저장 위치 분리
      outDir: isPresentation ? 'presentation-build' : 'dist',
      emptyOutDir: true,
    },
  }
})
