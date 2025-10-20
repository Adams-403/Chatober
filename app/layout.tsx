import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner"

// Hacker-style monospace font
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chatober | Secure Hacker Chat",
  description: "A secure, end-to-end encrypted chat application for the cyberpunk era.",
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  keywords: ['hacker', 'chat', 'cyberpunk', 'secure', 'encrypted', 'terminal'],
  authors: [{ name: 'Chatober Team' }],
  creator: 'Chatober',
  publisher: 'Chatober',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body className={`${geistMono.variable} font-mono bg-black text-[#00ff41] min-h-screen overflow-hidden`}>
          <div className="scanline">
            <div className="relative min-h-screen flex flex-col">
              {/* HUD Elements */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-50"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00ff41] to-transparent opacity-30"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00ff41] to-transparent opacity-30"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-50"></div>
              
              {/* Main Content */}
              <ConvexClientProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem={false}
                  disableTransitionOnChange
                >
                  <main className="relative z-10 flex-1">
                    {children}
                  </main>
                  <Toaster position="top-center" richColors />
                </ThemeProvider>
              </ConvexClientProvider>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
