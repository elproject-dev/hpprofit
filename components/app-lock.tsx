"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert, KeyRound, MessageCircle, Clock, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { validateFirebaseVoucher } from "@/lib/voucher";

// --- KONFIGURASI TRIAL & VOUCHER ---
const ADMIN_PHONE = "6283867180887"; // Ganti dengan nomor WA (Gunakan 62, hilangkan 0 di depan)
const TRIAL_DAYS = 1; // Lama masa trial (hari)

const AUTH_KEY = "hpprofit_device_authorized";
const TRIAL_START_KEY = "hpprofit_trial_start";

export function AppLock({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  // Status akses
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inTrialMode, setInTrialMode] = useState(false);
  const [trialStartMs, setTrialStartMs] = useState<number>(0);
  const [trialExpired, setTrialExpired] = useState(false);

  // Form State
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_KEY);
    const showThanks = localStorage.getItem("hpprofit_show_thank_you");

    if (showThanks === "true") {
      setShowThankYou(true);
    }

    // 1. Jika sudah punya lisensi permanen
    if (authStatus === "true") {
      setIsAuthorized(true);
      setIsMounted(true);
      return;
    }

    // 2. Jika belum punya lisensi, jalankan logika Trial
    let trialStart = localStorage.getItem(TRIAL_START_KEY);
    const now = Date.now();

    if (!trialStart) {
      // User baru pertama kali buka
      localStorage.setItem(TRIAL_START_KEY, now.toString());
      trialStart = now.toString();

      // Munculkan notifikasi selamat datang
      setTimeout(() => {
        toast.success(`Welcome! Masa Uji Coba ${TRIAL_DAYS} Hari Dimulai.`, {
          description: "Silakan coba seluruh fitur aplikasi secara gratis.",
          position: "top-center"
        });
      }, 2000);
    }

    // Hitung waktu yang berlalu
    const msElapsed = now - parseInt(trialStart);
    const msLeft = Math.max(0, (TRIAL_DAYS * 24 * 60 * 60 * 1000) - msElapsed);

    if (msLeft > 0) {
      // Masih dalam masa trial
      setIsAuthorized(true);
      setInTrialMode(true);
      setTrialStartMs(parseInt(trialStart));
      setIsMounted(true);
    } else {
      // Waktu trial habis
      setIsAuthorized(false);
      setTrialExpired(true);
      setIsMounted(true);
    }

    const handleLicenseUpdate = () => {
      if (localStorage.getItem(AUTH_KEY) === "true") {
        setIsAuthorized(true);
        setInTrialMode(false);
        setTrialExpired(false);
      }
    };

    window.addEventListener("hpprofit_license_updated", handleLicenseUpdate);
    window.addEventListener("storage", handleLicenseUpdate);

    return () => {
      window.removeEventListener("hpprofit_license_updated", handleLicenseUpdate);
      window.removeEventListener("storage", handleLicenseUpdate);
    };
  }, []);

  const handleTrialExpire = () => {
    setIsAuthorized(false);
    setTrialExpired(true);
    setInTrialMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      const isValid = await validateFirebaseVoucher(pin);

      if (isValid) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem("hpprofit_show_thank_you", "true");
        setIsAuthorized(true);
        setTrialExpired(false);
        setInTrialMode(false);
        setShowThankYou(true);
        setError(false);
        toast.success("Aktivasi Berhasil!", {
          description: "Terima kasih telah menggunakan HPProfit Premium.",
          position: "top-center"
        });
      } else {
        setError(true);
        setPin("");
        setTimeout(() => setError(false), 800);
        toast.error("Voucher Tidak Valid atau Sudah Terpakai", {
          description: "Pastikan kode yang dimasukkan belum pernah digunakan sebelumnya.",
          position: "top-center"
        });
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server", {
        description: "Pastikan koneksi internet Anda stabil untuk memvalidasi voucher.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const contactAdmin = () => {
    const text = encodeURIComponent(`Halo Admin, saya ingin membeli kode voucher aktivasi untuk aplikasi HPProfit saya.`);
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${text}`, "_blank");
  };

  if (!isMounted) return null;

  // Bebaskan halaman admin-voucher dari penguncian
  if (pathname === "/admin-voucher") {
    return <>{children}</>;
  }

  // Fungsi untuk menutup popup terima kasih
  const closeThankYou = () => {
    setShowThankYou(false);
    localStorage.removeItem("hpprofit_show_thank_you");
  };

  // Jika diizinkan masuk (Baik karena berlisensi permanen atau masih trial)
  if (isAuthorized) {
    return (
      <>
        {children}

        {/* POPUP TERIMA KASIH (HANYA MUNCUL SEKALI) */}
        {showThankYou && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-card w-full max-w-lg rounded-sm shadow-2xl overflow-hidden border border-primary/20 animate-in zoom-in-95 duration-500">
              <div className="bg-primary p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Efek Confetti Sederhana (Menggunakan CSS) */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
                <div className="w-24 h-24 flex items-center justify-center mb-6 relative z-10">
                  <img src="/icon.svg" alt="HPProfit Logo" className="w-full h-full object-contain drop-shadow-xl" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground mb-2 tracking-tight">Aktivasi Berhasil!</h2>
                <p className="text-primary-foreground/90 text-sm font-medium">Aplikasi ini sekarang menjadi milik Anda selamanya.</p>
              </div>

              <div className="p-8 text-center space-y-6">
                <p className="text-primary/70 text-sm leading-relaxed">
                  Terima kasih banyak telah mempercayai dan membeli lisensi premium <strong className="text-primary font-semibold">HPP-MARGIN</strong>.
                  <br /><br />
                  Semoga aplikasi ini dapat membantu bisnis Anda semakin berkembang, pembukuan lebih rapi, dan meraup keuntungan setiap harinya!
                </p>

                <Button
                  onClick={closeThankYou}
                  className="w-full h-12 text-[15px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm shadow-lg transition-transform active:scale-95"
                >
                  Mulai Gunakan Aplikasi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Banner Trial dengan Waktu Berjalan */}
        {inTrialMode && (
          <TrialCountdown trialStartMs={trialStartMs} onExpire={handleTrialExpire} />
        )}
      </>
    );
  }

  // Jika diblokir (Trial habis)
  return (
    <div className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className={cn(
        "max-w-md w-full bg-card border border-primary/20 rounded-sm shadow-2xl p-8 flex flex-col items-center text-center transition-transform overflow-hidden relative",
        error && "animate-in slide-in-from-left-2 duration-75 repeat-3"
      )}>
        {/* Dekorasi primer */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-primary/20">
          <ShieldAlert className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2 font-heading tracking-tight">
          Masa Trial Habis
        </h1>
        <p className="text-sm text-primary/70 mb-8 leading-relaxed px-4">
          Waktu uji coba gratis <strong>{TRIAL_DAYS} hari</strong> Anda telah kedaluwarsa. Silakan masukkan Kode Voucher untuk mengaktifkan aplikasi secara permanen.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10">
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Masukkan 8 Angka Voucher"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={cn(
                "pl-11 h-14 text-center text-lg tracking-[0.3em] rounded-sm transition-all shadow-sm border-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary",
                error && "border-red-500 focus-visible:ring-red-500 dark:border-red-500/50"
              )}
              maxLength={8}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={isValidating || pin.length < 8}
            className="w-full h-10 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[15px] shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isValidating ? "Memeriksa ke Server..." : "Aktivasi Sekarang"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary/20 w-full relative z-10">
          <p className="text-sm text-primary/70 mb-3">Belum punya kode voucher?</p>
          <Button
            variant="outline"
            onClick={contactAdmin}
            className="w-full h-10 rounded-sm border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Hubungi Admin via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

// Komponen terpisah untuk Timer agar tidak me-render ulang seluruh aplikasi setiap 1 detik
function TrialCountdown({ trialStartMs, onExpire }: { trialStartMs: number, onExpire: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => {
    const msElapsed = Date.now() - trialStartMs;
    return Math.max(0, (TRIAL_DAYS * 24 * 60 * 60 * 1000) - msElapsed);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-7 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000 fill-mode-both">
      <div className="relative bg-primary text-primary-foreground border border-primary/20 shadow-2xl px-6 py-3.5 rounded-sm flex flex-col gap-1 items-center justify-center">
        {/* Tombol X melayang keluar di sudut kanan atas card */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary-foreground text-primary hover:bg-red-500 hover:text-white border-transparent shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 z-10"
          title="Tutup sementara"
          aria-label="Tutup notifikasi masa trial"
        >
          <X className="w-3 h-3 stroke-[2.5]" />
        </button>

        <span className="text-[10px] text-primary-foreground/80 font-bold tracking-widest uppercase">
          Sisa Masa Trial
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-mono font-bold tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}
