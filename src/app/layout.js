import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import EnvSwitcher from '@/components/EnvSwitcher';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for restaurant management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.process = {
                env: {
                  NEXT_PUBLIC_API_URL: "https://men4u.xyz/v2"
                }
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
       
      </body>
    </html>
  );
}
