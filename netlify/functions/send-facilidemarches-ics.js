// Fonction Netlify — envoie le fichier .ics de FaciliDémarches par email après achat.
// À déployer sur le même site que gumroad-webhook.js (bespoke-capybara-1c5099),
// dans le dossier des fonctions Netlify, sous le nom : send-facilidemarches-ics.js
//
// Variable d'environnement nécessaire (déjà présente sur ce site) : RESEND_API_KEY

exports.handler = async function (event) {
  // On n'accepte que les requêtes POST envoyées par l'app
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, ics } = JSON.parse(event.body || '{}');

    if (!email || !ics) {
      return { statusCode: 400, body: JSON.stringify({ error: 'email et ics sont requis' }) };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Le contenu du fichier .ics doit être encodé en base64 pour être joint à l'email
    const icsBase64 = Buffer.from(ics, 'utf-8').toString('base64');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FaciliDémarches <noreply@dropfacile.fr>',
        to: [email],
        subject: 'Ton calendrier FaciliDémarches (fichier .ics)',
        html: `
          <p>Merci pour ton achat !</p>
          <p>Tu trouveras en pièce jointe ton calendrier personnalisé au format .ics, avec les rappels déjà intégrés.</p>
          <p><strong>Comment l'utiliser :</strong> ouvre le fichier joint, il s'ajoutera automatiquement à ton calendrier (Google Agenda, Apple Calendrier...). Tu recevras ensuite une notification 7 jours avant chaque échéance.</p>
          <p>Besoin d'aide ? Réponds simplement à cet email.</p>
          <p>— L'équipe DropFacile</p>
        `,
        attachments: [
          {
            filename: 'FaciliDemarches-calendrier.ics',
            content: icsBase64
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Erreur Resend:', errText);
      return { statusCode: 502, body: JSON.stringify({ error: 'Échec de l\'envoi email' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Erreur send-facilidemarches-ics:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
