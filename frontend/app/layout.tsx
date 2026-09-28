import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { OrbitalHeroSection } from '@/components/ui/orbital-hero-section';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ThreatLink AI - Dark Web Threat Intelligence & Banking Fraud Investigation',
  description: 'AI-Agentic Dark Web Threat Intelligence & Banking Fraud Investigation Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-100 min-h-screen bg-transparent`}>
        <OrbitalHeroSection
          className="fixed inset-0"
          focus={[0.5, 0.5]}
          viewRadius={3.5}
          glow={0.5}
          scrim="none"
        >
          <div className="relative z-10 min-h-screen overflow-y-auto">
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
            </AuthProvider>
          </div>
        </OrbitalHeroSection>
      </body>
    </html>
  );
}
