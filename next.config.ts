import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    /* otras opciones experimentales si las hay */
  },
  // Aseguramos que Next.js escuche en el puerto correcto
  serverRuntimeConfig: {
    port: parseInt(process.env.PORT || '3005', 10)
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://api:5005/api/:path*'  // URL interna para Docker
          : 'http://localhost:5005/api/:path*' // URL para desarrollo
      }
    ]
  }
};

export default nextConfig;
