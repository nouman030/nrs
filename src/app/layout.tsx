import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DM_Sans, Inter } from 'next/font/google'
import {dark} from '@clerk/themes'
import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NRS-Studio',
  description: 'All in one Agency Solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={{baseTheme: dark}}>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
