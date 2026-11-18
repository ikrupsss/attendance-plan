import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AttendanceProvider } from '@/context/AttendanceContext';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'ATTENDANCE PLAN — Stay ahead of every class',
  description: 'Personal mobile-first attendance tracker and academic planning tool.',
  applicationName: 'ATTENDANCE PLAN',
  authors: [{ name: 'Krupa Korishetty' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATTENDANCE PLAN',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7F4EB9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FDFBF7] dark:bg-[#121017] text-[#2D253A] dark:text-[#F3EEF9] transition-colors duration-200">
        <AttendanceProvider>
          {children}
          <Toast />
        </AttendanceProvider>
      </body>
    </html>
  );
}
