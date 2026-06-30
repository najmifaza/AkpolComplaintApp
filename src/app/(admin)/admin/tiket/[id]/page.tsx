"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, MapPin, Calendar, Hash, Image as ImageIcon, Send, Star } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/Timeline";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/utils/statusHelper";

export default function AdminDetailTiket({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [tiket, setTiket] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk form update status
  const [statusBaru, setStatusBaru] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // 1. Ambil detail tiket + nama pelapor
    const { data: t } = await supabase
      .from("tiket")
      .select(`
        *,
        pelapor:profiles!tiket_pelapor_id_fkey(nama, nrp, unit)
      `)
      .eq("id", id)
      .single();
      
    if (!t) {
      router.push("/admin/dashboard");
      return;
    }
    setTiket(t);
    setStatusBaru(t.status); // Default pilihan adalah status saat ini

    // 2. Ambil riwayat log status
    const { data: l } = await supabase
      .from("status_log")
      .select("*")
      .eq("tiket_id", id)
      .order("created_at", { ascending: false });
    if (l) setLogs(l);

    // 3. Ambil data foto
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

    // 4. Ambil data rating (jika ada)
    const { data: r } = await supabase.from("rating").select("*").eq("tiket_id", id).maybeSingle();
    if (r) setRatingData(r);

    setLoading(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (statusBaru === tiket.status) {
      alert("Pilih status yang berbeda untuk diperbarui.");
      return;
    }
    
    if (statusBaru === "ditolak" && !catatan.trim()) {
      alert("Harap berikan catatan alasan mengapa laporan ini ditolak.");
      return;
    }

    setIsUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Catat ke status_log
      await supabase.from("status_log").insert({
        tiket_id: id,
        status_lama: tiket.status,
        status_baru: statusBaru,
        catatan: catatan.trim() || null,
        oleh_id: user?.id,
      });

      // 2. Update status di tiket utama
      await supabase
        .from("tiket")
        .update({ status: statusBaru })
        .eq("id", id);

      // Refresh data lokal
      await fetchData();
      setCatatan(""); // Bersihkan input
      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tiket.status] || { label: tiket.status, color: "gray" };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 mr-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Laporan</h1>
          <p className="text-slate-500 text-sm mt-1">Verifikasi, proses, atau tolak keluhan dari pelapor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Utama: Detail & Foto */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{tiket.judul}</h2>
                <p className="text-sm text-slate-500 mt-1 capitalize">Pelapor: <strong className="text-slate-700">{tiket.pelapor?.nama}</strong> ({tiket.pelapor?.nrp})</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                statusConfig.color === 'gray' ? 'bg-slate-100 text-slate-700' :
                statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                statusConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                statusConfig.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                'bg-red-100 text-red-700'
              }`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-600">
                <Hash className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-mono font-medium">{tiket.nomor}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <span>{new Date(tiket.created_at).toLocaleDateString("id-ID", {day:'numeric', month:'long', year:'numeric'})}</span>
              </div>
              <div className="flex items-center text-slate-600 col-span-2">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                <span>{tiket.lokasi}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Deskripsi Lengkap</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {tiket.deskripsi || "Tidak ada deskripsi tambahan."}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-slate-400" />
              Bukti Lampiran
            </h3>
            
            {fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 font-medium">
                      {foto.jenis === "bukti" ? "Bukti" : foto.jenis}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto.url} alt="Foto" className="w-full h-32 object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Tidak ada foto yang dilampirkan pelapor.</p>
            )}
          </div>

          {/* Menampilkan Rating Jika Ada */}
          {ratingData && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-sm shadow-amber-50 relative overflow-hidden mt-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                Penilaian Kepuasan Pelapor
              </h3>
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < ratingData.bintang ? "fill-amber-400" : "text-slate-300"}`} />
                  ))}
                </div>
                <p className="text-slate-700 text-sm italic">"{ratingData.komentar || "Pelapor tidak meninggalkan komentar."}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aksi Admin & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Panel Update Status */}
          <form onSubmit={handleUpdateStatus} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm shadow-blue-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">Ubah Status Laporan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status Baru</label>
                <select
                  value={statusBaru}
                  onChange={(e) => setStatusBaru(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none font-medium text-slate-700 bg-white"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Catatan {statusBaru === "ditolak" && <span className="text-red-500">*wajib</span>}
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Ketik catatan untuk pelapor/teknisi..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating || statusBaru === tiket.status}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Eksekusi Perubahan
              </button>
            </div>
          </form>

          {/* Panel Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Riwayat Status</h3>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <Timeline logs={logs} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
