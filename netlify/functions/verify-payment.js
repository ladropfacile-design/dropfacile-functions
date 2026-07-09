exports.handler = async (event) => {
  const sessionId = event.queryStringParameters.session_id;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ valid: false }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
    }
  });

  const session = await response.json();

  const isValid = session.payment_status === 'paid';

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ valid: isValid, produit: session.metadata?.produit || null })
  };
};
