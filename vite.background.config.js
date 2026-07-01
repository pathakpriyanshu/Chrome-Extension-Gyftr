import { defineConfig } from 'vite'
import { resolve } from 'path'

// Background service worker — single self-contained ES module
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/background/index.js'),
      name: 'GyftrBackground',
      formats: ['es'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
