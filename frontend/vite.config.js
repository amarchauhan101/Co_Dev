// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
//   define: {
//     global: {},
//   },
//      resolve: {
//     alias: {
//       // so “@excalidraw/excalidraw/dist/…” becomes a real path
//       "@excalidraw/excalidraw/dist": resolve(
//         __dirname,
//         "node_modules/@excalidraw/excalidraw/dist"
//       ),
//     },
// }})


// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), // Tailwind works through postcss.config.cjs, no extra plugin needed
    tailwindcss()
  ],

  // provide a fake "global" so simple-peer & others don't crash
  define: {
    global: {},
  },

  resolve: {
    alias: {
      // let Vite load the Excalidraw CSS/JS directly
      "@excalidraw/excalidraw/dist": resolve(
        __dirname,
        "node_modules/@excalidraw/excalidraw/dist"
      ),
    },
  },
});
