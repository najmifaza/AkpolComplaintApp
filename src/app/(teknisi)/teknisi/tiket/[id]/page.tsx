"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, MapPin, Calendar, Hash, Image as ImageIcon, Send, Upload } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/Timeline";
import { STATUS_CONFIG } from "@/lib/utils/statusHelper";

export default function TeknisiDetailTiket({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [tiket, setTiket] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State form Teknisi
  const [statusBaru, setStatusBaru] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [fotoSesudah, setFotoSesudah] = useState<File | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: t } = await supabase
      .from("tiket")
      .select(`
        *,
        pelapor:profiles!tiket_pelapor_id_fkey(nama, nrp, unit)
      `)
      .eq("id", id)
      .single();
      
    if (!t) {
      router.push("/teknisi/dashboard");
      return;
    }
    setTiket(t);
    setStatusBaru(t.status);

    const { data: l } = await supabase
      .from("status_log")
      .select("*")
      .eq("tiket_id", id)
      .order("created_at", { ascending: false });
    if (l) setLogs(l);

    const { data: f } = await supabase.from("foto_tiket").select("*").eq("tiket_id", id);
    if (f) {
      const fotoWithUrls = await Promise.all(
        f.map(async (foto: any) => {
          const { data } = await supabase.storage.from("foto-tiket").createSignedUrl(foto.storage_path, 3600);
          return { ...foto, url: data?.signedUrl };
        })
      );
      setFotos(fotoWithUrls);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (statusBaru === tiket.status) {
      alert("Pilih status yang berbeda untuk diperbarui.");
      return;
    }

    if (statusBaru === "selesai" && !fotoSesudah) {
      alert("Wajib melampirkan Foto Sesudah / Bukti Perbaikan jika status diubah menjadi Selesai.");
      return;
    }

    setIsUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Upload Foto Sesudah jika ada
      if (statusBaru === "selesai" && fotoSesudah && user) {
        const ext = fotoSesudah.name.split('.').pop();
        const fileName = `${Date.now()}-sesudah.${ext}`;
        const storagePath = `tiket/${id}/sesudah/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("foto-tiket")
          .upload(storagePath, fotoSesudah);

        if (uploadErr) throw uploadErr;

        await supabase.from("foto_tiket").insert({
          tiket_id: id,
          jenis: "sesudah",
          storage_path: storagePath,
          diunggah_oleh: user.id,
        });
      }

      // 2. Catat log
      await supabase.from("status_log").insert({
        tiket_id: id,
        status_lama: tiket.status,
        status_baru: statusBaru,
        catatan: catatan.trim() || null,
        oleh_id: user?.id,
      });

      // 3. Update tiket
      await supabase
        .from("tiket")
        .update({ status: statusBaru })
        .eq("id", id);

      await fetchData();
      setCatatan("");
      setFotoSesudah(null);
      alert("Status pekerjaan berhasil diperbarui!");
      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem saat memperbarui tugas.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tiket.status] || { label: tiket.status, color: "gray" };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <Link href="/teknisi/dashboard" className="text-slate-400 hover:text-slate-600 mr-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Eksekusi Lapangan</h1>
          <p className="text-slate-500 text-sm mt-1">Lakukan perbaikan dan unggah foto hasil akhir.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{tiket.judul}</h2>
                <p className="text-sm text-slate-500 mt-1 capitalize">Pelapor: <strong className="text-slate-700">{tiket.pelapor?.nama}</strong></p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                statusConfig.color === 'gray' ? 'bg-slate-100 text-slate-700' :
                statusConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                statusConfig.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-600">
                <Hash className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-mono font-medium">{tiket.nomor}</span>
              </div>
              <div className="flex items-center text-slate-600 col-span-2">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-semibold text-slate-800">{tiket.lokasi}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Deskripsi Kerusakan</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {tiket.deskripsi || "-"}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-slate-400" />
              Foto Lampiran
            </h3>
            
            {fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 font-medium">
                      {foto.jenis === "bukti" ? "Sebelum" : foto.jenis === "sesudah" ? "Sesudah" : "Progres"}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.url} alt="Foto" className="w-full h-32 object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Tidak ada foto.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleUpdateStatus} className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm shadow-amber-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Laporan Progres</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Update Status</label>
                <select
                  value={statusBaru}
                  onChange={(e) => setStatusBaru(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm outline-none font-medium text-slate-700 bg-white"
                >
                  <option value={tiket.status} disabled>{STATUS_CONFIG[tiket.status]?.label}</option>
                  <option value="ditangani">Sedang Ditangani (Proses Kerja)</option>
                  <option value="selesai">Telah Selesai 100%</option>
                </select>
              </div>
              
              {statusBaru === "selesai" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Upload Foto Sesudah <span className="text-red-500">*wajib</span>
                  </label>
                  <div className="mt-1 flex justify-center px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors relative">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="mt-2 text-xs text-slate-600">
                        {fotoSesudah ? fotoSesudah.name : "Klik untuk upload foto"}
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoSesudah(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Catatan Teknisi
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Deskripsikan perbaikan yang dilakukan..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating || statusBaru === tiket.status}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Simpan Progres
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
