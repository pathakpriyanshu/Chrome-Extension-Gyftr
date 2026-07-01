import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Popup build — standard HTML entry, can use chunks
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        copyFileSync('manifest.json', 'dist/manifest.json')
        mkdirSync('dist/icons', { recursive: true })
        for (const size of [16, 48, 128]) {
          const src = `public/icons/icon${size}.png`
          if (existsSync(src)) copyFileSync(src, `dist/icons/icon${size}.png`)
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
