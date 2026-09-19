"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        return;
      }

      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope);
          })
          .catch((error) => {
            console.error("ServiceWorker registration failed: ", error);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }
  }, []);

  // Cegah menu konteks bawaan HANYA saat ditekan lama (long-press) di layar sentuh (mobile/Android),
  // sedangkan klik kanan mouse di Web/Desktop tetap berfungsi normal 100%.
  useEffect(() => {
    let lastTouchTime = 0;

    const handleTouchStart = () => {
      lastTouchTime = Date.now();
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Jika TIDAK dipicu oleh sentuhan jari (misal klik kanan mouse di desktop/laptop), biarkan normal
      const isFromTouch = Date.now() - lastTouchTime < 1000;
      if (!isFromTouch) {
        return;
      }

      const target = e.target as HTMLElement | null;
      // Tetap izinkan opsi konteks jika user menekan kolom input form
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Cegah popup menu Chrome hanya pada long-press layar sentuh
      e.preventDefault();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("contextmenu", handleContextMenu, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}
