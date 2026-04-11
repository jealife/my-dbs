export default function manifest() {
  return {
    name: 'MyDBS - Management System',
    short_name: 'MyDBS',
    description: 'Next Generation Learning & School Management System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo-mydbs.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
