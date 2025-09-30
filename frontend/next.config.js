module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ai-dashboard-backend-7dha.onrender.com/:path*',
      },
    ]
  },
}
