import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import GlobalsInitializer from '@/components/GlobalsInitializer';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for restaurant management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalsInitializer />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
