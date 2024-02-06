import { NextResponse } from 'next/server'

const COUNTRY_WHITELIST = [
  "AT", // Austria
  "AU", // Australia
  "BB", // Barbados
  "BE", // Belgium
  "BG", // Bulgaria
  "BR", // Brazil
  "BS", // Bahamas
  "CA", // Canada
  "CH", // Switzerland
  "CY", // Cyprus
  "CZ", // Czech Republic
  "DE", // Germany
  "DK", // Denmark
  "DO", // Dominican Republic
  "EE", // Estonia
  "ES", // Spain
  "FI", // Finland
  "FR", // France
  "GB", // Great Britain (UK)
  "GI", // Gibraltar
  "GR", // Greece
  "HK", // Hong Kong
  "HR", // Croatia
  "HU", // Hungary
  "ID", // Indonesia
  "IE", // Ireland
  "IL", // Israel
  "IN", // India
  "IS", // Iceland
  "IT", // Italy
  "JM", // Jamaica
  "JP", // Japan
  "KR", // South Korea
  "LI", // Liechtenstein
  "LT", // Lithuania
  "LU", // Luxembourg
  "LV", // Latvia
  "MT", // Malta
  "MX", // Mexico
  "MY", // Malaysia
  "NG", // Nigeria
  "NL", // Netherlands
  "NO", // Norway
  "NZ", // New Zealand
  "PH", // Philippines
  "PL", // Poland
  "PR", // Puerto Rico
  "PT", // Portugal
  "RO", // Romania
  "SE", // Sweden
  "SG", // Singapore
  "SI", // Slovenia
  "SK", // Slovakia
  "US", // United States
  "VN", // Viet Nam
  "ZA", // South Africa
];

export function middleware(request) {
  const country = request.geo?.country;
  if (process.env.NODE_ENV !== 'development' && !COUNTRY_WHITELIST.includes(country)) {
    return new Response('Blocked in your region', { status: 451 });
  }

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
