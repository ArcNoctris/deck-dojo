import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https');

  return NextResponse.redirect(`${protocol}://${host}/`, { status: 303 });
}
