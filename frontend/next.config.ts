import type { NextConfig } from "next";
const config: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./content/**/*"] },
};
export default config;
