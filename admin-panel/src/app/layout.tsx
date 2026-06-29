import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkSpace Admin',
  description: 'Admin panel for LinkSpace — manage meetings, users, and analytics',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}

