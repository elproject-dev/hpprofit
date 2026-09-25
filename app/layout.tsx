import type { Metadata } from "next";
import { Playfair_Display, Outfit, Poppins, Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PWAProvider } from "@/components/pwa-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { AppLock } from "@/components/app-lock";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeCustomizerProvider } from "@/components/theme-customizer";
import { FloatingMenu } from "@/components/floating-menu";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { HardwareBackButton } from "@/components/hardware-back-button";
import { Toaster } from "@/components/ui/sonner";

const playfairDisplayHeading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading', preload: false });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins', preload: false });
const nunito = Nunito({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-nunito', preload: false });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', preload: false });

export const metadata: Metadata = {
  title: "HPP MARGIN PRO",
  description: "HPP MARGIN GENERATOR",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HPP MARGIN PRO",
  },
};

export const viewport = {
  themeColor: "#7e4b31ff",
  width: "device-width",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", poppins.variable, nunito.variable, outfit.variable, playfairDisplayHeading.variable)}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <ThemeCustomizerProvider>
            <PWAProvider />
            <PWAInstallPrompt />
            <OnboardingWizard />
            <HardwareBackButton />
            <AppLock>
              {children}
              <FloatingMenu />
            </AppLock>
            <Toaster richColors position="bottom-center" />
          </ThemeCustomizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
