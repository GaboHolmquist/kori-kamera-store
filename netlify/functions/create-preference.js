const fetch = globalThis.fetch || require('node-fetch');

exports.handler = async (event, context) => {
  // Permitir solo peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido. Utilizar POST.' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const {
      name,
      phone,
      color = 'OBSIDIAN',
      reducers = false,
      adapter = false,
      customAdapter = false,
      customAdapterDetails = {},
      engraving = false,
      engravingText = '',
      shippingMethod = 'Bluexpress',
      invoice = false,
      invoiceDetails = {}
    } = data;

    // Validación mínima
    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Nombre y teléfono son obligatorios.' })
      };
    }

    // Calcular ítems y precios en el servidor por seguridad
    const basePrice = 89990;
    const items = [];

    // Ítem base (Matte Box)
    items.push({
      title: `Matte Box MKB-V4 (${color})`,
      quantity: 1,
      unit_price: basePrice,
      currency_id: 'CLP'
    });

    // Extras
    if (reducers) {
      items.push({
        title: "Kit reductores de filtros (77mm a 37mm)",
        quantity: 1,
        unit_price: 20000,
        currency_id: 'CLP'
      });
    }

    if (adapter) {
      items.push({
        title: "Adaptador 4x5 a filtros redondos 77mm",
        quantity: 1,
        unit_price: 15000,
        currency_id: 'CLP'
      });
    }

    if (customAdapter) {
      const mm = customAdapterDetails.mm || '';
      const lens = customAdapterDetails.lens || '';
      const desc = [mm ? `${mm}mm` : '', lens].filter(Boolean).join(' — ');
      items.push({
        title: `Adaptador personalizado: ${desc || 'Detalles por coordinar'}`,
        quantity: 1,
        unit_price: 8000,
        currency_id: 'CLP'
      });
    }

    const engravingFree = reducers && adapter;
    if (engraving) {
      items.push({
        title: `Grabado personalizado: "${engravingText || 'Pendiente'}"` + (engravingFree ? ' (Gratis)' : ''),
        quantity: 1,
        unit_price: engravingFree ? 0 : 8000,
        currency_id: 'CLP'
      });
    }

    // Costo de envío
    let shippingCost = 0;
    if (shippingMethod === 'Bluexpress') {
      shippingCost = 5990;
    } else if (shippingMethod === 'Express') {
      shippingCost = 9990;
    } else if (shippingMethod === 'Retiro Metro Ecuador o Tobalaba') {
      shippingCost = 0;
    }

    if (shippingCost > 0) {
      items.push({
        title: `Envío: ${shippingMethod}`,
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'CLP'
      });
    }

    // Verificar token en las variables de entorno
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Falta la variable de entorno MP_ACCESS_TOKEN');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Configuración del servidor incompleta (falta MP_ACCESS_TOKEN).' })
      };
    }

    // Obtener URL base dinámica para los retornos
    const host = event.headers.host || 'korikamera.store';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Construir la preferencia de Mercado Pago
    // Sanitizar teléfono (quitar caracteres no numéricos)
    const rawDigits = phone.replace(/\D/g, '');
    const phoneArea = rawDigits.startsWith('56') ? '56' : '';
    const phoneNumber = rawDigits.startsWith('56') ? rawDigits.slice(2) : rawDigits;

    const mpPreferenceBody = {
      items: items,
      payer: {
        name: name,
        phone: {
          area_code: phoneArea,
          number: phoneNumber
        }
      },
      back_urls: {
        success: `${baseUrl}/pago-exitoso.html`,
        failure: `${baseUrl}/pago-fallido.html`,
        pending: `${baseUrl}/pago-exitoso.html`
      },
      auto_return: 'approved',
      // Metadata útil para recuperar detalles en el webhook o en la página de éxito
      metadata: {
        customer_name: name,
        customer_phone: phone,
        color: color,
        reducers: reducers,
        adapter: adapter,
        custom_adapter: customAdapter,
        custom_adapter_mm: customAdapterDetails.mm || '',
        custom_adapter_lens: customAdapterDetails.lens || '',
        engraving: engraving,
        engraving_text: engravingText,
        shipping_method: shippingMethod,
        invoice_needed: invoice,
        invoice_company: invoiceDetails.company || '',
        invoice_rut: invoiceDetails.rut || '',
        invoice_business: invoiceDetails.business || '',
        invoice_address: invoiceDetails.address || ''
      },
      statement_descriptor: "KORI KAMERA STORE",
      // Evitar que paguen con medios no deseados si es necesario (opcional)
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" } // Excluir pago en efectivo (por ejemplo, sencillito, rapipago) si se prefiere solo online instantáneo
        ]
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mpPreferenceBody)
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Error de Mercado Pago API:', errorData);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Error al comunicarse con Mercado Pago.', details: errorData })
      };
    }

    const preference = await mpResponse.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      })
    };

  } catch (err) {
    console.error('Error en create-preference handler:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error interno del servidor.', message: err.message })
    };
  }
};
