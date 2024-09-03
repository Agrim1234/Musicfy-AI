import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";
import store from '@/app/store/store'
import { Provider } from 'react-redux'
import Providers from "@/components/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comedy@AI",
  description: "Comedy meets AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionWrapper>
        <body className={inter.className}>
          <Navbar />
          <Providers>
            {children}
          </Providers>
        </body>
      </SessionWrapper>
    </html>
  );
}
