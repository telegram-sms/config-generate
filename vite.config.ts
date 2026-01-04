import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react(), topLevelAwait()],
    build: {
        target: "esnext",
    },
});
