import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#FFFFFF' }
  ]
}

export const metadata: Metadata = {
  title: "Meridian Post - AI-Powered News Platform",
  description: "A completely open news platform where anyone can publish articles immediately without registration. AI-enhanced with NYT-quality design and zero barriers to entry.",
  keywords: ["Meridian Post", "news", "AI", "journalism", "publishing", "community", "responsive design"],
  authors: [{ name: "Meridian Post Team" }],
  icons: {
    icon: "/logo.svg",
    apple: { url: "/apple-icon.png" },
  },
  openGraph: {
    title: "Meridian Post - AI-Powered News Platform",
    description: "Read and publish news instantly with AI assistance. No registration required. Professional journalism meets modern technology.",
    url: "https://meridian-post.com",
    siteName: "Meridian Post",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Meridian Post - AI News Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian Post - AI-Powered News Platform",
    description: "Read and publish news instantly with AI assistance. No registration required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true
    }
  },
  metadataBase: new URL('https://meridian-post.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
