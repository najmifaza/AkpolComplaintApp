"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export default function NotificationProvider({ userId, role }: { userId: string; role: string }) {
  const supabase = createClient();
  const [toast, setToast] = useState<{ title: string; message: string; id: number } | null>(null);

  useEffect(() => {
    // 1. Minta izin Notifikasi Sistem (OS) sebagai tambahan
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    if (!userId || !role) return;

    let channel = supabase.channel(`notif_channel_${userId}`);

    const showNotification = (title: string, message: string) => {
      // Tampilkan In-App Toast
      setToast({ title, message, id: Date.now() });

      // Hilangkan toast setelah 5 detik
      setTimeout(() => {
        setToast(null);
      }, 5000);

      // Tampilkan juga OS Notification jika diizinkan
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message, icon: "/akpol.png" });
      }
    };

    if (role === "pelapor") {
      channel = channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tiket", filter: `pelapor_id=eq.${userId}` },
        (payload) => {
          console.log("REALTIME PELAPOR:", payload);
          showNotification(
            "Status Laporan Diperbarui!",
            `Aduan ${payload.new.nomor} Anda kini berstatus: ${payload.new.status.toUpperCase()}.`
          );
        }
      );
    } else if (role === "admin") {
      channel = channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tiket" },
        (payload) => {
          console.log("REALTIME ADMIN:", payload);
          showNotification(
            "Laporan Baru Masuk!",
            `Tiket ${payload.new.nomor} baru saja dibuat. Segera verifikasi.`
          );
        }
      );
    } else if (role === "teknisi") {
      channel = channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tiket", filter: "status=eq.diproses" },
        (payload) => {
          console.log("REALTIME TEKNISI:", payload);
          showNotification(
            "Tugas Baru Diteruskan",
            `Tiket ${payload.new.nomor} telah diteruskan ke lapangan.`
          );
        }
      );
    }

    channel.subscribe((status) => {
      console.log(`Supabase Realtime Status (${role}):`, status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, supabase]);

  if (!toast) return null;

  // In-App Toast UI (Pasti Muncul)
  return (
    <div className="fixed top-6 right-6 z-[9999] bg-white border-l-4 border-amber-500 shadow-2xl rounded-r-lg rounded-l-sm p-4 w-80 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm">{toast.title}</h3>
          <p className="text-slate-600 text-xs mt-1">{toast.message}</p>
        </div>
        <button 
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
