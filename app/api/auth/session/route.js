/**
 * POST /api/auth/session
 * Reçoit un token JWT (ex: après première connexion) et le stocke
 * en cookie HttpOnly côté serveur — le JS client ne le voit jamais.
 */
export async function POST(request) {
  try {
    const { token, user } = await request.json();

    if (!token || typeof token !== 'string' || token.length < 10) {
      return Response.json({ error: 'Token invalide' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = [
      `dbs_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=86400',
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    const sessionCookieOptions = [
      'dbs_session=1',
      'Path=/',
      'SameSite=Lax',
      'Max-Age=86400',
      isProduction ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({ ok: true, user: user || null }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': [cookieOptions, sessionCookieOptions].join(', '),
      },
    });
  } catch {
    return Response.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
