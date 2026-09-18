import { ref, get, set, child } from "firebase/database";
import { database } from "./firebase";

// Fungsi untuk membuat voucher baru dan menyimpannya ke Firebase
export async function generateFirebaseVoucher(): Promise<string> {
  // Buat kode 8 digit acak murni (lebih aman daripada algoritma offline)
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  // Simpan ke Firebase Realtime Database
  const dbRef = ref(database, 'vouchers/' + code);
  await set(dbRef, {
    isUsed: false,
    createdAt: Date.now()
  });
  
  return code;
}

// Fungsi untuk memvalidasi voucher dan menghanguskannya setelah dipakai
export async function validateFirebaseVoucher(code: string): Promise<boolean> {
  const cleanCode = code.replace(/[^0-9]/g, '');
  if (cleanCode.length !== 8) return false;

  const dbRef = ref(database);
  
  try {
    const snapshot = await get(child(dbRef, `vouchers/${cleanCode}`));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Jika kode belum dipakai, maka valid
      if (data.isUsed === false) {
        // Tandai kode sebagai terpakai (hangus)
        await set(ref(database, `vouchers/${cleanCode}`), {
          ...data,
          isUsed: true,
          usedAt: Date.now()
        });
        
        return true; // Validasi berhasil
      }
    }
  } catch (error) {
    console.error("Gagal menghubungi server validasi:", error);
    // Jika tidak ada internet, kembalikan false
  }
  
  return false;
}
