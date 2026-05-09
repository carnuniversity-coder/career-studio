import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./messages/**/*.json"],
  theme: {
    extend: {
      colors: {
        lanka: {
          ocean: "#0f766e",
          tea: "#3f7d20",
          lotus: "#be185d",
          sun: "#f59e0b",
        },
      },
    },
  },
};

export default config;
