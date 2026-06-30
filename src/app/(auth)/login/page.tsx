"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShieldAlert, User, Wrench } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"pelapor" | "teknisi" | "admin">("pelapor");
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

    const dummyEmail = `${nrp}@akpol.id`;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password,
    });

    if (authError) {
      setError("NRP atau Password salah.");
      setLoading(false);
    } else {
      // Cek role user dari tabel profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      
      // Validasi keamanan: Pastikan tab login sesuai dengan role asli di database
      if (profile?.role !== activeTab) {
        await supabase.auth.signOut(); // Logout paksa karena mencoba masuk ke pintu yang salah
        setError(`Akses ditolak! Akun Anda terdaftar sebagai ${profile?.role?.toUpperCase() || 'TIDAK DIKETAHUI'}, bukan ${activeTab.toUpperCase()}. Silakan pindah ke tab yang benar.`);
        setLoading(false);
        return;
      }
      
      // Arahkan ke dashboard masing-masing
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

  // Warna dinamis berdasarkan tab yang aktif
  const getThemeColor = () => {
    if (activeTab === "admin") return "bg-slate-800 hover:bg-slate-900 focus:ring-slate-800 text-white";
    if (activeTab === "teknisi") return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white";
    return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white";
  };

  const getIconColor = () => {
    if (activeTab === "admin") return "text-slate-800 bg-slate-100";
    if (activeTab === "teknisi") return "text-amber-600 bg-amber-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 transition-all duration-300">
      
      <div className="flex flex-col items-center mb-6 text-center">
        <div className={`p-4 rounded-full mb-4 ${getIconColor()} transition-colors`}>
          {activeTab === "pelapor" && <User className="w-8 h-8" />}
          {activeTab === "teknisi" && <Wrench className="w-8 h-8" />}
          {activeTab === "admin" && <ShieldAlert className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Login {activeTab === "pelapor" ? "Pelapor" : activeTab === "teknisi" ? "Teknisi" : "Admin"}
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          {activeTab === "pelapor" && "Masuk untuk melaporkan keluhan infrastruktur."}
          {activeTab === "teknisi" && "Masuk untuk melihat dan mengeksekusi tugas lapangan."}
          {activeTab === "admin" && "Masuk ke pusat kendali manajemen pengaduan."}
        </p>
      </div>

      {/* Tabs Pilihan Role */}
      <div className="flex bg-slate-100 rounded-lg p-1.5 mb-8">
        <button 
          onClick={() => { setActiveTab("pelapor"); setError(""); }} 
          className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all ${activeTab === 'pelapor' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <User className="w-4 h-4 mr-2" /> Pelapor
        </button>
        <button 
          onClick={() => { setActiveTab("teknisi"); setError(""); }} 
          className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all ${activeTab === 'teknisi' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Wrench className="w-4 h-4 mr-2" /> Teknisi
        </button>
        <button 
          onClick={() => { setActiveTab("admin"); setError(""); }} 
          className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ShieldAlert className="w-4 h-4 mr-2" /> Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 text-center border border-red-100 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            NRP <span className="text-slate-400 font-normal">(Nomor Registrasi Pokok)</span>
          </label>
          <input
            type="text"
            required
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 outline-none transition-all
              ${activeTab === 'admin' ? 'focus:ring-slate-800 focus:border-slate-800' : 
                activeTab === 'teknisi' ? 'focus:ring-amber-500 focus:border-amber-500' : 
                'focus:ring-blue-500 focus:border-blue-500'}
            `}
            placeholder={`Masukkan NRP ${activeTab}...`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 outline-none transition-all
              ${activeTab === 'admin' ? 'focus:ring-slate-800 focus:border-slate-800' : 
                activeTab === 'teknisi' ? 'focus:ring-amber-500 focus:border-amber-500' : 
                'focus:ring-blue-500 focus:border-blue-500'}
            `}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-medium py-3 rounded-lg transition-all flex items-center justify-center mt-2 disabled:opacity-70 ${getThemeColor()}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Masuk sebagai {activeTab === "pelapor" ? "Pelapor" : activeTab === "teknisi" ? "Teknisi" : "Admin"}
            </>
          )}
        </button>
      </form>

      {/* Register link hanya untuk pelapor */}
      {activeTab === "pelapor" && (
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Belum punya akun pelapor?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold">
            Daftar di sini
          </Link>
        </div>
      )}
    </div>
  );
}
