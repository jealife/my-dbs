import { cookies } from 'next/headers';

const BACKEND =
  process.env.BACKEND_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  'http://localhost:8080';

async function proxyRequest(request, { params }) {
  const segments = (await params).path;
  const subPath = segments.join('/');
  const url = new URL(request.url);
  const searchParams = url.search;

  // 1. Try with /api prefix (Current Standard)
  const primaryBackendUrl = `${BACKEND}/api/${subPath}${searchParams}`;
  
  // ── Build headers (fresh each time) ──────────────────────────────────────
  const buildHeaders = async () => {
    const headers = new Headers()
    const accept = request.headers.get('accept')
    headers.set('Accept', accept || 'application/json')
    const ct = request.headers.get('content-type')
    if (ct) headers.set('Content-Type', ct)

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get('dbs_token')?.value;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  // ── Build body (buffer once to allow multiple attempts) ──────────────────
  const requestBodyBuffer = ['GET', 'HEAD'].includes(request.method) ? null : await request.arrayBuffer();

  try {
    console.log(`[API Proxy] ➜ ${request.method} /api/${subPath}`);
    
    // Build common fetch options
    const getFetchOpts = async () => ({
      method: request.method,
      headers: await buildHeaders(),
      body: requestBodyBuffer,
    });

    // First Attempt (with /api/)
    let backendRes = await fetch(primaryBackendUrl, await getFetchOpts());

    // FALLBACK STRATEGY:
    // Only retry on root if we get a routing/auth error (404, 401, 403).
    // DO NOT retry on 5xx or general error to avoid backend overload on slow disk.
    if (backendRes.status >= 400) {
      const status = backendRes.status;
      if (status < 500 && (status === 404 || status === 401 || status === 403)) {
        console.warn(`[API Proxy] ⚠ ${status} on ${primaryBackendUrl}. Trying root...`);
        const fallbackUrl = `${BACKEND}/${subPath}${searchParams}`;
        const fallbackRes = await fetch(fallbackUrl, await getFetchOpts());

        if (fallbackRes.status !== 404) {
          console.log(`[API Proxy] ✓ Success on root fallback: ${fallbackUrl}`);
          backendRes = fallbackRes;
        }
      }
      // Log the backend error body for all 4xx/5xx responses
      if (backendRes.status !== 404) {
        const cloned = backendRes.clone();
        cloned.text().then(body =>
          console.error(`[API Proxy] ✗ ${backendRes.status} ${request.method} /api/${subPath} — Backend error: ${body}`)
        ).catch(() => {});
      }
    }

    // Prepare response
    const responseHeaders = new Headers(backendRes.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new Response(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error(`[API Proxy Error] CRITICAL:`, error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Proxy Error: Connection to backend failed or timed out.',
        error: error.message
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
