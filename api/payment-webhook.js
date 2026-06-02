export default async function handler(req, res) {
  // Mercado Pago envía notificaciones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  try {
    let paymentId = '';

    // 1. Obtener ID desde Query Parameters (formato IPN)
    if (req.query && req.query.id) {
      const topic = req.query.topic || req.query.type;
      if (topic === 'payment') {
        paymentId = req.query.id;
      }
    }

    // 2. Obtener ID desde el cuerpo (formato Webhook)
    if (!paymentId && req.body) {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body.type === 'payment' && body.data && body.data.id) {
        paymentId = body.data.id;
      } else if (body.id && body.resource && body.resource.includes('payments')) {
        paymentId = body.id;
      }
    }

    // Si no se pudo extraer un ID de pago válido, se ignora
    if (!paymentId) {
      console.log('Notificación recibida sin ID de pago válido, ignorando.');
      return res.status(200).json({ message: 'Notificación ignorada por falta de ID.' });
    }

    console.log(`Procesando notificación de pago: ${paymentId}`);

    // Consultar detalles de pago en la API de Mercado Pago
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Falta variable de entorno MP_ACCESS_TOKEN.');
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!mpResponse.ok) {
      throw new Error(`Mercado Pago API devolvió código ${mpResponse.status} para pago ${paymentId}`);
    }

    const paymentData = await mpResponse.json();
    const status = paymentData.status;
    const statusDetail = paymentData.status_detail;

    console.log(`Estado del pago ${paymentId}: ${status} (${statusDetail})`);

    // Descontar stock solo si el pago está aprobado (approved)
    if (status === 'approved') {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (!url || !token) {
        throw new Error('Falta configuración de Upstash Redis en Vercel.');
      }

      // Idempotencia: Evitar descontar dos veces si se repite la notificación
      const processedKey = `payment:processed:${paymentId}`;
      
      const checkResponse = await fetch(`${url}/get/${processedKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const checkData = await checkResponse.json();

      if (checkData.result === 'true') {
        console.log(`El pago ${paymentId} ya fue procesado anteriormente. Omitiendo decremento.`);
      } else {
        // Guardar marca de procesado con expiración de 7 días (604800 segundos)
        await fetch(`${url}/setex/${processedKey}/604800/true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Decrementar el stock de la base de datos
        const decrResponse = await fetch(`${url}/decr/stock`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const decrData = await decrResponse.json();
        console.log(`Stock decrementado para pago ${paymentId}. Stock actual: ${decrData.result}`);
      }
    }

    return res.status(200).json({ message: 'Notificación procesada con éxito.' });

  } catch (err) {
    console.error('Error al procesar webhook de pago:', err);
    return res.status(500).json({ error: 'Error interno en webhook.', details: err.message });
  }
}
