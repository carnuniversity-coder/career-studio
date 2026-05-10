import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ["file-type"],
};

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

export default withNextIntl(nextConfig);
