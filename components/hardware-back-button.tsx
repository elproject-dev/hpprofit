"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';

export function HardwareBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const [showExitToast, setShowExitToast] = useState(false);

  useEffect(() => {
    let lastTimeBackPress = 0;
    const timePeriodToExit = 2000;
    let timeoutId: NodeJS.Timeout;

    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      // Jika bisa go back dan bukan di halaman utama atau wizard, biarkan router kembali
      if (pathname !== "/" && pathname !== "/wizard") {
        router.back();
      } else {
        // Jika di halaman utama (Dashboard) atau wizard awal, implementasikan tekan 2x untuk keluar
        const currentTime = new Date().getTime();
        if (currentTime - lastTimeBackPress < timePeriodToExit) {
          App.exitApp();
        } else {
          setShowExitToast(true);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setShowExitToast(false);
          }, 2000);
          lastTimeBackPress = currentTime;
        }
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
      clearTimeout(timeoutId);
    };
  }, [pathname, router]);

  if (!showExitToast) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#56311F] text-white px-5 py-2.5 rounded-full shadow-lg shadow-black/20 flex items-center justify-center border border-white/10 w-max max-w-[90vw]">
        <span className="text-[13px] font-medium tracking-wide whitespace-nowrap">Tekan sekali lagi untuk keluar</span>
      </div>
    </div>
  );
}
