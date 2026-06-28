# Marcilla Academy - Portal de Pagos V2 👑

Aplicación web interna (SaaS) diseñada para los closers de Marcilla Academy. Desarrollada en Vanilla JS, enfocada en la velocidad, estética premium y usabilidad absoluta.

## 📂 Estructura del Proyecto

- `index.html`: Esqueleto principal de la SPA (Single Page Application).
- `style.css`: Toda la interfaz, paleta de colores y variables CSS responsivas.
- `app.js`: Cerebro de la aplicación (Manejo de estado, renderizado y tabs).
- `api.js`: Módulo de comunicación con Google Apps Script.
- `builders.js`: Funciones que construyen visualmente las tarjetas y botones.
- `utils.js`: Herramientas para formatear datos y controlar el portapapeles/toasts.

## 🔗 Cómo conectar Apps Script
El portal está diseñado para consumir **exactamente el mismo JSON** que la V1. La magia de la re-estructuración (Programa -> Moneda -> Plataforma) ocurre en el cliente mediante la función `Utils.transformDataToNewArchitecture`.

1. Abre `api.js`.
2. Reemplaza el valor de `API_URL` con tu URL actual de Google Apps Script.

## 🎨 Cómo cambiar colores
Toda la estética se controla mediante variables CSS.
Abre `style.css` y ve a la línea `2`.

Para cambiar el color de una moneda (Ej. Perú):
```css
--color-pen: #991b1b;