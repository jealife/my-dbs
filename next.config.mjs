/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.65", "10.172.239.186"],
  reactCompiler: true,
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080';
    return [
      // /api/* is now handled by app/api/[...path]/route.js (explicit proxy with auth)
      {
        source: '/actuator/:path*',
        destination: `${backendBase}/actuator/:path*`,
      },
    ];
  },
};

export default nextConfig;
