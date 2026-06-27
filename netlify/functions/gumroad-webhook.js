exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const email = params.get('email');
  const product = params.get('product_name');

  if (!email) {
    return { statusCode: 400, body: 'Missing email' };
  }

  const cle = 'FACILI-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 

Math.random().toString(36).substring(2, 6).toUpperCase();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  await fetch(`${SUPABASE_URL}/rest/v1/licences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SECRET_KEY,
      'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`
    },
    body: JSON.stringify({ cle, email, produit: product, active: false })
  });

  await fetch('https://api.resend.com/emails', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'DropFacile <noreply@dropfacile.fr>',
      to: email,
      subject: '🔑 Votre clé de licence FaciliFacture',
      html: `<h2>Merci pour votre achat !</h2><p>Votre clé de licence personnelle :</p><h1 style="color:#30D5C8;letter-spacing:4px">${cle}</h1><p>Cette clé est personnelle et non-transférable.</p>`
    })
  });

  return { statusCode: 200, body: 'OK' };
};
