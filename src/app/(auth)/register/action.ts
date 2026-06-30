"use server"

import { createClient } from "@supabase/supabase-js"

export async function registerUserByAdmin(nama: string, nrp: string, password: string) {
  // Pastikan key tersedia
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di .env.local" }
  }

  // Membuat client khusus Admin (bypasses RLS & Email Verification)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )

  const dummyEmail = `${nrp}@akpol.id`

  // Mendaftarkan user via jalur Admin agar otomatis terkonfirmasi tanpa kirim email
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: password,
    email_confirm: true, // INI KUNCI UTAMANYA: Bypass verifikasi email
    user_metadata: {
      nama: nama,
      nrp: nrp,
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
