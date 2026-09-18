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

  return null;
}
