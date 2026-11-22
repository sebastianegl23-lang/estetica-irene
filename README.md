# Estética Unisex Irene - Sistema Web Integral

Plataforma digital para **Estética Unisex Irene** que implementa la arquitectura y flujo del mecanismo de venta:
- **Consultar catálogo de productos** (con buscador, filtros de categorías, fotos, stock y precios).
- **Consultar disponibilidad de horario & Agendar cita** en tiempo real con selección de estilista.
- **Aviso de monto por pagar** transparente antes y durante la confirmación.
- **Cotizador de productos y servicios** interactivo con exportación directa a WhatsApp.
- **Confirmación por correo electrónico** (generación y simulación de comprobante HTML con folio).
- **Avisos continuos y actualizaciones** (promociones, horarios y novedades dinámicas).
- **Panel Administrativo completo** para agregar/editar/eliminar productos del catálogo, revisar citas agendadas, cambiar estados, consultar cotizaciones y revisar la bandeja de correos.

---

## 🚀 Inicio Rápido

### Requisitos
- Python 3.8 o superior (utiliza únicamente la librería estándar de Python: `http.server`, `sqlite3`, `json`, `urllib`). No requiere dependencias externas ni instalación con pip.

### Ejecutar el Servidor
En una terminal en la carpeta del proyecto:
```bash
python server.py
```

### URLs de Acceso
- **Portal de Clientes:** [http://localhost:8000/](http://localhost:8000/)
- **Panel de Administradores:** [http://localhost:8000/admin.html](http://localhost:8000/admin.html)

### Credenciales de Administrador
- **Contraseña:** `irene2026` (también acepta `admin123`)

---

## 📂 Estructura del Proyecto

```
estetica-irene/
├── server.py               # Servidor Web Threaded y API REST en Python
├── estetica_irene.db       # Base de datos SQLite relacional
├── README.md               # Documentación general
└── static/                 # Archivos estáticos
    ├── index.html          # Portal del cliente (Citas, Catálogo, Cotizador, Avisos)
    ├── admin.html          # Panel de administración (Productos, Citas, Métricas)
    ├── css/
    │   └── styles.css      # Estilos modernos y responsivos
    └── js/
        ├── app.js          # Lógica del cliente, agendador, disponibilidad y cotizador
        └── admin.js        # Lógica del dashboard de administración y CRUD
```

---

## 💡 Características Implementadas

### Para Clientes:
1. **Catálogo de Productos:**
   - Filtros por: Cuidado Capilar, Barbería & Caballero, Cuidado Facial, Uñas & Spa.
   - Búsqueda en tiempo real.
   - Indicadores de existencias en almacén (en stock / agotado).
   - Botón "+ Cotizar" para agregar directo al carrito/cotizador.
2. **Agendar Cita en 3 Pasos:**
   - Paso 1: Selección de servicio y estilista preferido.
   - Paso 2: Elección de fecha y consulta de horarios disponibles en vivo (evita empalmes).
   - Paso 3: Datos del cliente con desglose claro del **Aviso de Monto por Pagar**.
3. **Confirmación Digital Inmediata:**
   - Despliegue de Folio de cita (ej. `#IRENE-261122-105`).
   - Vista previa en pantalla del **Correo Electrónico de Confirmación**.
   - Enlace directo a WhatsApp con los datos formateados listos para enviar al negocio.
4. **Cotizador en Línea:**
   - Permite cotizar combinaciones de productos y servicios.
   - Envío de cotización formateada a WhatsApp o guardado en el servidor.
5. **Avisos Continuos:**
   - Sección de promociones del mes y avisos importantes.

### Para Administradores:
1. **Agregar y Gestionar Productos:**
   - Alta de productos con nombre, categoría, precio, stock, descripción y URL de imagen.
   - Edición de precios, existencias y fotos.
   - Eliminación de productos obsoletos.
2. **Revisar y Gestionar Citas:**
   - Listado completo con filtros por estado (*Pendiente, Confirmada, Completada, Cancelada*) y por fecha.
   - Cambio de estado en un clic.
   - Botón directo de WhatsApp para enviar recordatorio personalizado al cliente.
   - Opción para reenviar el correo de confirmación.
3. **Métricas en Vivo:**
   - Citas para el día de hoy, citas pendientes, total de productos y proyección de ingresos.
4. **Bandeja de Confirmaciones por Correo:**
   - Visualización de todos los correos generados con visor HTML.
5. **Gestor de Avisos y Servicios:**
   - Publicación de ofertas en la página principal y actualización de tarifas.
