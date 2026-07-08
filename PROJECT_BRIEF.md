# PROJECT BRIEF — Kori Kamera Store

Sitio web de tienda y talleres de fotografía. Dominio: **korikamera.store**
Repositorio GitHub: `GaboHolmquist/kori-kamera-store`
Rama de producción: `main`

---

## Stack tecnológico

- **Frontend**: HTML + Vanilla CSS + JS (sin frameworks)
- **Fuentes**: Google Fonts (Outfit)
- **Backend / Funciones serverless**: Node.js
  - Para Vercel: `/api/create-preference.js`, `/api/payment-webhook.js`, `/api/get-stock.js`
  - Para Netlify: `/netlify/functions/create-preference.js`, etc.
- **Base de datos de productos**: archivos JSON en `/data/` (sin base de datos externa)
- **Pasarela de pago**: Mercado Pago (API REST, sin SDK de JS en el cliente)
- **Stock**: Upstash Redis (solo para el producto físico Matte Box)
- **CMS admin**: Decap CMS en `/admin/` (edición visual de talleres y portafolio)

---

## Variables de entorno requeridas (configuradas en el dashboard de hosting)

| Variable | Descripción |
|---|---|
| `MP_ACCESS_TOKEN` | Token de producción de Mercado Pago |
| `MP_WEBHOOK_SECRET` | Secret para validar webhooks de MP |
| `UPSTASH_REDIS_REST_URL` | URL de la instancia Redis (stock del Matte Box) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash |
| `BASE_URL` | `https://korikamera.store` |

⚠️ Estas variables NUNCA deben hardcodearse en ningún archivo del proyecto.

---

## Secciones del sitio

- **Home** (`index.html`): Landing principal con banner, productos y secciones
- **Productos / Catálogo**: Matte Box MKB-V4 y accesorios, con sistema de stock
- **Talleres** (`#talleres`): Tres talleres actuales (ver estado abajo)
- **Portafolio**: Galería de trabajos de los profesores
- **Gabo3DPrint**: Sección de accesorios impresos en 3D
- **Comparador** (`comparador.html`): Herramienta comparadora de cámaras
- **Pago exitoso / fallido**: Páginas de retorno de Mercado Pago

---

## Estado actual de los talleres (`data/workshops.json`)

| ID | Título | Precio | Estado |
|---|---|---|---|
| `TALLER_GRATUITO` | Taller Gratuito | $0 | `no_disponible` — botón dirige a WhatsApp de la comunidad |
| `TALLER_BASICO` | Taller de Fotografía Básico | $39.990 | Disponible para inscripción/pago |
| `TALLER_EXTENDIDO` | Taller de Fotografía Extendido | $129.990 | Disponible para inscripción/pago |

**Talleres archivados** (eliminados del JSON, no aparecen en el sitio):
- Taller de Iluminación para Reels
- Taller de Grabación con Teléfono

**Enlace WhatsApp Taller Gratuito**: `https://chat.whatsapp.com/GLzU9xIVu6I1pUn8GVLCay?mode=gi_t`

---

## Sistema de cupones de descuento

Los cupones se validan **únicamente en el backend** (no hay texto claro en el frontend).

| Cupón | Descuento |
|---|---|
| `Alumno10` | 10% sobre cualquier taller pago |
| `YessenTaller20` | 20% sobre cualquier taller pago |

- El campo de cupón aparece en el popup de inscripción de talleres.
- El frontend aplica el descuento visual usando verificación por string invertido (no se guarda el texto plano del cupón en el JS del cliente).
- El backend (`api/create-preference.js` y `netlify/functions/create-preference.js`) valida el cupón en texto claro antes de crear la preferencia en Mercado Pago.

---

## Flujo de compra de talleres

1. Usuario hace clic en "Inscribirse" en la tarjeta del taller.
2. Se abre un popup con nombre, Instagram, email y cupón (opcional).
3. Al confirmar, el frontend hace `POST /api/create-preference` con los datos.
4. El backend valida el cupón y crea la preferencia en Mercado Pago con el precio final.
5. El usuario es redirigido al checkout de Mercado Pago.
6. Al completar el pago, regresa a `/pago-exitoso.html`.

---

## Archivos clave

| Archivo | Descripción |
|---|---|
| `index.html` | Página principal |
| `js/main.js` | Toda la lógica del frontend |
| `css/styles.css` | Estilos principales |
| `data/workshops.json` | Datos de talleres (fuente de verdad) |
| `data/portfolio.json` | Datos del portafolio |
| `data/products.json` | Datos de productos físicos |
| `api/create-preference.js` | Endpoint Mercado Pago (Vercel) |
| `netlify/functions/create-preference.js` | Endpoint Mercado Pago (Netlify) |
| `admin/config.yml` | Configuración del CMS Decap |

---

## Comandos frecuentes

```bash
# Servidor local
python3 -m http.server 8000

# Cerrar servidor local
pkill -f "python3 -m http.server"

# Subir a producción
git add . && git commit -m "mensaje" && git push origin main
```
