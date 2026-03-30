import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lines = parseInt(searchParams.get('lines')) || 500;
    const type = searchParams.get('type') || 'backend';
    
    // Chemin relatif depuis la racine du projet frontend (Next.js)
    let logPath;
    if (type === 'frontend') {
      logPath = path.join(process.cwd(), 'frontend_output.log');
    } else {
      logPath = path.join(process.cwd(), 'my-school-main (2)', 'backend', 'backend_output.log');
    }
    
    const { stdout } = await execAsync(`tail -n ${lines} "${logPath}" 2>/dev/null || echo ""`);

    return NextResponse.json({ logs: stdout, success: true });
  } catch (err) {
    const isNotFound = err.message?.includes('No such file') || err.code === 'ENOENT';
    return NextResponse.json({
      error: err.message,
      success: false,
      fallback: isNotFound
        ? (type === 'frontend'
            ? "Fichier frontend_output.log introuvable. Lancez : npm run dev > frontend_output.log 2>&1"
            : "Fichier backend_output.log introuvable. Assurez-vous que le backend écrit dans ce fichier.")
        : `Erreur de lecture : ${err.message}`
    });
  }
}
