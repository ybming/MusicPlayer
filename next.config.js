/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  // 允许网易云/QQ等音乐 API 的图片/音频域名
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.music.126.net' },
      { protocol: 'https', hostname: '*.gtimg.cn' },
      { protocol: 'https', hostname: '*.kuaishou.com' },
    ],
  },
  // api.php 路由重写到 Next.js Route Handler
  async rewrites() {
    return [
      { source: '/api.php', destination: '/api/music' },
      { source: '/api.php/:path*', destination: '/api/music/:path*' },
    ];
  },
};

module.exports = nextConfig;
