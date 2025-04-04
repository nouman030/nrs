import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import "./globals.css";
import { Play } from "next/font/google";
// import { DM_Sans, Inter } from 'next/font/google'
import { dark } from '@clerk/themes'
import { ClerkProvider } from '@clerk/nextjs'

import { ThemeProvider } from "@/providers/theme-provider";
import React from 'react';
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/toaster";

const roboto = Play({ subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'NRS-Studio',
  description: 'All in one Agency Solution',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png' }
    ],
    apple: '/apple-icon.png',
  },
}



export default React.memo(function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider>
              {children}
              <Toaster />
            </ModalProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
});
