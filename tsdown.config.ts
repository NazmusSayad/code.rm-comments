import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'es2022',
  outDir: 'dist',
  clean: true,
  external: ['vscode'],
})
