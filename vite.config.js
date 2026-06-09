import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

const jsAsJsx = () => ({
  name: "load-js-files-as-jsx",
  enforce: "pre",
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
});

export default defineConfig({
  base: "./",
  plugins: [
    jsAsJsx(),
    react({
      include: ["**/*.jsx", "**/*.js"],
    }),
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 5173,
  },
});
