import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient, saveTokens } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/calendar?error=no_code', request.url));
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    saveTokens(tokens);
    return NextResponse.redirect(new URL('/calendar?connected=1', request.url));
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(new URL('/calendar?error=auth_failed', request.url));
  }
}
