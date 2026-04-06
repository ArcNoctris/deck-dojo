import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Use standard Request headers to determine the exact origin the browser sent
      const host = request.headers.get('host') || url.host
      // Fallback to http for local development if x-forwarded-proto isn't set
      const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https')
      const baseUrl = `${protocol}://${host}`
      
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  const host = request.headers.get('host') || url.host
  const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https')
  const baseUrl = `${protocol}://${host}`

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/login?error=auth`)
}
