const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Mercado Pago envía notificaciones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido.' })
    };
  }

  try {
    let paymentId = '';

    // 1. Obtener ID desde Query Parameters (formato IPN)
    if (event.queryStringParameters && event.queryStringParameters.id) {
      const topic = event.queryStringParameters.topic || event.queryStringParameters.type;
      if (topic === 'payment') {
        paymentId = event.queryStringParameters.id;
      }
    }

    // 2. Obtener ID desde el cuerpo (formato Webhook)
    if (!paymentId && event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.type === 'payment' && body.data && body.data.id) {
          paymentId = body.data.id;
        } else if (body.id && body.resource && body.resource.includes('payments')) {
          paymentId = body.id;
        }
      } catch (parseErr) {
        console.error('Error al parsear el JSON de la notificación:', parseErr);
      }
    }

    // Si no se pudo extraer un ID de pago válido, se ignora
    if (!paymentId) {
      console.log('Notificación recibida sin ID de pago válido, ignorando.');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Notificación ignorada por falta de ID.' })
      };
    }

    console.log(`Procesando notificación de pago: ${paymentId}`);

    // 3. Verificar firma del Webhook si se configura el secreto
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Netlify normaliza los headers de event a minúsculas
      const xSignature = event.headers['x-signature'] || event.headers['X-Signature'];
      const xRequestId = event.headers['x-request-id'] || event.headers['X-Request-Id'];

      if (!xSignature || !xRequestId) {
        console.error('Faltan encabezados de firma de Mercado Pago');
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Faltan encabezados de firma' })
        };
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
          return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Firma inválida' })
          };
        }
        console.log('Firma de webhook de Mercado Pago verificada con éxito.');
      } catch (sigErr) {
        console.error('Error al verificar firma:', sigErr);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Error de verificación de firma' })
        };
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

    // Confirmar recepción exitosa a Mercado Pago para frenar reintentos
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Notificación procesada con éxito.' })
    };

  } catch (err) {
    console.error('Error al procesar webhook de pago:', err);
    // Responder con 500 para que Mercado Pago reintente el envío
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error interno en webhook.' })
    };
  }
};
