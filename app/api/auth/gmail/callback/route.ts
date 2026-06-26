import { NextRequest, NextResponse } from 'next/server';
import { getGmailOAuthClient, saveGmailTokens } from '@/lib/google-gmail';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/calendar?gmailError=no_code', request.url));
  }

  try {
    const client = getGmailOAuthClient();
    const { tokens } = await client.getToken(code);
    saveGmailTokens(tokens);
    return NextResponse.redirect(new URL('/calendar?gmailConnected=1', request.url));
  } catch (err) {
    console.error('Gmail OAuth error:', err);
    return NextResponse.redirect(new URL('/calendar?gmailError=auth_failed', request.url));
  }
}
