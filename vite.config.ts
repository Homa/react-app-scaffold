import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
    deps: {
      inline: ['react-redux']
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  },
  build: {
    rollupOptions: {
      plugins: [visualizer()]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    // Handle process.env for development/production modes
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
}); 