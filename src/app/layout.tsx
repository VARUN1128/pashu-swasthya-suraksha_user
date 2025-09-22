import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pashu Swasthya Suraksha - Farm Animal Health & Antimicrobial Stewardship',
  description: 'A comprehensive digital platform for tracking antimicrobial usage, ensuring food safety, and maintaining compliance with regulatory standards for livestock and poultry farming.',
  keywords: 'farm animal health, antimicrobial stewardship, livestock management, food safety, MRL compliance, veterinary care',
  authors: [{ name: 'Pashu Swasthya Suraksha Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Pashu Swasthya Suraksha - Farm Animal Health & Antimicrobial Stewardship',
    description: 'A comprehensive digital platform for tracking antimicrobial usage, ensuring food safety, and maintaining compliance with regulatory standards for livestock and poultry farming.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}