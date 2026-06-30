"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

import { registerUserByAdmin } from "./action";

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [nrp, setNrp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      setLoading(false);
      return;
    }

    const result = await registerUserByAdmin(nama, nrp, password);

    if (!result.success) {
      setError(result.error || "Gagal mendaftar. Pastikan NRP belum pernah digunakan.");
      setLoading(false);
      return;
    }

    const dummyEmail = `${nrp}@akpol.id`;
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password,
    });

    if (loginError) {
      setError("Berhasil daftar, tapi gagal otomatis login. Silakan login manual.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden w-full max-w-md mx-auto">
      {/* Aksen atas */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#800000]" />

      <div className="flex flex-col items-center mb-6 text-center mt-2">
        {/* Logo Akpol */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/akpol.png" alt="Logo Akpol" className="h-20 sm:h-24 w-auto mb-4 drop-shadow-md" />
        
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          REGISTRASI PELAPOR
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Daftarkan identitas Taruna / Staf untuk mendapat akses Dumas
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 text-center border border-red-100 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none font-medium bg-slate-50 focus:bg-white"
            placeholder="Sesuai identitas asli..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            NRP <span className="text-slate-400 font-normal">(Nomor Registrasi Pokok)</span>
          </label>
          <input
            type="text"
            required
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none font-medium bg-slate-50 focus:bg-white"
            placeholder="Masukkan NRP Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#800000] focus:border-[#800000] transition-colors outline-none font-medium bg-slate-50 focus:bg-white"
            placeholder="Minimal 6 karakter"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#800000] hover:bg-[#600000] text-white font-black py-3.5 rounded-lg transition-all flex items-center justify-center mt-6 disabled:opacity-70 border-2 border-[#800000] shadow-[0_0_15px_rgba(128,0,0,0.3)] tracking-wide uppercase"
        >
          {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              DAFTARKAN AKUN
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
        Sudah memiliki akses?{" "}
        <Link
          href="/login"
          className="text-[#800000] hover:text-red-700 font-black tracking-wide"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
