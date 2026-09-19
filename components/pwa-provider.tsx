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

  // Cegah menu konteks / opsi bawaan browser saat elemen ditekan lama (long-press) di Android PWA
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Tetap izinkan opsi teks (seperti paste) jika user menekan kolom input form
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu, { passive: false });
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}
