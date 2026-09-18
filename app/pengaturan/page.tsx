"use client";

import { useTheme } from "next-themes";
import { useThemeCustomizer } from "@/components/theme-customizer";
import { Check, Monitor, Moon, Sun, Palette, Type, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import { useEffect, useState } from "react";

const colors = [
  { name: "Emerald (Default)", value: "emerald", class: "bg-emerald-500 border-emerald-600" },
  { name: "Rose", value: "rose", class: "bg-rose-500 border-rose-600" },
  { name: "Blue", value: "blue", class: "bg-blue-500 border-blue-600" },
  { name: "Orange", value: "orange", class: "bg-orange-500 border-orange-600" },
  { name: "Zinc", value: "zinc", class: "bg-zinc-800 border-zinc-900 dark:bg-zinc-200 dark:border-zinc-300" },
] as const;

const fonts = [
  { name: "Outfit (Modern)", value: "outfit" },
  { name: "Poppins (Elegan)", value: "poppins" },
  { name: "Nunito (Bulat)", value: "nunito" },
] as const;

const sizes = [
  { name: "Kecil", value: "sm", desc: "Padat" },
  { name: "Sedang", value: "md", desc: "Standar" },
  { name: "Besar", value: "lg", desc: "Jelas" },
] as const;

function SettingSection({
  title,
  desc,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  iconComponent
}: {
  title: string,
  desc: string,
  icon?: any,
  isOpen: boolean,
  onToggle: () => void,
  children: React.ReactNode,
  iconComponent?: React.ReactNode
}) {

  return (
    <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-700/50 rounded-sm shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left focus:outline-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {iconComponent ? iconComponent : Icon && <Icon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PengaturanPage() {
  const { theme, setTheme } = useTheme();
  const { colorScheme, setColorScheme, fontFamily, setFontFamily, fontSize, setFontSize, customH, setCustomH, customS, setCustomS, customL, setCustomL } = useThemeCustomizer();
  const [mounted, setMounted] = useState(false);

  // State untuk menyimpan menu mana yang sedang terbuka
  const [openSection, setOpenSection] = useState<string>("");

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? "" : title));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AppLayout>
        <div style={{ visibility: "hidden" }} className="flex-1 p-4" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6 w-full animate-in fade-in duration-500">
        <div className="flex items-start">
          <h2 className="text-xl font-bold tracking-tight font-heading text-zinc-900 dark:text-zinc-100">Personalisasi</h2>
        </div>

        <div className="flex flex-col gap-4">

          {/* TEMA (Light / Dark) */}
          <SettingSection
            title="Mode Tema"
            desc="Terang, gelap, atau sistem."
            isOpen={openSection === "Mode Tema"}
            onToggle={() => toggleSection("Mode Tema")}
            iconComponent={<><Sun className="w-4 h-4 dark:hidden" /><Moon className="w-4 h-4 hidden dark:block" /></>}
          >
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { name: "Terang", value: "light", icon: Sun },
                { name: "Gelap", value: "dark", icon: Moon },
                { name: "Sistem", value: "system", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-sm border transition-all",
                    theme === t.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  )}
                >
                  <t.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </SettingSection>

          {/* SKEMA WARNA */}
          <SettingSection
            title="Warna Aksen"
            desc="Warna tombol dan ikon utama."
            icon={Palette}
            isOpen={openSection === "Warna Aksen"}
            onToggle={() => toggleSection("Warna Aksen")}
          >
            <div className="flex flex-col gap-5 pt-1">
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setColorScheme(color.value as any)}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                      colorScheme === color.value
                        ? "border-primary shadow-md shadow-primary/20 scale-110"
                        : "border-transparent opacity-80 hover:opacity-100",
                      color.class
                    )}
                    title={color.name}
                  >
                    {colorScheme === color.value && <Check className="w-4 h-4 text-white dark:text-zinc-900 mix-blend-exclusion" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Kustomisasi Warna Costum</span>
                  <div
                    className="w-8 h-8 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors duration-200"
                    style={{ backgroundColor: `hsl(${customH}, ${customS}%, ${customL}%)` }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                      <span>Hue (Warna)</span>
                      <span>{customH}°</span>
                    </div>
                    <input
                      type="range" min="0" max="360" value={customH}
                      onChange={(e) => { setCustomH(Number(e.target.value)); setColorScheme("custom"); }}
                      className="w-full h-2 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300"
                      style={{
                        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                      <span>Saturation (Kepekatan)</span>
                      <span>{customS}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={customS}
                      onChange={(e) => { setCustomS(Number(e.target.value)); setColorScheme("custom"); }}
                      className="w-full h-2 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300"
                      style={{
                        background: `linear-gradient(to right, hsl(${customH}, 0%, ${customL}%), hsl(${customH}, 100%, ${customL}%))`
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                      <span>Lightness (Keterangan)</span>
                      <span>{customL}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={customL}
                      onChange={(e) => { setCustomL(Number(e.target.value)); setColorScheme("custom"); }}
                      className="w-full h-2 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300"
                      style={{
                        background: `linear-gradient(to right, hsl(${customH}, ${customS}%, 0%), hsl(${customH}, ${customS}%, 50%), hsl(${customH}, ${customS}%, 100%))`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* FONT FAMILY */}
          <SettingSection
            title="Gaya Huruf"
            desc="Jenis tulisan aplikasi."
            icon={Type}
            isOpen={openSection === "Gaya Huruf"}
            onToggle={() => toggleSection("Gaya Huruf")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {fonts.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFontFamily(f.value as any)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-sm border transition-all",
                    fontFamily === f.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
                  )}
                  style={{ fontFamily: `var(--font-${f.value})` }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium leading-none mb-1 text-zinc-900 dark:text-zinc-100">{f.name}</span>
                    <span className="text-[11px] opacity-70">Aa Bb Cc</span>
                  </div>
                  {fontFamily === f.value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </SettingSection>

          {/* FONT SIZE */}
          <SettingSection
            title="Ukuran Teks"
            desc="Proporsi ukuran teks."
            icon={Type}
            isOpen={openSection === "Ukuran Teks"}
            onToggle={() => toggleSection("Ukuran Teks")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFontSize(s.value as any)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-sm border transition-all",
                    fontSize === s.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium leading-none mb-1 text-zinc-900 dark:text-zinc-100" style={{
                      fontSize: s.value === "sm" ? "13px" : s.value === "md" ? "14px" : "15px"
                    }}>{s.name}</span>
                    <span className="text-[11px] opacity-70">{s.desc}</span>
                  </div>
                  {fontSize === s.value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </SettingSection>

          {/* INFO SISTEM */}
          <SettingSection
            title="Tentang Sistem"
            desc="Informasi aplikasi dan lisensi."
            icon={Info}
            isOpen={openSection === "Tentang Sistem"}
            onToggle={() => toggleSection("Tentang Sistem")}
          >
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-sm border border-zinc-200/60 dark:border-zinc-800/60 shadow-inner">
              <img src="/icon.svg" alt="HPProfit Logo" className="w-16 h-16 mb-4 drop-shadow-md" />
              <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">HPProfit Premium</h4>
              <p className="text-xs text-zinc-500 mb-6 font-mono">Versi 1.0.0 (Build 2026)</p>

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Status Lisensi</span>
                  <span className="px-2.5 py-1 rounded-full bg-green-600 dark:bg-emerald-500/10 text-white dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-500/20">
                    Aktivasi Berhasil
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Server Keamanan</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Firebase Cloud
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-zinc-500 dark:text-zinc-400">Pengembang</span>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 uppercase">ElProject Development</span>
                    <a href="https://www.elproject.studio" target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 dark:text-emerald-500 hover:underline mt-0.5">
                      www.elproject.studio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SettingSection>

        </div>
      </div>
    </AppLayout>
  );
}
