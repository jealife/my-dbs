/**
 * Server-side proxy for login.
 * Bypasses browser CORS — calls the backend directly from the Next.js server.
 * Sets the JWT as an HttpOnly cookie so it is never accessible to JavaScript.
 */
export async function POST(request) {
  const backendBase =
    process.env.BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    'http://localhost:8080';

  const loginUrl = `${backendBase}/api/auth/login`;
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    const body = await request.json();

    // Validation minimale avant d'appeler le backend
    if (!body.email || !body.password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const backendResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    const responseText = await backendResponse.text();
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
        },
        { status: backendResponse.status }
      );
    }

    // Extraire le token de la réponse backend
    const payload = responseData?.data || responseData || {};
    const token = payload.accessToken || payload.token;
    const user = payload.user || (payload.role ? payload : null);

    if (!token) {
      return Response.json({ error: 'Réponse backend invalide : token manquant' }, { status: 502 });
    }

    // Cookie HttpOnly — le JS client ne peut pas le lire (protection XSS)
    const cookieOptions = [
      `dbs_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=86400', // 1 jour
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    // Cookie accessible au JS pour détecter l'état de connexion (pas le token)
    const sessionCookieOptions = [
      'dbs_session=1',
      'Path=/',
      'SameSite=Lax',
      'Max-Age=86400',
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    // On retourne uniquement les données utilisateur (jamais le token au client)
    return new Response(JSON.stringify({ data: { user } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': [cookieOptions, sessionCookieOptions].join(', '),
      },
    });

  } catch (error) {
    console.error('[MyDBS Login] Erreur réseau:', error.message);
    return Response.json(
      { error: 'Impossible de contacter le serveur backend.' },
      { status: 503 }
    );
  }
}

/**
 * Logout — supprime les cookies côté serveur
 */
export async function DELETE() {
  const expired = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  const expiredSession = 'Path=/; SameSite=Lax; Max-Age=0';
  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': [
        `dbs_token=; ${expired}`,
        `dbs_session=; ${expiredSession}`,
      ].join(', '),
    },
  });
}
