"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Package,
  ShoppingBag,
  ChefHat,
  ChevronRight,
  Check,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "hpprofit_has_seen_onboarding";

const steps = [
  {
    title: "Selamat Datang di HPProfit!",
    desc: "Aplikasi cerdas untuk menghitung Harga Pokok Penjualan (HPP) dan margin keuntungan bisnis Anda dengan mudah dan akurat.",
    icon: Rocket,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Kelola Bahan & Kemasan",
    desc: "Catat semua bahan baku dan kemasan yang Anda gunakan. Pantau stok dan harga beli untuk memudahkan kalkulasi biaya modal.",
    icon: Package,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Kalkulasi Produk",
    desc: "Gabungkan bahan-bahan menjadi sebuah produk akhir. Tentukan persentase margin keuntungan yang Anda harapkan secara presisi.",
    icon: ShoppingBag,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Transaksi Produksi",
    desc: "Catat setiap kali Anda melakukan produksi. Tambahkan biaya operasional ekstra, dan ketahui persis modal HPP per produksi.",
    icon: ChefHat,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  }
];

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if the user has seen the onboarding
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) {
      // Delay showing slightly for a better UX on first load
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  // Skip wizard
  const handleSkip = () => {
    finishOnboarding();
  };

  // Wait for client mount to avoid hydration mismatch
  if (!mounted) return null;
  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">

      {/* Container */}
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-sm overflow-hidden shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-8 zoom-in-95 duration-500">

        {/* Main Content Area */}
        <div className="p-8 sm:p-10 flex flex-col items-center text-center relative min-h-[360px]">

          {/* Skip Button (only show if not last step) */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-5 text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Lewati
            </button>
          )}

          {/* Animated Icon Container */}
          <div key={currentStep} className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-in zoom-in spin-in-12 duration-500 delay-100", step.bg)}>
            <Icon className={cn("w-12 h-12", step.color)} />
          </div>

          {/* Text Content */}
          <div key={`text-${currentStep}`} className="mt-4 animate-in fade-in slide-in-from-right-4 duration-500 delay-150 flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
              {step.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {step.desc}
            </p>
          </div>
        </div>

        {/* Footer Area: Indicators and Controls */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : "w-2 bg-zinc-300 dark:bg-zinc-700"
                )}
              />
            ))}
          </div>

          {/* Next/Finish Button */}
          <button
            onClick={handleNext}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-95",
              isLastStep
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            )}
          >
            {isLastStep ? (
              <>
                Mulai Sekarang
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Selanjutnya
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
