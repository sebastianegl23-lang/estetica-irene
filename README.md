# Estética Unisex Irene - PMV (Producto Mínimo Viable)

Plataforma digital para **Estética Unisex Irene** con citas en línea, catálogo de productos, cotizador, panel administrativo, integración con Google Analytics 4 y sistema de recopilación de datos (Encuesta de Validación del PMV).

🌐 **Enlace Público en GitHub Pages:**  
`https://sebastianegl23-lang.github.io/estetica-irene/`


Cómo Activar GitHub Pages (1 Clic)

1. En tu repositorio de GitHub: [https://github.com/sebastianegl23-lang/estetica-irene](https://github.com/sebastianegl23-lang/estetica-irene)
2. Haz clic en la pestaña **Settings** (Configuración) arriba a la derecha.
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En **Build and deployment > Branch**:
   - Selecciona la rama: **`main`**
   - Selecciona la carpeta: **`/ (root)`**
5. Haz clic en **Save** (Guardar).
6. En 1 o 2 minutos, GitHub publicará tu sitio en:  
**`https://sebastianegl23-lang.github.io/estetica-irene/`**

---

Cumplimiento de la Rúbrica: Inciso G

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
- **Encuesta Oficial en Google Forms:** [https://forms.gle/UmgKvbkTxQmPfpWo6](https://forms.gle/UmgKvbkTxQmPfpWo6)
- **Botón flotante interactivo en la web:** Redirige directamente al formulario de Google Forms para que los usuarios del segmento de prueba respondan voluntariamente.
- **Acceso desde Panel de Administración:** Incluye enlace directo al formulario y a la visualización de respuestas para el análisis y reporte de validación del PMV.
