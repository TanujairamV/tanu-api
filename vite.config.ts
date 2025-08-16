import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
      name: 'TanuAPI',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['express', 'cors', 'dotenv', 'helmet'],
      output: {
        dir: 'dist',
        format: 'es'
      }
    },
    target: 'node18',
    ssr: true,
    minify: false
  },
  esbuild: {
    platform: 'node',
    target: 'node18'
  }
});