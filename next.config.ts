import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    /* otras opciones experimentales si las hay */
  },
  // Aseguramos que Next.js escuche en el puerto correcto
  serverRuntimeConfig: {
    port: parseInt(process.env.PORT || '3005', 10)
  }
};

export default nextConfig;
