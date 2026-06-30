import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { STATUS_CONFIG } from "@/lib/utils/statusHelper"

// Hindari caching agar data admin selalu segar
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Ambil semua tiket beserta data nama pelapor melalui Foreign Key (JOIN tabel)
  const { data: tikets, error } = await supabase
    .from('tiket')
    .select(`
      *,
      pelapor:profiles!tiket_pelapor_id_fkey(nama, nrp)
    `)
    .order('created_at', { ascending: false })

  // Hitung metrik statistik
  const stats = {
    masuk: tikets?.filter(t => t.status === 'masuk').length || 0,
    diproses: tikets?.filter(t => t.status === 'diproses' || t.status === 'diverifikasi' || t.status === 'ditangani').length || 0,
    selesai: tikets?.filter(t => t.status === 'selesai').length || 0,
    ditolak: tikets?.filter(t => t.status === 'ditolak').length || 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Overview Pusat</h1>
      
      {/* Bagian Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
          <p className="text-slate-500 text-sm font-medium">Tiket Baru Masuk</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{stats.masuk}</h2>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-slate-500 text-sm font-medium">Dalam Pengerjaan</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{stats.diproses}</h2>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-teal-500">
          <p className="text-slate-500 text-sm font-medium">Telah Selesai</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{stats.selesai}</h2>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-slate-500 text-sm font-medium">Ditolak</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{stats.ditolak}</h2>
        </div>
      </div>

      {/* Bagian Tabel Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">Daftar Seluruh Laporan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nomor & Tanggal</th>
                <th className="px-6 py-4 font-semibold">Pelapor</th>
                <th className="px-6 py-4 font-semibold">Detail Keluhan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tikets?.map((tiket: any) => {
                 const cfg = STATUS_CONFIG[tiket.status] || { label: tiket.status, color: 'gray' };
                 return (
                  <tr key={tiket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-700">{tiket.nomor}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(tiket.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{tiket.pelapor?.nama || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 mt-1">{tiket.pelapor?.nrp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium truncate max-w-[280px]" title={tiket.judul}>{tiket.judul}</div>
                      <div className="text-xs text-slate-500 mt-1 capitalize">
                        {tiket.kategori.replace('_', ' ')} • {tiket.lokasi}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        cfg.color === 'gray' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        cfg.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        cfg.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        cfg.color === 'green' ? 'bg-green-50 text-green-600 border border-green-200' :
                        cfg.color === 'teal' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/tiket/${tiket.id}`} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
                      >
                        Buka Tiket →
                      </Link>
                    </td>
                  </tr>
                 )
              })}
              
              {tikets?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada laporan keluhan yang masuk ke dalam sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
