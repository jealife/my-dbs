/**
 * Validation des variables d'environnement critiques au démarrage du serveur.
 * Appeler ce module depuis les routes API ou le layout serveur.
 *
 * Ne pas importer côté client (contient des références à des variables serveur).
 */

const REQUIRED_SERVER_VARS = [
  'BACKEND_BASE_URL',
];

const OPTIONAL_BUT_WARNED = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'ALLOWED_ORIGINS',
  'NEXT_PUBLIC_APP_URL',
];

let validated = false;

export function validateEnv() {
  if (validated) return;
  validated = true;

  const missing = [];
  const warned = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of OPTIONAL_BUT_WARNED) {
    if (!process.env[key]) warned.push(key);
  }

  if (missing.length > 0) {
    console.error(
      `[MyDBS] Variables d'environnement REQUISES manquantes : ${missing.join(', ')}\n` +
      'Vérifiez votre fichier .env.local ou la configuration Vercel.'
    );
    // En production, bloquer le démarrage si des variables critiques sont absentes
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
    }
  }

  if (warned.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[MyDBS] Variables d'environnement optionnelles non définies : ${warned.join(', ')}`
    );
  }
}
