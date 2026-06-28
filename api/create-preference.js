import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Permitir solo peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    // Vercel pre-parsea el body si el content-type es application/json
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      name,
      phone,
      email = '',
      instagram = '',
      activeProduct = 'MATTEBOX',
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
 
    const dataFilePath = path.join(process.cwd(), 'data', 'workshops.json');
    let workshops = [];
    try {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      const parsedData = JSON.parse(fileContent);
      workshops = parsedData.workshops || [];
    } catch (err) {
      console.error("Error reading workshops.json in backend:", err);
    }
    const wsProduct = workshops.find(w => w.id === activeProduct);
    const isWorkshop = !!wsProduct;
 
    // Validación mínima
    if (!name || (!isWorkshop && !phone)) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios.' });
    }
 
    // Sanitizar campos de entrada básicos
    const cleanName = String(name).slice(0, 100).replace(/[<>]/g, '').trim();
    const cleanPhone = phone ? String(phone).slice(0, 30).replace(/[<>]/g, '').trim() : '';
    const cleanColor = String(color).slice(0, 50).toUpperCase().trim();
 
    // Validar stock en Upstash Redis para compras reales (solo para Matte Box)
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
 
    if (!isWorkshop && url && token) {
      try {
        const stockResponse = await fetch(`${url}/get/stock`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          const currentStock = stockData.result !== null ? parseInt(stockData.result, 10) : 10;
          if (currentStock <= 0) {
            return res.status(400).json({ error: 'Lo sentimos, el producto se encuentra temporalmente sin stock.' });
          }
        }
      } catch (stockErr) {
        console.error('Error al validar stock en checkout, continuando:', stockErr);
      }
    }
 
    const items = [];
 
    if (isWorkshop) {
      items.push({
        title: wsProduct.mpName || wsProduct.title,
        quantity: 1,
        unit_price: wsProduct.price,
        currency_id: 'CLP'
      });
    } else {
      // Definición de precios reales
      const basePrice = 74990;
      const reducersPrice = 20000;
      const adapterPrice = 15000;
      const customAdapterPrice = 8000;
      const engravingPriceVal = 8000;
 
      // Ítem base
      const productTitle = `Matte Box MKB-V4 - ${cleanColor} - ${cleanName}`;
 
      items.push({
        title: productTitle,
        quantity: 1,
        unit_price: basePrice,
        currency_id: 'CLP'
      });

    // Extras
    if (reducers) {
      items.push({
        title: "Kit reductores de filtros (77mm a 37mm)",
        quantity: 1,
        unit_price: reducersPrice,
        currency_id: 'CLP'
      });
    }

    if (adapter) {
      items.push({
        title: "Adaptador 4x5 a filtros redondos 77mm",
        quantity: 1,
        unit_price: adapterPrice,
        currency_id: 'CLP'
      });
    }

    if (customAdapter) {
      const mm = customAdapterDetails.mm || '';
      const lens = customAdapterDetails.lens || '';
      const cleanMm = String(mm).slice(0, 50).replace(/[<>]/g, '').trim();
      const cleanLens = String(lens).slice(0, 100).replace(/[<>]/g, '').trim();
      const desc = [cleanMm ? `${cleanMm}mm` : '', cleanLens].filter(Boolean).join(' — ');
      items.push({
        title: `Adaptador personalizado: ${desc || 'Detalles por coordinar'}`,
        quantity: 1,
        unit_price: customAdapterPrice,
        currency_id: 'CLP'
      });
    }

    const engravingFree = reducers && adapter;
    if (engraving) {
      const cleanEngravingText = String(engravingText).slice(0, 100).replace(/[<>]/g, '').trim();
      items.push({
        title: `Grabado personalizado: "${cleanEngravingText || 'Pendiente'}"` + (engravingFree ? ' (Gratis)' : ''),
        quantity: 1,
        unit_price: engravingFree ? 0 : engravingPriceVal,
        currency_id: 'CLP'
      });
    }

    // Validación de método de envío y costo
    const allowedShippingMethods = ['Bluexpress', 'Express', 'Retiro Metro Ecuador o Tobalaba'];
    if (!allowedShippingMethods.includes(shippingMethod)) {
      return res.status(400).json({ error: 'Método de envío no válido.' });
    }

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
  }

    // Verificar token en las variables de entorno
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Falta la variable de entorno MP_ACCESS_TOKEN');
      return res.status(500).json({ error: 'Configuración del servidor incompleta (falta MP_ACCESS_TOKEN).' });
    }

    // Obtener URL base segura
    const baseUrl = process.env.BASE_URL || 'https://korikamera.store';

    // Construir la preferencia de Mercado Pago
    const rawDigits = cleanPhone ? cleanPhone.replace(/\D/g, '') : '';
    const phoneArea = rawDigits.startsWith('56') ? '56' : '';
    const phoneNumber = rawDigits.startsWith('56') ? rawDigits.slice(2) : rawDigits;
 
    const mpPreferenceBody = {
      items: items,
      payer: {
        name: cleanName,
        email: email ? String(email).slice(0, 100).replace(/[<>]/g, '').trim() : undefined,
        phone: cleanPhone ? {
          area_code: phoneArea,
          number: phoneNumber
        } : undefined
      },
      back_urls: {
        success: `${baseUrl}/pago-exitoso.html`,
        failure: `${baseUrl}/pago-fallido.html`,
        pending: `${baseUrl}/pago-exitoso.html`
      },
      auto_return: 'approved',
      metadata: {
        active_product: activeProduct,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        customer_instagram: instagram ? String(instagram).slice(0, 100).replace(/[<>]/g, '').trim() : '',
        customer_email: email ? String(email).slice(0, 100).replace(/[<>]/g, '').trim() : '',
        color: cleanColor,
        reducers: !!reducers,
        adapter: !!adapter,
        custom_adapter: !!customAdapter,
        custom_adapter_mm: String(customAdapterDetails.mm || '').slice(0, 50).replace(/[<>]/g, '').trim(),
        custom_adapter_lens: String(customAdapterDetails.lens || '').slice(0, 100).replace(/[<>]/g, '').trim(),
        engraving: !!engraving,
        engraving_text: String(engravingText || '').slice(0, 100).replace(/[<>]/g, '').trim(),
        shipping_method: shippingMethod,
        invoice_needed: !!invoice,
        invoice_company: String(invoiceDetails.company || '').slice(0, 100).replace(/[<>]/g, '').trim(),
        invoice_rut: String(invoiceDetails.rut || '').slice(0, 30).replace(/[<>]/g, '').trim(),
        invoice_business: String(invoiceDetails.business || '').slice(0, 100).replace(/[<>]/g, '').trim(),
        invoice_address: String(invoiceDetails.address || '').slice(0, 200).replace(/[<>]/g, '').trim()
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
      return res.status(502).json({ error: 'Error al comunicarse con la pasarela de pagos.' });
    }

    const preference = await mpResponse.json();

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });

  } catch (err) {
    console.error('Error en create-preference handler:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
