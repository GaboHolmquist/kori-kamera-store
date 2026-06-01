// Trigger Netlify rebuild with new production environment variables
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
      placeholder1, // unused
      adapter = false,
      customAdapter = false,
      customAdapterDetails = {},
      engraving = false,
      engravingText = '',
      shippingMethod = 'Bluexpress',
      invoice = false,
      invoiceDetails = {},
      testMode = false,
      activeProduct = 'MATTEBOX'
    } = data;

    // Validación mínima
    if (!name || !phone) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Nombre y teléfono son obligatorios.' })
      };
    }

    // Identificar el producto
    const isTP1 = activeProduct === 'TP1';

    // Validar stock en Upstash Redis para compras reales
    if (!isTP1) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (url && token) {
        try {
          const stockResponse = await fetch(`${url}/get/stock`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (stockResponse.ok) {
            const stockData = await stockResponse.json();
            const currentStock = stockData.result !== null ? parseInt(stockData.result, 10) : 10;
            if (currentStock <= 0) {
              return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Lo sentimos, el producto se encuentra temporalmente sin stock.' })
              };
            }
          }
        } catch (stockErr) {
          console.error('Error al validar stock en checkout, continuando:', stockErr);
        }
      }
    }

    // Definición de precios (dinámico según testMode y producto)
    const basePrice = isTP1 ? 100 : (testMode ? 100 : 89990);
    const reducersPrice = isTP1 ? 0 : (testMode ? 1 : 20000);
    const adapterPrice = isTP1 ? 0 : (testMode ? 1 : 15000);
    const customAdapterPrice = isTP1 ? 0 : (testMode ? 1 : 8000);
    const engravingPriceVal = isTP1 ? 0 : (testMode ? 1 : 8000);

    const items = [];

    // Ítem base
    const testLabel = testMode ? ' [PRUEBA]' : '';
    const productTitle = isTP1 
      ? `Foot Rig TP1 - Estándar - ${name}`
      : `Matte Box MKB-V4 - ${color.toUpperCase()} - ${name}${testLabel}`;

    items.push({
      title: productTitle,
      quantity: 1,
      unit_price: basePrice,
      currency_id: 'CLP'
    });

    // Extras (solo si no es TP1)
    if (!isTP1) {
      if (reducers) {
        items.push({
          title: "Kit reductores de filtros (77mm a 37mm)" + (testMode ? ' [PRUEBA]' : ''),
          quantity: 1,
          unit_price: reducersPrice,
          currency_id: 'CLP'
        });
      }

      if (adapter) {
        items.push({
          title: "Adaptador 4x5 a filtros redondos 77mm" + (testMode ? ' [PRUEBA]' : ''),
          quantity: 1,
          unit_price: adapterPrice,
          currency_id: 'CLP'
        });
      }

      if (customAdapter) {
        const mm = customAdapterDetails.mm || '';
        const lens = customAdapterDetails.lens || '';
        const desc = [mm ? `${mm}mm` : '', lens].filter(Boolean).join(' — ');
        items.push({
          title: `Adaptador personalizado: ${desc || 'Detalles por coordinar'}` + (testMode ? ' [PRUEBA]' : ''),
          quantity: 1,
          unit_price: customAdapterPrice,
          currency_id: 'CLP'
        });
      }

      const engravingFree = !testMode && (reducers && adapter);
      if (engraving) {
        items.push({
          title: `Grabado personalizado: "${engravingText || 'Pendiente'}"` + (engravingFree ? ' (Gratis)' : '') + (testMode ? ' [PRUEBA]' : ''),
          quantity: 1,
          unit_price: engravingFree ? 0 : engravingPriceVal,
          currency_id: 'CLP'
        });
      }
    }

    // Costo de envío (gratis/coordinado para TP1 para que el total real sea exactamente $100 CLP)
    let shippingCost = 0;
    if (!isTP1) {
      if (shippingMethod === 'Bluexpress') {
        shippingCost = testMode ? 1 : 5990;
      } else if (shippingMethod === 'Express') {
        shippingCost = testMode ? 1 : 9990;
      } else if (shippingMethod === 'Retiro Metro Ecuador o Tobalaba') {
        shippingCost = 0;
      }
    }

    if (shippingCost > 0) {
      items.push({
        title: `Envío: ${shippingMethod}` + (testMode ? ' [PRUEBA]' : ''),
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
        invoice_address: invoiceDetails.address || '',
        test_mode: testMode
      },
      statement_descriptor: "KORI KAMERA STORE",
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
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

    const preference = await mpResponse.ok ? await mpResponse.json() : null;

    if (!preference) {
      throw new Error('No se pudo decodificar la preferencia de Mercado Pago.');
    }

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
