import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { STATUS_CONFIG } from "@/lib/utils/statusHelper"

// Memastikan Next.js mengambil data terbaru (tidak di-cache terlalu lama)
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  // Mengambil tiket milik pelapor (aman secara RLS)
  const { data: tikets, error } = await supabase
    .from('tiket')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Tiket Laporan Anda</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Pantau status laporan infrastruktur yang telah Anda ajukan.</p>
        </div>
        <Link href="/lapor" className="w-full sm:w-auto text-center bg-[#800000] hover:bg-[#600000] text-white px-5 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition shadow-sm border border-[#800000]">
          + Buat Laporan Baru
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Gagal mengambil data laporan: {error.message}</div>
      ) : tikets?.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4 text-lg">Anda belum pernah membuat laporan keluhan.</p>
          <Link href="/lapor" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">Buat laporan pertama Anda sekarang</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tikets?.map((tiket) => {
            const statusConfig = STATUS_CONFIG[tiket.status] || { label: tiket.status, color: 'gray' };
            
            return (
              <Link href={`/tiket/${tiket.id}`} key={tiket.id} className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-800 group-hover:text-red-800 transition">{tiket.judul}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
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
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{tiket.deskripsi}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-400">Nomor:</span>
                    <strong className="text-slate-700 font-mono">{tiket.nomor}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-400">Lokasi:</span>
                    <strong className="text-slate-700">{tiket.lokasi}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-400">Kategori:</span>
                    <strong className="text-slate-700 capitalize">{tiket.kategori.replace('_', ' ')}</strong>
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    {new Date(tiket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
