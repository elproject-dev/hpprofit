"use client";

import { useTheme } from "next-themes";
import { useThemeCustomizer } from "@/components/theme-customizer";
import { Check, Monitor, Moon, Sun, Palette, Type, ChevronDown, Info, Clock, KeyRound, ShieldCheck, Phone, HelpCircle, AArrowUp, BookType } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { validateFirebaseVoucher } from "@/lib/voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const colors = [
  { name: "Chocolate (Default)", value: "emerald", class: "bg-[#56311F] border-[#3b2215]" },
  { name: "Hitam (Zinc)", value: "zinc", class: "bg-zinc-800 border-zinc-900 dark:bg-zinc-200 dark:border-zinc-300" },
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
    <div className="bg-[#F3DBC9] border border-primary/20 rounded-sm shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left focus:outline-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {iconComponent ? iconComponent : Icon && <Icon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">{title}</h3>
            <p className="text-xs text-primary/80">{desc}</p>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-primary transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
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

  // State Status Lisensi
  const [licenseStatus, setLicenseStatus] = useState<"authorized" | "trial" | "expired">("authorized");
  const [trialTimeLeft, setTrialTimeLeft] = useState<string>("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // State untuk menyimpan menu mana yang sedang terbuka
  const [openSection, setOpenSection] = useState<string>("");

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? "" : title));
  };

  useEffect(() => {
    setMounted(true);

    const checkLicense = () => {
      const isAuth = localStorage.getItem("hpprofit_device_authorized");
      if (isAuth === "true") {
        setLicenseStatus("authorized");
        return;
      }

      const trialStart = localStorage.getItem("hpprofit_trial_start");
      if (!trialStart) {
        setLicenseStatus("trial");
        return;
      }

      const now = Date.now();
      const msElapsed = now - parseInt(trialStart);
      const TRIAL_DURATION = 1 * 24 * 60 * 60 * 1000; // 1 hari trial
      const msLeft = Math.max(0, TRIAL_DURATION - msElapsed);

      if (msLeft > 0) {
        setLicenseStatus("trial");
        const totalSeconds = Math.floor(msLeft / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTrialTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setLicenseStatus("expired");
        setTrialTimeLeft("Habis");
      }
    };

    checkLicense();
    const interval = setInterval(checkLicense, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = voucherCode.replace(/[^0-9]/g, "");
    if (cleanCode.length !== 8) {
      toast.error("Kode voucher harus terdiri dari 8 digit angka!");
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateFirebaseVoucher(cleanCode);
      if (isValid) {
        localStorage.setItem("hpprofit_device_authorized", "true");
        localStorage.setItem("hpprofit_show_thank_you", "true");
        window.dispatchEvent(new Event("hpprofit_license_updated"));
        setLicenseStatus("authorized");
        setShowVoucherInput(false);
        setVoucherCode("");
        toast.success("Aktivasi Lisensi Berhasil!", {
          description: "Aplikasi Anda sekarang telah aktif permanen seumur hidup."
        });
      } else {
        toast.error("Voucher Tidak Valid atau Sudah Digunakan", {
          description: "Silakan periksa kembali kode voucher Anda."
        });
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server", {
        description: "Pastikan koneksi internet Anda aktif untuk memvalidasi voucher."
      });
    } finally {
      setIsValidating(false);
    }
  };

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
          <h2 className="text-xl font-bold tracking-tight font-heading text-primary">Personalisasi</h2>
        </div>

        <div className="flex flex-col gap-4">


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
                  <span className="text-sm font-medium text-primary">Kustomisasi Warna Costum</span>
                  <div
                    className="w-8 h-8 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors duration-200"
                    style={{ backgroundColor: `hsl(${customH}, ${customS}%, ${customL}%)` }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-primary font-medium">
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
                    <div className="flex justify-between text-xs text-primary font-medium">
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
                    <div className="flex justify-between text-xs text-primary font-medium">
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
                      ? "border-primary bg-primary/20 text-primary shadow-sm font-bold"
                      : "border-primary/20 hover:bg-[#AC7F5E]/20 hover:text-primary text-primary/70"
                  )}
                  style={{ fontFamily: `var(--font-${f.value})` }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm leading-none mb-1 text-primary">{f.name}</span>
                    <span className="text-[11px] opacity-70 text-primary">Aa Bb Cc</span>
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
            icon={BookType}
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
                      ? "border-primary bg-primary/20 text-primary shadow-sm font-bold"
                      : "border-primary/20 hover:bg-[#AC7F5E]/20 hover:text-primary text-primary/70"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="leading-none mb-1 text-primary" style={{
                      fontSize: s.value === "sm" ? "13px" : s.value === "md" ? "14px" : "15px"
                    }}>{s.name}</span>
                    <span className="text-[11px] opacity-70 text-primary">{s.desc}</span>
                  </div>
                  {fontSize === s.value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </SettingSection>

          {/* LAYANAN DUKUNGAN */}
          <SettingSection
            title="Dukungan Pelanggan"
            desc="Konsultasi & pembuatan aplikasi custom."
            icon={HelpCircle}
            isOpen={openSection === "Dukungan Pelanggan"}
            onToggle={() => toggleSection("Dukungan Pelanggan")}
          >
            <div className="flex flex-col items-center justify-center text-center p-5 sm:p-8 bg-[#FAEDE4] rounded-sm border border-dashed border-primary/30">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary mb-1.5 sm:mb-2">Pembuatan Aplikasi Custom</h3>
              <p className="text-xs sm:text-sm text-primary/80 mb-4 sm:mb-6 max-w-2xl px-2 sm:px-0 leading-relaxed">
                Selain aplikasi ini, Kami melayani pembuatan berbagai macam sistem untuk kebutuhan bisnis Anda, <br></br>di antaranya :<br></br><strong>Website Modern, Aplikasi Perkantoran, Sistem Kasir (POS), ERP, Sistem Antrean, Absensi, Inventory, Stock, Manajemen Aset, Promosi, Toko Online, Booking Sistem, Portal Siswa, Pemerintahan,</strong> <br></br>dan berbagai kebutuhan custom lainnya.
              </p>
              <Button onClick={() => window.open('https://wa.me/6283867180887', '_blank')} className="rounded-full px-6 sm:px-8 h-9 sm:h-10 text-xs sm:text-sm shadow-md gap-2">
                <Phone className="w-4 h-4" />
                Hubungi Kami via WhatsApp
              </Button>
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
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAEDE4] rounded-sm border border-primary/20 shadow-inner">
              <img src="/icon.svg" alt="HPProfit Logo" className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 drop-shadow-md" />
              <h4 className="text-lg sm:text-xl font-bold text-primary tracking-tight">HPPMARGIN</h4>
              <p className="text-[11px] sm:text-xs text-primary/70 mb-4 sm:mb-6 font-mono">Versi 1.0.3 (Build 2026)</p>

              <div className="w-full space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm">
                {/* STATUS LISENSI */}
                <div className="flex justify-between items-center pb-2.5 sm:pb-3 border-b border-primary/20">
                  <span className="text-primary/80">Status Lisensi</span>
                  {licenseStatus === "authorized" ? (
                    <span className="inline-flex items-center gap-1.5 py-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] sm:text-xs ">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Teraktivasi Permanen
                    </span>
                  ) : licenseStatus === "trial" ? (
                    <span className="inline-flex items-center gap-1.5 py-1 text-amber-600 dark:text-amber-400 font-semibold text-[10px] sm:text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      Masa Trial - Uji Coba
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-[10px] sm:text-xs border border-red-500/20">
                      Trial Kedaluwarsa
                    </span>
                  )}
                </div>

                {/* SISA WAKTU TRIAL */}
                {licenseStatus === "trial" && (
                  <div className="flex justify-between items-center pb-2.5 sm:pb-3 border-b border-primary/20">
                    <span className="text-primary/80">Sisa Waktu Trial</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                      {trialTimeLeft || "Memuat..."}
                    </span>
                  </div>
                )}

                {/* INPUT / TOMBOL AKTIVASI VOUCHER JIKA BELUM PERMANEN */}
                {licenseStatus !== "authorized" && (
                  <div className="pt-1 pb-1">
                    {!showVoucherInput ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowVoucherInput(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-sm shadow-sm gap-1.5 text-xs h-9"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Aktivasi Lisensi Permanen
                      </Button>
                    ) : (
                      <form onSubmit={handleActivateVoucher} className="space-y-2 p-3 bg-white/20 rounded-sm border border-primary/20 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-primary">Masukkan 8 Digit Kode Voucher</span>
                          <button
                            type="button"
                            onClick={() => { setShowVoucherInput(false); setVoucherCode(""); }}
                            className="text-[10px] text-primary/70 hover:text-primary underline"
                          >
                            Batal
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            maxLength={8}
                            placeholder="Masukkan Kode Voucher"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.replace(/[^0-9]/g, ""))}
                            className="h-9 text-xs tracking-widest text-center"
                            autoFocus
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isValidating || voucherCode.length !== 8}
                            className="h-9 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isValidating ? "Validasi..." : "Aktifkan"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-primary/20">
                  <span className="text-primary/80">Server Keamanan</span>
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Firebase Cloud
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-primary/80">Pengembang</span>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-[11px] sm:text-xs text-primary uppercase">ElProject Development</span>
                    <a href="https://www.elproject.studio" target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-500 hover:underline mt-0.5">
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
