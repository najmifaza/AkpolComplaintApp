"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationProvider({ userId, role }: { userId: string; role: string }) {
  const supabase = createClient();
  // Untuk memastikan kita tidak meminta izin berulang kali dalam 1 sesi
  const requestedRef = useRef(false);

  useEffect(() => {
    // 1. Minta Izin Notifikasi ke Browser
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default" && !requestedRef.current) {
        requestedRef.current = true;
        Notification.requestPermission();
      }
    }

    if (!userId || !role) return;

    // 2. Berlangganan (Subscribe) ke perubahan database secara Real-Time
    let channel = supabase.channel(`notif_${role}_${userId}`);

    if (role === "pelapor") {
      // Pelapor: Pantau jika tiket miliknya di-update statusnya
      channel = channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tiket", filter: `pelapor_id=eq.${userId}` },
        (payload) => {
          const tiket = payload.new;
          if (Notification.permission === "granted") {
            new Notification("Status Laporan Diperbarui!", {
              body: `Aduan ${tiket.nomor} Anda kini berstatus: ${tiket.status.toUpperCase()}. Cek di aplikasi.`,
              icon: "/favicon.ico"
            });
          }
        }
      );
    } else if (role === "admin") {
      // Admin: Pantau jika ada tiket baru (INSERT) masuk ke sistem
      channel = channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tiket" },
        (payload) => {
          const tiket = payload.new;
          if (Notification.permission === "granted") {
            new Notification("🔔 Laporan Baru Masuk!", {
              body: `Tiket ${tiket.nomor} baru saja dibuat. Segera verifikasi.`,
              icon: "/favicon.ico"
            });
          }
        }
      );
    } else if (role === "teknisi") {
      // Teknisi: Pantau jika ada tiket yang diubah statusnya menjadi "diproses" (oleh admin)
      channel = channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tiket", filter: "status=eq.diproses" },
        (payload) => {
          const tiket = payload.new;
          if (Notification.permission === "granted") {
            new Notification("🛠️ Tugas Baru Diteruskan", {
              body: `Tiket ${tiket.nomor} telah diteruskan ke lapangan. Siap dieksekusi!`,
              icon: "/favicon.ico"
            });
          }
        }
      );
    }

    // Aktifkan channel
    channel.subscribe();

    return () => {
      // Bersihkan koneksi saat komponen dilepas
      supabase.removeChannel(channel);
    };
  }, [userId, role, supabase]);

  return null; // Komponen ini bekerja di latar belakang (invisible)
}
