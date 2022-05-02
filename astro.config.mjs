import { defineConfig } from "astro/config"
import svelte from "@astrojs/svelte"

// https://astro.build/config
export default defineConfig({
  // Enable React to support React JSX components.
  integrations: [svelte()],
})
