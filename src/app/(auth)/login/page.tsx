"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [nrp, setNrp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Supabase Auth butuh email, jadi kita buat email buatan (dummy) menggunakan NRP
    const dummyEmail = `${nrp}@akpol.id`;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password,
    });

    if (error) {
      setError("NRP atau Password salah.");
      setLoading(false);
    } else {
      // Cek role user dari tabel profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      
      // Arahkan ke dashboard yang sesuai dengan jabatannya
      if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profile?.role === "teknisi") {
        router.push("/teknisi/dashboard");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-blue-50 p-3 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Login Pelapor</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Aplikasi Pengaduan Infrastruktur AKPOL
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            NRP (Nomor Registrasi Pokok)
          </label>
          <input
            type="text"
            required
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
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
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Masuk Sekarang"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}
