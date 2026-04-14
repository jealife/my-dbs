import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendCredentialsEmail } from '@/lib/mail-service';

export async function POST(request) {
  // Vérification d'authentification — seuls les utilisateurs connectés peuvent déclencher cet envoi
  const cookieStore = await cookies();
  const token = cookieStore.get('dbs_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, firstName, lastName, userCode, password, role } = body;

    if (!to || !userCode || !password) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Validation basique du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    await sendCredentialsEmail({ to, firstName, lastName, userCode, password, role });

    return NextResponse.json({ success: true, message: 'Email envoyé' });
  } catch (error) {
    console.error('[MyDBS Mail API Error]:', error.message);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
  }
}
