import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Plugin to resolve tailwindcss version import issue
const tailwindVersionPlugin = {
  name: 'tailwind-version',
  resolveId(id) {
    if (id === 'tailwindcss/version.js') {
      return id;
    }
    return null;
  },
  load(id) {
    if (id === 'tailwindcss/version.js') {
      // Return the version of tailwindcss
      return `export default { version: '3.3.0' };`;
    }
    return null;
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindVersionPlugin],

  // Enable JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },

  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }
            // UI libraries
            if (
              id.includes('antd') ||
              id.includes('@headlessui') ||
              id.includes('@radix-ui') ||
              id.includes('flowbite')
            ) {
              return 'ui-vendor';
            }
            // Icons
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons-vendor';
            }
            // Utilities
            if (
              id.includes('axios') ||
              id.includes('date-fns') ||
              id.includes('uuid') ||
              id.includes('socket.io')
            ) {
              return 'utils-vendor';
            }
            // Query and state management
            if (
              id.includes('@tanstack/react-query') ||
              id.includes('styled-components')
            ) {
              return 'state-vendor';
            }
            // Everything else
            return 'vendor';
          }

          // App chunks
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/contexts/')) {
            return 'contexts';
          }
        },
      },
    },
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },

  // Optimization with JSX support for .js files
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'socket.io-client',
      'lucide-react',
    ],
  },
});
