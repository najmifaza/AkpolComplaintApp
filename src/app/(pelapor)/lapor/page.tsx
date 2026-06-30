"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { FotoUpload } from "@/components/ui/FotoUpload";
import { generateNomor } from "@/lib/utils/generateNomor";
import Link from "next/link";

export default function LaporPage() {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori) {
      setError("Silakan pilih kategori.");
      return;
    }
    if (files.length === 0) {
      setError("Mohon lampirkan minimal 1 foto bukti kondisi saat ini.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Dapatkan user ID pelapor yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi login tidak valid. Silakan login ulang.");

      // 2. Generate Nomor Tiket Otomatis
      // Mencari total tiket hari ini untuk mendapatkan urutan ke-NNN
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error: countErr } = await supabase
        .from("tiket")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());
      
      if (countErr) throw countErr;
      const nomorTiket = generateNomor();

      // 3. Simpan data tiket ke database
      const { data: tiketBaru, error: insertErr } = await supabase
        .from("tiket")
        .insert({
          nomor: nomorTiket,
          pelapor_id: user.id,
          judul,
          deskripsi,
          lokasi,
          kategori,
          status: "masuk", // Status awal selalu "masuk"
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      const tiketId = tiketBaru.id;

      // 4. Catat riwayat status (Timeline) pertama kali
      await supabase.from("status_log").insert({
        tiket_id: tiketId,
        status_baru: "masuk",
        catatan: "Laporan keluhan baru berhasil diajukan oleh pelapor.",
        oleh_id: user.id,
      });

      // 5. Upload file foto-foto ke Supabase Storage
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const storagePath = `tiket/${tiketId}/bukti/${fileName}`;

        // Upload ke storage bucket "foto-tiket"
        const { error: uploadErr } = await supabase.storage
          .from("foto-tiket")
          .upload(storagePath, file);

        if (uploadErr) throw uploadErr;

        // Catat metadata fotonya di tabel foto_tiket
        await supabase.from("foto_tiket").insert({
          tiket_id: tiketId,
          jenis: "bukti",
          storage_path: storagePath,
          diunggah_oleh: user.id,
        });
      }

      // Jika semua sukses, kembali ke dashboard
      router.push("/dashboard");
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem saat mengirim laporan.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buat Laporan Baru</h1>
          <p className="text-slate-500 text-sm mt-1">Isi detail kerusakan atau masalah infrastruktur di bawah ini.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Judul Keluhan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
            placeholder="Contoh: Pipa air bocor di Asrama A"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Lokasi Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
              placeholder="Contoh: Asrama A, Lantai 2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none bg-white"
            >
              <option value="" disabled>-- Pilih Kategori --</option>
              <option value="sanitasi_air">Sanitasi & Air</option>
              <option value="kelistrikan">Kelistrikan</option>
              <option value="bangunan_struktur">Bangunan & Struktur</option>
              <option value="ac_ventilasi">AC & Ventilasi</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Deskripsi Detail
          </label>
          <textarea
            rows={4}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
            placeholder="Jelaskan secara spesifik masalah yang terjadi..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Foto Bukti <span className="text-red-500">*</span>
          </label>
          <FotoUpload files={files} setFiles={setFiles} maxFiles={3} />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Mengirim Laporan...
              </>
            ) : (
              "Kirim Laporan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
