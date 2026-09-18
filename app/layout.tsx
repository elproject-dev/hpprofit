import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Outfit, Poppins, Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PWAProvider } from "@/components/pwa-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AppLock } from "@/components/app-lock";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeCustomizerProvider } from "@/components/theme-customizer";

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });
const nunito = Nunito({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-nunito' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HPProfit App",
  description: "HPP MARGIN GENERATOR",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HPProfit",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, poppins.variable, nunito.variable, outfit.variable, playfairDisplayHeading.variable)}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <ThemeCustomizerProvider>
            <PWAProvider />
            <PWAInstallPrompt />
            <AppLock>
              {children}
            </AppLock>
          </ThemeCustomizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
