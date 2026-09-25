"use client";

import { AppLayout } from "@/components/app-layout";
import { AlertTriangleIcon, ChevronDown, HelpCircle, FileText, Phone, Package, Box, Receipt, ClipboardList } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function BantuanSection({
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
    <div className="bg-[#F5EBE1] dark:bg-zinc-900/50 border border-primary/20 rounded-sm shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
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

export default function BantuanPage() {
  const [openSection, setOpenSection] = useState<string>("");

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? "" : title));
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6 w-full animate-in fade-in duration-500">
        <div className="flex items-start">
          <h2 className="text-xl font-bold tracking-tight font-heading text-zinc-900 dark:text-zinc-100">Pusat Bantuan</h2>
        </div>

        <div className="flex flex-col gap-4">

          <BantuanSection
            title="Panduan Penggunaan Bahan Baku"
            desc="Cara mengisi satuan dan kalkulasi otomatis."
            icon={FileText}
            isOpen={openSection === "Panduan Pengisian"}
            onToggle={() => toggleSection("Panduan Pengisian")}
          >
            <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-sm border border-amber-200 dark:border-amber-900/50 space-y-5 text-sm text-amber-900 dark:text-amber-100 relative overflow-hidden">
              <AlertTriangleIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />

              <div className="space-y-2 relative z-10">
                <p className="font-semibold text-base border-b border-amber-200 dark:border-amber-900/50 pb-2">1. Konsep Dasar Pengisian :</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm pt-1">
                  <li><strong>Nama Satuan (Kemasan) :</strong> Satuan kemasan terbesar saat Anda membeli barang. Sifatnya opsional jika Anda membeli eceran. (Contoh: <em>Karton, Karung, Bal</em>)</li>
                  <li><strong>Jenis Satuan (Terkecil) :</strong> Satuan ukuran paling dasar yang nantinya akan Anda pakai saat menakar resep produksi. (Contoh: <em>gram, ml, pcs</em>)</li>
                  <li><strong>Jumlah Satuan (Konversi) :</strong> Berapa banyak isi 'Jenis Satuan' di dalam 1 'Nama Satuan'.</li>
                </ul>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="font-semibold text-base border-b border-amber-200 dark:border-amber-900/50 pb-2">2. Contoh Kasus & Cara Sistem Menghitung :</p>
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-md border border-amber-200/50 dark:border-amber-800/50 space-y-3 text-xs md:text-sm mt-2">
                  <p>Misalnya, Anda membeli <strong>1 Karung Gula Pasir (isi 50kg)</strong> seharga <strong>Rp 800.000</strong>.</p>
                  <p>Karena resep pembuatan roti Anda ditakar menggunakan <em>gram</em>, pengisiannya adalah :</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Nama Satuan :</strong> Karung</li>
                    <li><strong>Jenis Satuan :</strong> gram</li>
                    <li><strong>Jumlah Satuan :</strong> 50.000 <em>(karena 50kg = 50.000 gram)</em></li>
                    <li><strong>Harga Total :</strong> 800.000</li>
                  </ul>
                  <div className="pt-3 border-t border-amber-200/50 dark:border-amber-800/50 mt-4">
                    <p className="font-semibold mb-2">Bagaimana perhitungan otomatisnya bekerja?</p>
                    <code className="block bg-amber-200/50 dark:bg-amber-900/50 px-3 py-2 rounded-md font-mono font-semibold text-sm mb-2 border border-amber-300/30 dark:border-amber-700/30">
                      Rp 800.000 ÷ 50.000 gram = Rp 16 / gram
                    </code>
                    <p>Sistem akan otomatis menghitung biaya bahan Anda secara presisi (contoh: saat input resep butuh 100 gram, biayanya = Rp 1.600).</p>
                  </div>
                </div>
              </div>
            </div>
          </BantuanSection>

          {/* PANDUAN KEMASAN */}
          <BantuanSection
            title="Panduan Kemasan (Packaging)"
            desc="Cara menghitung biaya kemasan pada produk."
            icon={Package}
            isOpen={openSection === "Panduan Kemasan"}
            onToggle={() => toggleSection("Panduan Kemasan")}
          >
            <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-sm border border-blue-200 dark:border-blue-900/50 space-y-5 text-sm text-blue-900 dark:text-blue-100 relative overflow-hidden">
              <Package className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />

              <div className="space-y-2 relative z-10">
                <p className="font-semibold text-base border-b border-blue-200 dark:border-blue-900/50 pb-2">1. Mengapa Kemasan Dipisah?</p>
                <p className="pt-1 text-xs md:text-sm">
                  Dalam menghitung Harga Pokok Produksi (HPP), biaya kemasan seperti kardus, stiker, atau plastik seringkali terlewat. <br></br>Aplikasi ini memisahkan perhitungan kemasan agar Anda bisa mengetahui secara pasti berapa persen biaya yang habis hanya untuk *packaging* (pembungkus).
                </p>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="font-semibold text-base border-b border-blue-200 dark:border-blue-900/50 pb-2">2. Cara Sistem Menghitung :</p>
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-md border border-blue-200/50 dark:border-blue-800/50 space-y-3 text-xs md:text-sm mt-2">
                  <p>Misalnya, Anda membeli <strong>1 Pak Dus Kue (isi 50 pcs)</strong> seharga <strong>Rp 75.000</strong>.</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Nama Barang :</strong> Dus Kue Brownies</li>
                    <li><strong>Jumlah Isi :</strong> 50 pcs</li>
                    <li><strong>Harga Beli Total :</strong> Rp 75.000</li>
                  </ul>
                  <div className="pt-3 border-t border-blue-200/50 dark:border-blue-800/50 mt-4">
                    <p className="font-semibold mb-2">Perhitungan otomatis :</p>
                    <code className="block bg-blue-200/50 dark:bg-blue-900/50 px-3 py-2 rounded-md font-mono font-semibold text-sm mb-2 border border-blue-300/30 dark:border-blue-700/30">
                      Rp 75.000 ÷ 50 pcs = Rp 1.500 / pcs
                    </code>
                    <p>Nantinya, setiap kali Anda membuat resep Brownies dan memasukkan 1 buah Dus Kue, sistem akan langsung menyuntikkan tambahan modal sebesar Rp 1.500 ke total HPP produk Anda.</p>
                  </div>
                </div>
              </div>
            </div>
          </BantuanSection>

          {/* PANDUAN BIAYA TAMBAHAN */}
          <BantuanSection
            title="Panduan Biaya Tambahan (Operasional)"
            desc="Cara menghitung listrik, gas, dan tenaga kerja."
            icon={Receipt}
            isOpen={openSection === "Panduan Biaya Tambahan"}
            onToggle={() => toggleSection("Panduan Biaya Tambahan")}
          >
            <div className="bg-rose-50 dark:bg-rose-950/30 p-5 rounded-sm border border-rose-200 dark:border-rose-900/50 space-y-5 text-sm text-rose-900 dark:text-rose-100 relative overflow-hidden">
              <Receipt className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />

              <div className="space-y-2 relative z-10">
                <p className="font-semibold text-base border-b border-rose-200 dark:border-rose-900/50 pb-2">1. Apa itu Biaya Tambahan?</p>
                <p className="pt-1 text-xs md:text-sm">
                  Biaya tambahan adalah biaya di luar bahan baku dan kemasan yang dikeluarkan selama proses produksi.
                  <br></br>Ini sangat penting agar Anda tidak mengalami <strong>"Rugi Siluman"</strong> (merasa untung dari selisih harga bahan, tapi ternyata uangnya habis untuk bayar Listrik, Gas, atau Gaji Karyawan).
                </p>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="font-semibold text-base border-b border-rose-200 dark:border-rose-900/50 pb-2">2. Cara Menghitung & Membaginya :</p>
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-md border border-rose-200/50 dark:border-rose-800/50 space-y-3 text-xs md:text-sm mt-2">
                  <p>Karena tagihan operasional biasanya bersifat bulanan/harian, Anda perlu membaginya ke dalam estimasi <strong>target porsi produksi</strong>.</p>
                  <p><strong>Contoh Kasus Tenaga Kerja :</strong></p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Gaji Karyawan per Hari : <strong>Rp 100.000</strong></li>
                    <li>Target Produksi per Hari : <strong>100 Porsi Roti</strong></li>
                  </ul>
                  <div className="pt-3 border-t border-rose-200/50 dark:border-rose-800/50 mt-4">
                    <p className="font-semibold mb-2">Beban Biaya per Produk :</p>
                    <code className="block bg-rose-200/50 dark:bg-rose-900/50 px-3 py-2 rounded-md font-mono font-semibold text-sm mb-2 border border-rose-300/30 dark:border-rose-700/30">
                      Rp 100.000 ÷ 100 porsi = Rp 1.000 / porsi
                    </code>
                    <p>Artinya, pada menu <strong>Biaya Tambahan</strong>, Anda bisa mendaftarkan item "Tenaga Kerja" senilai Rp 1.000. Lakukan perhitungan serupa untuk Gas (misal Rp 200/porsi) atau Listrik.</p>
                  </div>
                </div>
              </div>
            </div>
          </BantuanSection>

          {/* PANDUAN MASTER PRODUK */}
          <BantuanSection
            title="Panduan Master Produk (Produk Jadi)"
            desc="Cara meracik HPP dan menentukan harga jual."
            icon={Box}
            isOpen={openSection === "Panduan Master Produk"}
            onToggle={() => toggleSection("Panduan Master Produk")}
          >
            <div className="bg-violet-50 dark:bg-violet-950/30 p-5 rounded-sm border border-violet-200 dark:border-violet-900/50 space-y-5 text-sm text-violet-900 dark:text-violet-100 relative overflow-hidden">
              <Box className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />

              <div className="space-y-2 relative z-10">
                <p className="font-semibold text-base border-b border-violet-200 dark:border-violet-900/50 pb-2">1. Apa itu Master Produk?</p>
                <p className="pt-1 text-xs md:text-sm">
                  Master Produk adalah tempat di mana Anda "meracik" semua komponen biaya menjadi satu buah <strong>Produk Jadi</strong> yang siap dijual. <br></br>Di sini, sistem akan mengakumulasikan biaya Bahan Baku, Kemasan, hingga Biaya Operasional untuk menghasilkan total <strong>HPP (Harga Pokok Produksi)</strong>.
                </p>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="font-semibold text-base border-b border-violet-200 dark:border-violet-900/50 pb-2">2. Urutan / Alur Pengisian :</p>
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-md border border-violet-200/50 dark:border-violet-800/50 space-y-3 text-xs md:text-sm mt-2">
                  <ul className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Tentukan Bahan Baku :</strong> Pilih bahan-bahan yang sudah Anda daftarkan di menu Bahan Baku. Masukkan takaran yang dibutuhkan untuk membuat 1 porsi produk jadi (Misal: Tepung 500g, Telur 2 butir).
                    </li>
                    <li>
                      <strong>Tentukan Kemasan :</strong> Pilih kemasan yang akan digunakan (Misal: 1 Dus Kue, 1 Plastik Sablon).
                    </li>
                    <li>
                      <strong>Biaya Tambahan (Opsional) :</strong> Masukkan estimasi biaya lain seperti Tenaga Kerja, Listrik, Gas, atau Transportasi yang dibebankan ke dalam 1 produk.
                    </li>
                    <li>
                      <strong>Tentukan Harga Jual :</strong> Sistem telah menjumlahkan seluruh total HPP di atas. Anda tinggal mengetikkan <strong>Harga Jual</strong> yang Anda inginkan.
                    </li>
                  </ul>
                  <div className="pt-3 border-t border-violet-200/50 dark:border-violet-800/50 mt-4">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Kalkulasi Keuntungan (Profit)
                    </p>
                    <p>Setelah Anda memasukkan Harga Jual, sistem secara ajaib akan langsung menghitung <strong>Keuntungan Bersih (Rp)</strong> dan menampilkan persentase <strong>Margin Profit (%)</strong> Anda. Sangat praktis!</p>
                  </div>
                </div>
              </div>
            </div>
          </BantuanSection>

          {/* PANDUAN PRODUKSI */}
          <BantuanSection
            title="Panduan Produksi Massal"
            desc="Cara melihat rekap kebutuhan bahan untuk produksi."
            icon={ClipboardList}
            isOpen={openSection === "Panduan Produksi"}
            onToggle={() => toggleSection("Panduan Produksi")}
          >
            <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-sm border border-orange-200 dark:border-orange-900/50 space-y-5 text-sm text-orange-900 dark:text-orange-100 relative overflow-hidden">
              <ClipboardList className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />

              <div className="space-y-2 relative z-10">
                <p className="font-semibold text-base border-b border-orange-200 dark:border-orange-900/50 pb-2">1. Fungsi Fitur Produksi</p>
                <p className="pt-1 text-xs md:text-sm">
                  Setelah Anda membuat resep di Master Produk untuk 1 porsi, fitur <strong>Produksi</strong> membantu Anda mengkalkulasi kebutuhan saat Anda ingin memasak/membuat barang dalam <strong>jumlah besar (massal)</strong> pada hari tersebut.
                </p>
              </div>

              <div className="space-y-3 relative z-10">
                <p className="font-semibold text-base border-b border-orange-200 dark:border-orange-900/50 pb-2">2. Cara Kerja Sistem :</p>
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-md border border-orange-200/50 dark:border-orange-800/50 space-y-3 text-xs md:text-sm mt-2">
                  <p>Anda hanya perlu memilih <strong>Nama Master Produk</strong> yang ingin diproduksi, lalu ketikkan <strong>Jumlah Porsi/Target</strong> (Misalnya: 150 porsi).</p>

                  <div className="pt-2 border-t border-orange-200/50 dark:border-orange-800/50 mt-3">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Otomatisasi Daftar Belanja
                    </p>
                    <p className="mb-2">Sistem akan secara instan mengalikan seluruh takaran resep Anda dengan 150, sehingga menghasilkan:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Daftar Belanja Tepat:</strong> (Misal: Butuh 15 Kg Tepung, 300 Butir Telur, 150 Dus Kemasan).</li>
                      <li><strong>Total Modal Hari Ini:</strong> Estimasi total uang yang harus Anda siapkan untuk produksi hari ini.</li>
                    </ul>
                    <p className="mt-2 text-orange-800 dark:text-orange-200 italic text-xs">
                      *Fitur ini mencegah Anda belanja bahan baku berlebihan (boros) atau kurang (menghambat produksi).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BantuanSection>

          <BantuanSection
            title="Hubungi Dukungan Pelanggan"
            desc="Lapor kendala atau konsultasi aplikasi."
            icon={Phone}
            isOpen={openSection === "Hubungi Dukungan"}
            onToggle={() => toggleSection("Hubungi Dukungan")}
          >
            <div className="flex flex-col items-center justify-center text-center p-5 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-sm border border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 sm:mb-2">Butuh Bantuan Langsung?</h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-4 sm:mb-6 max-w-sm px-2 sm:px-0">
                Jangan ragu untuk menghubungi Kami jika Anda mengalami kendala teknis atau memiliki pertanyaan seputar cara penggunaan aplikasi ini.
              </p>
              <Button onClick={() => window.open('https://wa.me/6283867180887', '_blank')} className="rounded-full px-6 sm:px-8 h-9 sm:h-10 text-xs sm:text-sm shadow-md">
                Hubungi via WhatsApp
              </Button>
            </div>
          </BantuanSection>

        </div>
      </div>
    </AppLayout>
  );
}
