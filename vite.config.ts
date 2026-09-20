import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 수정 후 
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 또는 'localhost' 로 변경 (또는 host 줄 자체를 지워도 됩니다)
    port: 5174,
  }
})