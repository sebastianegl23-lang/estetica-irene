# Estética Unisex Irene - PMV (Producto Mínimo Viable)

Plataforma digital para **Estética Unisex Irene** con citas en línea, catálogo de productos, cotizador, panel administrativo, integración con Google Analytics 4 y sistema de recopilación de datos (Encuesta de Validación del PMV).

🌐 **Enlace Público en GitHub Pages:**  
`https://sebastianegl23-lang.github.io/estetica-irene/`

🔐 **Acceso al Panel de Administración:**  
`https://sebastianegl23-lang.github.io/estetica-irene/admin.html`  
- **Contraseña:** `irene2026` (o `admin123`)

---

## 🚀 Cómo Activar GitHub Pages (1 Clic)

1. En tu repositorio de GitHub: [https://github.com/sebastianegl23-lang/estetica-irene](https://github.com/sebastianegl23-lang/estetica-irene)
2. Haz clic en la pestaña **Settings** (Configuración) arriba a la derecha.
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En **Build and deployment > Branch**:
   - Selecciona la rama: **`main`**
   - Selecciona la carpeta: **`/ (root)`**
5. Haz clic en **Save** (Guardar).
6. En 1 o 2 minutos, GitHub publicará tu sitio en:  
   👉 **`https://sebastianegl23-lang.github.io/estetica-irene/`**

---

## 📊 Cumplimiento de la Rúbrica: Inciso G

### 1. Publicación y Lanzamiento del PMV
- **Servicio gratuito utilizado:** GitHub Pages (con compatibilidad de almacenamiento local `localStorage` para pruebas desde cualquier celular, tablet o PC sin necesidad de backend).
- **Ejecución local alternativa:** También ejecutable con Python: `python server.py`.

### 2. Comprobación Multidispositivo
- Diseño 100% responsivo (CSS Grid y Flexbox adaptables a smartphones, tablets y pantallas de escritorio).
- Pruebas de navegación táctil para agendar citas y cotizar.

### 3. Configuración de Google Analytics 4 (GA4)
- La etiqueta de medición de GA4 está integrada en el `<head>` de `index.html` y `admin.html`:
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  ```
- Para conectar tus estadísticas reales, solo reemplaza `G-XXXXXXXXXX` con tu ID de medición obtenido en [Google Analytics](https://analytics.google.com/).

### 4. Recopilación de Datos y Encuesta de Validación
- Botón flotante interactivo: **"Encuesta del PMV"** accesible para cualquier usuario que visite el sitio.
- Evalúa:
  1. Facilidad y usabilidad de navegación (1 a 5 estrellas).
  2. Claridad del aviso de monto por pagar.
  3. Intención de uso del canal digital vs tradicional.
  4. Comentarios y sugerencias abiertas.
- **Visualización y Descarga:** El panel de administración cuenta con una pestaña **"Encuesta PMV (Datos)"** donde se pueden consultar todas las respuestas y descargarlas en formato **CSV** para el reporte final del proyecto.
