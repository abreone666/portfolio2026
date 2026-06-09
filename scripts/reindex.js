#!/usr/bin/env node
// Invia le URL del sitemap alla Google Indexing API usando un service account.
// Richiede: GOOGLE_SERVICE_ACCOUNT_JSON (env var con il JSON del service account).

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

function b64url(str) {
  return Buffer.from(str).toString('base64url');
}

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: creds.client_email,
    scope: INDEXING_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const toSign = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(toSign);
  const sig = signer.sign(creds.private_key, 'base64url');
  const jwt = `${toSign}.${sig}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

function extractUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(https:\/\/www\.antonioilacqua\.it\/blog\/[^<]+\.html)<\/loc>/g)];
  return matches.map(m => m[1]);
}

async function submitUrl(url, token) {
  const res = await fetch(INDEXING_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return res.json();
}

async function main() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credJson) {
    console.error('❌  GOOGLE_SERVICE_ACCOUNT_JSON non impostata');
    process.exit(1);
  }

  const creds = JSON.parse(credJson);
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urls = extractUrls(xml);

  if (urls.length === 0) {
    console.log('Nessuna URL blog trovata nel sitemap.');
    return;
  }

  console.log(`🔑  Ottengo access token per ${creds.client_email}…`);
  const token = await getAccessToken(creds);

  console.log(`📤  Invio ${urls.length} URL alla Google Indexing API…\n`);
  let ok = 0;
  for (const url of urls) {
    const result = await submitUrl(url, token);
    const success = result.urlNotificationMetadata || result.latestUpdate;
    console.log(`${success ? '✅' : '⚠️ '} ${url}`);
    if (!success) console.log('   ', JSON.stringify(result));
    else ok++;
    await new Promise(r => setTimeout(r, 300)); // evita rate limit
  }

  console.log(`\nCompletato: ${ok}/${urls.length} URL inviate con successo.`);
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
