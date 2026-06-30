"use client"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar({ profile }: { profile: { nama?: string; nrp?: string; role?: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-[#800000] border-b-4 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/akpol.png" alt="Logo Akpol" className="h-10 w-auto sm:h-12 mr-2 sm:mr-3 drop-shadow-md" />
              <Link href="/dashboard" className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                DUMAS <span className="text-amber-400">AKPOL</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:ml-10 md:flex space-x-2 items-center">
              <Link 
                href="/dashboard" 
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${pathname === '/dashboard' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
              >
                DASHBOARD SAYA
              </Link>
              <Link 
                href="/lapor" 
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${pathname === '/lapor' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
              >
                BUAT LAPORAN
              </Link>
            </div>
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center">
            <div className="flex flex-col text-right mr-4 text-white">
              <span className="text-sm font-bold drop-shadow-sm">{profile?.nama || 'Taruna/Staf'}</span>
              <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">NRP: {profile?.nrp}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-2 bg-[#600000] text-slate-200 hover:bg-red-950 hover:text-white border border-[#500000] px-4 py-2 rounded-md text-xs font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-amber-400 focus:outline-none p-2"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#800000] border-t border-[#600000] animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-4 pb-3 space-y-2">
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-md text-base font-bold ${pathname === '/dashboard' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
            >
              DASHBOARD SAYA
            </Link>
            <Link 
              href="/lapor" 
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-md text-base font-bold ${pathname === '/lapor' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-200 hover:bg-[#600000] hover:text-white'}`}
            >
              BUAT LAPORAN
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-[#600000] mt-2">
            <div className="flex items-center px-5">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-[#600000] flex items-center justify-center text-amber-400 font-bold border border-amber-500">
                  {profile?.nama?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-bold text-white leading-none">{profile?.nama || 'Taruna/Staf'}</div>
                <div className="text-xs font-medium text-amber-300 mt-1">NRP: {profile?.nrp}</div>
              </div>
            </div>
            <div className="mt-4 px-4 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-center px-4 py-3 rounded-md text-base font-bold text-red-200 hover:text-white bg-[#600000] border border-[#500000] shadow-sm"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
