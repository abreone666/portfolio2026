module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(403).json({ status: 'error', message: 'Accesso negato.' });
  }

  const body = req.body || {};

  const name = sanitize(body.nome || body.name || '');
  const email = sanitize(body.email || '');
  const message = sanitize(body.messaggio || body.message || '');

  if (!name || !email || !message || !validateEmail(email)) {
    return res.status(400).json({ status: 'error', message: 'Per favore, compila tutti i campi correttamente.' });
  }

  // reCAPTCHA v3
  const recaptchaToken = body.recaptcha_token;
  if (recaptchaToken && process.env.RECAPTCHA_SECRET) {
    const rcRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    );
    const rc = await rcRes.json();
    if (!rc.success || (rc.score ?? 0) < 0.5) {
      return res.status(400).json({ status: 'error', message: 'Verifica reCAPTCHA fallita. Riprova.' });
    }
  }

  const optionalMap = {
    progetto: 'Tipo di progetto',
    subject: 'Oggetto',
    telefono: 'Telefono',
    sito: 'Sito attuale',
    sede: 'Sede',
    nome_azienda: 'Nome Azienda',
  };

  let extra = '';
  for (const [key, label] of Object.entries(optionalMap)) {
    if (body[key]) extra += `${label}: ${sanitize(body[key])}\n`;
  }

  const emailText = [
    'Hai ricevuto un nuovo messaggio dal modulo di contatto.',
    '',
    `Nome: ${name}`,
    `Email: ${email}`,
    extra.trimEnd(),
    '',
    'Messaggio:',
    message,
  ].join('\n');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Configurazione email mancante.' });
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio <noreply@antonioilacqua.it>',
      to: ['info@antonioilacqua.it'],
      reply_to: email,
      subject: 'Nuovo Messaggio dal Portfolio',
      text: emailText,
    }),
  });

  if (resendRes.ok) {
    return res.status(200).json({ status: 'success', message: 'Grazie! Il tuo messaggio è stato inviato correttamente.' });
  }

  return res.status(500).json({ status: 'error', message: "Ops! Qualcosa è andato storto. Riprova più tardi." });
}

function sanitize(str) {
  return String(str).trim().replace(/[<>]/g, '');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
