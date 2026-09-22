"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const ONBOARDING_KEY = "hpprofit_has_seen_onboarding";

export function OnboardingWizard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen && pathname !== "/wizard") {
      router.push("/wizard");
    }
  }, [pathname, router]);

  return null;
}
