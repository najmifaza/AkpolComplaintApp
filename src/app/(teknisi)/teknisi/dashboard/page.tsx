import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { STATUS_CONFIG } from "@/lib/utils/statusHelper"

export const dynamic = 'force-dynamic'

export default async function TeknisiDashboard() {
  const supabase = await createClient()

  // Teknisi hanya butuh melihat tiket yang sudah siap dieksekusi (diproses) atau sedang (ditangani)
  const { data: tikets } = await supabase
    .from('tiket')
    .select(`
      *,
      pelapor:profiles!tiket_pelapor_id_fkey(nama, nrp)
    `)
    .in('status', ['diproses', 'ditangani', 'selesai'])
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tugas Perbaikan (Work Orders)</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-amber-50/50">
          <h2 className="font-bold text-slate-800">Daftar Pekerjaan Lapangan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nomor & Tanggal</th>
                <th className="px-6 py-4 font-semibold">Lokasi & Kategori</th>
                <th className="px-6 py-4 font-semibold">Detail Keluhan</th>
                <th className="px-6 py-4 font-semibold">Status Pekerjaan</th>
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
                        {new Date(tiket.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{tiket.lokasi}</div>
                      <div className="text-xs text-slate-500 mt-1 capitalize">{tiket.kategori.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium truncate max-w-[250px]" title={tiket.judul}>{tiket.judul}</div>
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
                        href={`/teknisi/tiket/${tiket.id}`} 
                        className="inline-flex items-center text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
                      >
                        Buka Tugas →
                      </Link>
                    </td>
                  </tr>
                 )
              })}
              
              {(!tikets || tikets.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada tugas perbaikan yang diteruskan ke Anda saat ini.
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
