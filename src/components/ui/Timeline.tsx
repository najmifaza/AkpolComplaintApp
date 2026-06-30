import React from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  masuk: { label: "Masuk", color: "gray" },
  diverifikasi: { label: "Diverifikasi", color: "blue" },
  diproses: { label: "Diproses", color: "amber" },
  ditangani: { label: "Ditangani", color: "green" },
  selesai: { label: "Selesai", color: "teal" },
  ditolak: { label: "Ditolak", color: "red" },
};

export function Timeline({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-slate-500">Belum ada riwayat status.</p>;
  }

  return (
    <ol className="relative border-l-2 border-slate-200 ml-3 mt-4">
      {logs.map((log) => {
        const cfg = STATUS_CONFIG[log.status_baru] || { label: log.status_baru, color: "gray" };
        
        // Menentukan warna titik berdasarkan status
        const dotColor = 
          cfg.color === "gray" ? "bg-slate-400" :
          cfg.color === "blue" ? "bg-blue-500" :
          cfg.color === "amber" ? "bg-amber-500" :
          cfg.color === "green" ? "bg-green-500" :
          cfg.color === "teal" ? "bg-teal-500" :
          "bg-red-500";

        return (
          <li key={log.id} className="mb-8 ml-6">
            <div className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white ${dotColor} shadow-sm`} />
            <time className="text-xs font-medium text-slate-400 mb-1 block">
              {new Date(log.created_at).toLocaleString("id-ID", { 
                day: "numeric", month: "short", year: "numeric", 
                hour: "2-digit", minute: "2-digit" 
              })} WIB
            </time>
            <h4 className="font-bold text-slate-800 text-base">{cfg.label}</h4>
            {log.catatan && (
              <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {log.catatan}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
