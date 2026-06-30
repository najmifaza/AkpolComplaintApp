export function generateNomor(): string {
  // Format: AKPOL-YYYYMMDD-XXXX (menggunakan karakter acak agar kebal terhadap RLS duplikat)
  const today = new Date();
  // Menyesuaikan waktu menjadi zona waktu lokal (WIB UTC+7) agar presisi
  const localTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));
  const tanggal = localTime.toISOString().slice(0, 10).replace(/-/g, "");
  
  // Hasilkan 4 karakter acak (angka & huruf besar)
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `AKPOL-${tanggal}-${randomStr}`;
}
