// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  image: {
    domains: ["xivapi.com"],
    remotePatterns: [{ protocol: "https" }],
  },
  site: "https://xiv-atlas.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [sitemap(), tailwind(), icon(), react()],
});
