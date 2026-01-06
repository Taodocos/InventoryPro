// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { Box, Container } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inventory',
  description: 'dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {children}
        </Box>
      </body>
    </html>
  );
}