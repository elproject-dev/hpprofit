"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handler = (e: any) => {
      // Jika pengguna sudah menutup pop-up di sesi ini, jangan munculkan lagi
      if (sessionStorage.getItem("pwa_prompt_dismissed") === "true") {
        return;
      }

      e.preventDefault();
      setDeferredPrompt(e);

      // Jeda 15 detik (15000 ms) sebelum menampilkan pop-up
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Sistem belum siap untuk instalasi. Pastikan Anda tidak sedang dalam mode incognito/private.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
    } catch (err) {
      console.error("Gagal memanggil prompt instalasi:", err);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in slide-in-from-top-8 fade-in duration-500 ease-out">
      <div className="bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-none shadow-2xl p-4 flex flex-col gap-3 relative overflow-hidden">

        {/* Dekorasi Glow */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0 bg-transparent">
            <img src="/icon.svg" alt="HPProfit" className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>
          <div className="pr-4 rounded-none">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-[15px] tracking-tight">Install HPP MARGIN</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Pasang aplikasi ini ke layar utama Anda <br></br>Nikmati akses lebih cepat & fitur offline penuh.
            </p>
          </div>
        </div>

        <div className="flex mt-2">
          <Button
            className="w-full rounded-sm text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            onClick={handleInstallClick}
          >
            Install Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
