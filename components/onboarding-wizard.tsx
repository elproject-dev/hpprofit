"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const ONBOARDING_KEY = "hpprofit_has_seen_onboarding";

export function OnboardingWizard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    
    // Deteksi jika perangkat adalah Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    // Deteksi jika berjalan sebagai PWA (Standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (!hasSeen && pathname !== "/wizard") {
      // Lewati wizard jika dibuka via PWA di Android
      if (isAndroid && isPWA) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        return;
      }
      
      router.push("/wizard");
    }
  }, [pathname, router]);

  return null;
}
