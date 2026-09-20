"use client";

import { useState } from "react";
import { generateFirebaseVoucher } from "@/lib/voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, PlusCircle, ShieldAlert, Check, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const MASTER_ADMIN_PASSWORD = "elprojectdevelopment"; // Ubah password ini sesuai keinginan Anda

export default function AdminVoucherPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [vouchers, setVouchers] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const newVoucher = await generateFirebaseVoucher();
      // Tambahkan voucher baru ke bagian paling atas list
      setVouchers((prev) => [newVoucher, ...prev]);
      toast.success("Voucher Baru Berhasil Dibuat (Tersimpan di Firebase)!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat voucher. Pastikan internet Anda aktif dan Firebase terkonfigurasi dengan benar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const forceLockApp = () => {
    localStorage.setItem('hpprofit_trial_start', '1');
    localStorage.removeItem('hpprofit_device_authorized');
    window.location.href = '/';
  };

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast("Kode Disalin", { description: code });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-sm w-full bg-card/70 backdrop-blur-xl border border-primary/20 rounded-sm shadow-2xl p-8 flex flex-col items-center text-center relative z-10 transition-all duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2 text-primary tracking-tight">Otorisasi Admin</h1>
          <p className="text-sm text-primary/70 mb-8 leading-relaxed">
            Halaman ini dikhususkan untuk administrator</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "h-10 text-center px-12 text-lg tracking-[0.2em] rounded-sm transition-all duration-300 bg-background border-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary",
                  error && "border-red-500 focus-visible:ring-red-500/20 animate-in slide-in-from-left-2 duration-75 repeat-3"
                )}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[15px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Buka Kunci Akses
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <div className="text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-primary font-heading tracking-tight">
            Voucher Generator
          </h1>
          <p className="text-primary/70 mt-2 max-w-md">
            Hasilkan kode voucher 8 digit tanpa batas.
          </p>
        </div>

        <div className="bg-card border border-primary/20 rounded-sm p-6 shadow-sm flex flex-col items-center justify-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-sm shadow-md shadow-primary/20"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">Mencetak...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 mr-2" />
                Generate Voucher Baru
              </>
            )}
          </Button>

          {/* Tombol Testing Untuk Mengunci Aplikasi */}
          <Button
            onClick={forceLockApp}
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 rounded-sm mt-4 border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-900/50 dark:text-primary-400 dark:hover:bg-primary-900/20"
          >
            <Lock className="w-5 h-5 mr-2" />
            Kunci Paksa Aplikasi (Untuk Testing)
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Daftar Voucher Dibuat ({vouchers.length})
          </h2>

          {vouchers.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-primary/20 rounded-sm text-primary/50">
              Belum ada voucher yang di-generate.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {vouchers.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-card border border-primary/20 rounded-sm shadow-sm hover:border-primary/50 transition-colors">
                  <span className="font-mono text-xl tracking-[0.2em] font-medium text-primary">
                    {code}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(code, idx)}
                    className="text-primary/50 hover:text-primary"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
