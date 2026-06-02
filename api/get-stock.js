export default async function handler(req, res) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.error('Falta configuración de Upstash Redis en variables de entorno.');
      return res.status(500).json({ error: 'Configuración de base de datos incompleta.' });
    }

    const response = await fetch(`${url}/get/stock`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Upstash API respondió con código ${response.status}`);
    }

    const data = await response.json();
    
    // Si la clave 'stock' no está configurada aún en Redis, asumimos 10 por defecto
    let stock = data.result !== null ? parseInt(data.result, 10) : 10;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({ stock: stock });
  } catch (err) {
    console.error('Error en get-stock:', err);
    return res.status(500).json({ error: 'Error interno al consultar stock.', message: err.message });
  }
}
