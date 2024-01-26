import { NextResponse } from 'next/server'

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self' https://ordinals.com 'unsafe-eval' 'unsafe-inline';
    script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://ordinals.com blob:;
    style-src 'self' https://fonts.googleapis.com 'unsafe-eval' 'unsafe-hashes' 'unsafe-inline';
    font-src 'self' https://fonts.gstatic.com/;
    img-src 'self' https://ordinals.com data: blob:;
    frame-src 'self' https://ordinals.com data:;
    connect-src 'self' https://vitals.vercel-insights.com https://ordinals.com https://i18n.ultrafast.io https://mempool.space https://api.ordinalsbot.com blob: data: ;
    media-src 'self' https://ordinals.com blob: data: ;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://ordinals.com 'unsafe-eval' 'unsafe-hashes' 'unsafe-inline';`

  const requestHeaders = new Headers(request.headers)

  // Setting request headers
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    // Replace newline characters and spaces
    cspHeader.replace(/\s{2,}/g, ' ').trim()
  )

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
