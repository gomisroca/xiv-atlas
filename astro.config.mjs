// @ts-check
import { defineConfig } from "astro/config";
import vercelStatic from "@astrojs/vercel/static";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://xiv-atlas.vercel.app",
  output: "static",
  adapter: vercelStatic(),
  integrations: [sitemap(), tailwind(), icon(), react()],
});
