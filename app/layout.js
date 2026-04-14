import { Outfit } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: {
    default: "MySchool - Professional DBS",
    template: "%s | MySchool"
  },
  description: "Next Generation Learning & School Management System",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyDBS',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'MyDBS',
    title: {
      default: 'MySchool - Professional DBS',
      template: '%s | MySchool',
    },
    description: 'Next Generation Learning & School Management System',
  },
  twitter: {
    card: 'summary',
    title: {
      default: 'MySchool - Professional DBS',
      template: '%s | MySchool',
    },
    description: 'Next Generation Learning & School Management System',
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
