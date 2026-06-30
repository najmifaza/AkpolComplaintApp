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
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      
      if (profile?.role !== activeTab) {
        await supabase.auth.signOut();
        setError(`Akses ditolak! Akun Anda terdaftar sebagai ${profile?.role?.toUpperCase() || 'TIDAK DIKETAHUI'}, bukan ${activeTab.toUpperCase()}.`);
        setLoading(false);
        return;
      }
      
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

  // Warna dinamis Akpol Theme
  const getThemeColor = () => {
    if (activeTab === "admin") return "bg-slate-900 hover:bg-black focus:ring-slate-900 text-amber-500 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    if (activeTab === "teknisi") return "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 text-slate-900 border-2 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]";
    return "bg-[#800000] hover:bg-[#600000] focus:ring-[#800000] text-white border-2 border-[#800000] shadow-[0_0_15px_rgba(128,0,0,0.3)]";
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 transition-all duration-300 relative overflow-hidden w-full max-w-md mx-auto">
      {/* Aksen atas */}
      <div className={`absolute top-0 left-0 w-full h-2 ${activeTab === 'pelapor' ? 'bg-[#800000]' : activeTab === 'teknisi' ? 'bg-amber-500' : 'bg-slate-900'}`} />

      <div className="flex flex-col items-center mb-6 text-center mt-2">
        {/* Logo Akpol */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/akpol.png" alt="Logo Akpol" className="h-20 sm:h-24 w-auto mb-4 drop-shadow-md" />
        
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          DUMAS <span className="text-amber-500">AKPOL</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Layanan Pengaduan Infrastruktur Terintegrasi
        </p>
      </div>

      <div className="flex bg-slate-100 rounded-lg p-1.5 mb-8 border border-slate-200">
        <button 
          onClick={() => { setActiveTab("pelapor"); setError(""); }} 
          className={`flex-1 py-2 text-sm font-bold rounded-md flex justify-center items-center transition-all ${activeTab === 'pelapor' ? 'bg-white shadow-sm text-[#800000]' : 'text-slate-500 hover:text-slate-700'}`}
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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 text-center border border-red-100 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            NRP <span className="text-slate-400 font-normal">(Nomor Registrasi Pokok)</span>
          </label>
          <input
            type="text"
            required
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 outline-none transition-all font-medium bg-slate-50 focus:bg-white
              ${activeTab === 'admin' ? 'focus:ring-slate-800 focus:border-slate-800' : 
                activeTab === 'teknisi' ? 'focus:ring-amber-500 focus:border-amber-500' : 
                'focus:ring-[#800000] focus:border-[#800000]'}
            `}
            placeholder={`Masukkan NRP ${activeTab}...`}
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
            className={`w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 outline-none transition-all font-medium bg-slate-50 focus:bg-white
              ${activeTab === 'admin' ? 'focus:ring-slate-800 focus:border-slate-800' : 
                activeTab === 'teknisi' ? 'focus:ring-amber-500 focus:border-amber-500' : 
                'focus:ring-[#800000] focus:border-[#800000]'}
            `}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-black py-3.5 rounded-lg transition-all flex items-center justify-center mt-4 disabled:opacity-70 tracking-wide uppercase ${getThemeColor()}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              LOGIN {activeTab}
            </>
          )}
        </button>
      </form>

      {activeTab === "pelapor" && (
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
          Taruna / Staf baru?{" "}
          <Link href="/register" className="text-[#800000] hover:text-red-700 font-black tracking-wide">
            Daftar Akses
          </Link>
        </div>
      )}
    </div>
  );
}
