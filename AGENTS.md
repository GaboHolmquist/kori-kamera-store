# Reglas del Agente — Kori Kamera Store

Este archivo define el comportamiento obligatorio del agente de IA para este proyecto.

---

## ⛔ Regla principal: NO hacer cambios sin aprobación explícita

**Antes de modificar cualquier archivo, el agente DEBE:**
1. Describir qué cambio va a hacer y por qué.
2. Esperar confirmación del usuario (respuesta afirmativa como "sí", "hazlo", "procede", etc.).
3. Solo entonces realizar el cambio.

Esto aplica a **todos** los archivos del proyecto sin excepción: HTML, CSS, JS, JSON, funciones backend, configuraciones, etc.

La única excepción son las operaciones de **solo lectura** (ver archivos, buscar código, analizar, generar informes), que pueden realizarse libremente.

---

## 🚀 Despliegue a producción (WEBUP)

El comando `git push` hacia el repositorio remoto (`origin main`) **solo** debe ejecutarse si el usuario lo solicita explícitamente con alguna de estas palabras clave:
- `WEBUP`
- `sube a produccion`
- `haz el deploy`
- `publica los cambios`

Si el usuario no usa una de esas frases, los cambios solo deben quedar en local.

---

## 🏠 Servidor local

- Para pruebas locales, levantar el servidor con: `python3 -m http.server 8000` desde el directorio del proyecto.
- Para cerrarlo, usar: `pkill -f "python3 -m http.server"` o confirmar que la tarea de fondo fue terminada.
- El agente NO debe levantar ni cerrar el servidor sin que el usuario lo pida.

---

## 📁 Estructura del proyecto

El proyecto vive en:
```
/Users/gabrielleholmquist/.gemini/antigravity/scratch/web-kori-kamera-store/
```

Ver `PROJECT_BRIEF.md` para el estado actual del proyecto.
