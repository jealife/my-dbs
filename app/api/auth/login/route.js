/**
 * Server-side proxy for login.
 * Bypasses browser CORS — calls the backend directly from the Next.js server.
 */
export async function POST(request) {
  const backendBase =
    process.env.BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    'http://localhost:8080';

  // AuthController is mapped to /api/auth (no v1 prefix)
  const loginUrl = `${backendBase}/api/auth/login`;

  try {
    const body = await request.json();
    console.log('[MyDBS Route] → Tentative login pour:', body.email);

    const backendResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await backendResponse.text();
    console.log('[MyDBS Route] ← Status backend:', backendResponse.status);
    console.log('[MyDBS Route] ← Body backend:', responseText || '(vide)');

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!backendResponse.ok) {
      return Response.json(
        {
          error: responseData?.message || responseData?.error || `Erreur ${backendResponse.status}`,
          status: backendResponse.status,
          detail: responseData,
        },
        { status: backendResponse.status }
      );
    }

    return Response.json(responseData, { status: 200 });

  } catch (error) {
    console.error('[MyDBS Route] ✗ Erreur réseau:', error.message);
    return Response.json(
      { error: 'Impossible de contacter le serveur backend.', detail: error.message },
      { status: 503 }
    );
  }
}
