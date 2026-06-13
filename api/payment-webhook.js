import crypto from 'crypto';

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

    // 3. Verificar firma del Webhook si se configura el secreto
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const xSignature = req.headers['x-signature'] || req.headers['X-Signature'];
      const xRequestId = req.headers['x-request-id'] || req.headers['X-Request-Id'];

      if (!xSignature || !xRequestId) {
        console.error('Faltan encabezados de firma de Mercado Pago');
        return res.status(400).json({ error: 'Faltan encabezados de firma' });
      }

      try {
        const parts = xSignature.split(',');
        const tsPart = parts.find(p => p.trim().startsWith('ts='));
        const v1Part = parts.find(p => p.trim().startsWith('v1='));
        if (!tsPart || !v1Part) {
          throw new Error('Formato de x-signature inválido');
        }
        const ts = tsPart.split('=')[1];
        const v1 = v1Part.split('=')[1];

        const manifest = `id:${paymentId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
        const computedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(manifest)
          .digest('hex');

        const bufComputed = Buffer.from(computedSignature, 'hex');
        const bufV1 = Buffer.from(v1, 'hex');

        if (bufComputed.length !== bufV1.length || !crypto.timingSafeEqual(bufComputed, bufV1)) {
          console.error('Firma de webhook de Mercado Pago inválida');
          return res.status(403).json({ error: 'Firma inválida' });
        }
        console.log('Firma de webhook de Mercado Pago verificada con éxito.');
      } catch (sigErr) {
        console.error('Error al verificar firma:', sigErr);
        return res.status(400).json({ error: 'Error de verificación de firma' });
      }
    } else {
      console.warn('ADVERTENCIA DE SEGURIDAD: MP_WEBHOOK_SECRET no está configurada. Firma del webhook no verificada.');
    }

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
        throw new Error('Falta configuración de Upstash Redis.');
      }

      // Idempotencia atómica: Evitar descontar dos veces si se repite la notificación
      const processedKey = `payment:processed:${paymentId}`;
      
      const setResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', processedKey, 'true', 'EX', 604800, 'NX'])
      });
      const setData = await setResponse.json();

      if (setData.result !== 'OK') {
        console.log(`El pago ${paymentId} ya fue procesado anteriormente (SETNX retornado null). Omitiendo decremento.`);
      } else {
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
    return res.status(500).json({ error: 'Error interno en webhook.' });
  }
}
