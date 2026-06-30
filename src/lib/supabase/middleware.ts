import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Memperbarui cookie di request aslinya
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Membuat response baru
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Mengeset cookie ke response agar terkirim ke browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Melakukan get user untuk me-refresh token session jika sudah mau kadaluarsa
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Proteksi Route Dasar
  // Jika belum login dan mencoba masuk ke halaman terproteksi
  if (!user && pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Jika sudah login tapi mencoba akses login/register
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
