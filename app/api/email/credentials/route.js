import { NextResponse } from 'next/server';
import { sendCredentialsEmail } from '@/lib/mail-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, firstName, lastName, userCode, password, role } = body;

    if (!to || !userCode || !password) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    await sendCredentialsEmail({ to, firstName, lastName, userCode, password, role });

    return NextResponse.json({ success: true, message: 'Email envoyé' });
  } catch (error) {
    console.error('[MyDBS Mail API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
