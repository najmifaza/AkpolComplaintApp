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

    // 1. Mendaftarkan user via jalur Admin (Server Action) agar bypass email
    const result = await registerUserByAdmin(nama, nrp, password);

    if (!result.success) {
      setError(result.error || "Gagal mendaftar");
      setLoading(false);
      return;
    }

    // 2. Jika sukses terdaftar, langsung login secara otomatis
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
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-green-50 p-3 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Buat akun untuk mulai membuat pelaporan
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
            placeholder="Contoh: Budi Santoso"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            NRP (Nomor Registrasi Pokok)
          </label>
          <input
            type="text"
            required
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
            placeholder="Masukkan NRP Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
            placeholder="Minimal 6 karakter"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-6 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Daftar Sekarang"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Login di sini
        </Link>
      </div>
    </div>
  );
}
