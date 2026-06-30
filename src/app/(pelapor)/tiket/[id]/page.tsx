"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, MapPin, Calendar, Hash, Image as ImageIcon, Star } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/Timeline";
import { STATUS_CONFIG } from "@/lib/utils/statusHelper";

export default function DetailTiket({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [tiket, setTiket] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State form rating
  const [bintang, setBintang] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("tiket_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tiket", filter: `id=eq.${id}` },
        (payload) => {
          setTiket(payload.new);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "status_log", filter: `tiket_id=eq.${id}` },
        (payload) => {
          setLogs((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchData = async () => {
    // 1. Ambil detail tiket
    const { data: t } = await supabase.from("tiket").select("*").eq("id", id).single();
    if (!t) {
      router.push("/dashboard");
      return;
    }
    setTiket(t);

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

    // 4. Cek apakah tiket ini sudah pernah diberi rating
    const { data: r } = await supabase.from("rating").select("*").eq("tiket_id", id).maybeSingle();
    if (r) setRatingData(r);

    setLoading(false);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bintang === 0) {
      alert("Silakan berikan bintang (1-5) terlebih dahulu.");
      return;
    }
    
    setSubmittingRating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("rating").insert({
        tiket_id: id,
        pelapor_id: user?.id,
        bintang: bintang,
        komentar: komentar.trim() || null,
      });

      if (error) throw error;
      
      alert("Terima kasih atas penilaian Anda!");
      await fetchData(); // Refresh data untuk memunculkan hasil rating
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengirim penilaian: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingRating(false);
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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Detail Laporan</h1>
          <p className="text-slate-500 text-sm mt-1">Lacak progres perbaikan infrastruktur Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-slate-800">{tiket.judul}</h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-700' :
                statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                statusConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                statusConfig.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                'bg-red-100 text-red-700'
              }`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center text-slate-600">
                <Hash className="w-4 h-4 mr-2 text-slate-400" />
                <span className="font-mono font-medium">{tiket.nomor}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                <span>{new Date(tiket.created_at).toLocaleDateString("id-ID")}</span>
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
              Lampiran Foto
            </h3>
            
            {fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full z-10 font-medium">
                      {foto.jenis === "bukti" ? "Bukti Awal" : foto.jenis === "progres" ? "Progres" : "Sesudah"}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={foto.url} 
                      alt="Foto Lampiran" 
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Tidak ada foto yang dilampirkan.</p>
            )}
          </div>

          {/* ----- SECTION RATING (Hanya Muncul Jika Status Selesai) ----- */}
          {tiket.status === 'selesai' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-sm shadow-amber-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <h3 className="font-bold text-slate-800 mb-4">Penilaian Hasil Perbaikan</h3>
              
              {ratingData ? (
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < ratingData.bintang ? "fill-amber-400" : "text-slate-300"}`} />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm italic">"{ratingData.komentar || "Pelapor tidak meninggalkan komentar."}"</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Seberapa puas Anda dengan hasil perbaikan ini?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBintang(num)}
                          className={`transition-transform hover:scale-110 focus:outline-none ${bintang >= num ? "text-amber-400" : "text-slate-300 hover:text-amber-200"}`}
                        >
                          <Star className={`w-10 h-10 ${bintang >= num ? "fill-amber-400" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ulasan / Masukan (Opsional)</label>
                    <textarea 
                      rows={3} 
                      value={komentar}
                      onChange={(e) => setKomentar(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm outline-none resize-none"
                      placeholder="Tuliskan kepuasan atau keluhan Anda mengenai hasil perbaikan..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingRating || bintang === 0}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {submittingRating ? "Mengirim..." : "Kirim Penilaian"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Riwayat Status</h3>
            <Timeline logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
