/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.72"],
  reactCompiler: true,
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: '/actuator/:path*',
        destination: `${backendBase}/actuator/:path*`,
      },
    ];
  },
};

export default nextConfig;
