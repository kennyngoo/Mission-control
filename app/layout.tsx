import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Ops dashboard — Takoyaki',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body
        style={{
          height: '100%',
          margin: 0,
          backgroundColor: '#0f1117',
          color: '#e2e8f0',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          display: 'flex',
        }}
      >
        <Sidebar />
        <main
          style={{
            marginLeft: '240px',
            flex: 1,
            minHeight: '100vh',
            backgroundColor: '#0f1117',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
