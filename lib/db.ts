import Dexie, { type EntityTable } from 'dexie';

export interface BahanBaku {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  satuan: string;
  konversi: number | null;
  satuanDasar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BiayaTambahan {
  id: string;
  nama: string;
  kategori: string;
  sifatBiaya: string;
  tipeNilai: string;
  besaranNilai: number;
  tipePesanan: string;
  tipePembayaran: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Packaging {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  satuan: string;
  konversi: number | null;
  satuanDasar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Produk {
  id: string;
  nama: string;
  kategori: string;
  hargaJual: number;
  satuan?: string;
  foto: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProdukKomposisiBahan {
  id: string;
  produkId: string;
  bahanId: string;
  takaran: number;
  pembagi: number;
}

export interface ProdukKomposisiPackaging {
  id: string;
  produkId: string;
  packagingId: string;
  jumlah: number;
  pembagi: number;
}

export interface TransaksiProduksi {
  id: string;
  tanggal: Date;
  produkId: string;
  jumlah: number;
  totalHpp: number;
  totalBiayaTambahan: number;
  hppPerSatuan: number;
  catatan: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransaksiProduksiBiaya {
  id: string;
  transaksiId: string;
  namaBiaya: string;
  nominal: number;
}

const db = new Dexie('HppYesDB') as Dexie & {
  bahanBaku: EntityTable<BahanBaku, 'id'>;
  biayaTambahan: EntityTable<BiayaTambahan, 'id'>;
  packaging: EntityTable<Packaging, 'id'>;
  produk: EntityTable<Produk, 'id'>;
  produkKomposisiBahan: EntityTable<ProdukKomposisiBahan, 'id'>;
  produkKomposisiPackaging: EntityTable<ProdukKomposisiPackaging, 'id'>;
  transaksiProduksi: EntityTable<TransaksiProduksi, 'id'>;
  transaksiProduksiBiaya: EntityTable<TransaksiProduksiBiaya, 'id'>;
};

// Define Schema
db.version(1).stores({
  bahanBaku: 'id, nama, kategori, createdAt',
  biayaTambahan: 'id, nama, kategori, createdAt',
  packaging: 'id, nama, kategori, createdAt',
  produk: 'id, nama, kategori, createdAt',
  produkKomposisiBahan: 'id, produkId, bahanId',
  produkKomposisiPackaging: 'id, produkId, packagingId',
  transaksiProduksi: 'id, tanggal, produkId, createdAt',
  transaksiProduksiBiaya: 'id, transaksiId'
});

export { db };
