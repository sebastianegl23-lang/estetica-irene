#!/usr/bin/env python3
"""
Estética Unisex Irene - Servidor Web & API REST
Sistema integral de Citas, Catálogo de Productos, Cotizador y Panel Administrativo.
"""

import http.server
import json
import os
import sqlite3
import sys
import urllib.parse
from datetime import datetime, timedelta

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "estetica_irene.db")
STATIC_DIR = BASE_DIR


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Tabla de productos
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 10,
            description TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tabla de servicios
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            duration_mins INTEGER DEFAULT 45,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tabla de especialistas / estilistas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialty TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        )
    """)

    # Tabla de citas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            client_phone TEXT NOT NULL,
            client_email TEXT NOT NULL,
            service_id INTEGER NOT NULL,
            staff_id INTEGER,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            total_amount REAL NOT NULL,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'Pendiente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (staff_id) REFERENCES staff(id)
        )
    """)

    # Tabla de cotizaciones
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            client_phone TEXT NOT NULL,
            client_email TEXT,
            items_json TEXT NOT NULL,
            total_amount REAL NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tabla de correos y avisos (Confirmaciones por correo)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            body_html TEXT NOT NULL,
            appointment_folio TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Entregado (Simulado)'
        )
    """)

    # Tabla de avisos continuos y actualizaciones
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            badge TEXT DEFAULT 'Novedad',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Sembrar datos iniciales si no existen
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()["count"] == 0:
        seed_products = [
            ("Shampoo Matizador Rubio Radiante 500ml", "Cuidado Capilar", 480.00, 15, "Fórmula profesional violeta que neutraliza visos amarillos y nutre el cabello teñido o decolorado.", "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=60"),
            ("Tratamiento Reparador Olaplex Hair Perfector", "Cuidado Capilar", 650.00, 12, "Reconstruye los enlaces rotos del cabello dañados por procesos químicos y térmicos.", "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60"),
            ("Aceite de Argán Puro Reestructurante 100ml", "Cuidado Capilar", 390.00, 18, "Aporta brillo sublime, suavidad de terciopelo y control de frizz sin sensación pesada.", "https://images.unsplash.com/photo-1608248597359-07b9737976fe?w=500&auto=format&fit=crop&q=60"),
            ("Mascarilla de Hidratación Profunda con Keratina", "Cuidado Capilar", 420.00, 14, "Tratamiento intensivo para cabellos secos o procesados con aminoácidos esenciales.", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60"),
            ("Cera Fijadora Mate para Caballero Elegance", "Barbería & Caballero", 230.00, 25, "Fijación fuerte y duradera con acabado natural mate sin residuos ni grasa.", "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60"),
            ("Aceite Nutritivo para Barba con Vitamina E", "Barbería & Caballero", 280.00, 20, "Humecta la piel bajo la barba, suaviza el vello facial y deja un aroma amaderado fresco.", "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=500&auto=format&fit=crop&q=60"),
            ("Serum Rejuvenecedor Vitamina C + Ácido Hialurónico", "Cuidado Facial", 490.00, 10, "Potente antioxidante que unifica el tono de piel, reduce líneas finas e ilumina el rostro.", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60"),
            ("Protector Solar Toque Seco FPS 50+ Facial", "Cuidado Facial", 390.00, 15, "Protección alta contra rayos UVA/UVB con textura ultra ligera de rápida absorción.", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60"),
            ("Esmalte Gel Semipermanente 21 Días Tono Rojo Pasión", "Uñas & Spa", 160.00, 30, "Larga duración con brillo espejo resistente a astilladuras para secado en lámpara UV/LED.", "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=60"),
            ("Aceite Regenerador para Cutículas Aroma Vainilla", "Uñas & Spa", 130.00, 22, "Nutre profundamente el nacimiento de las uñas manteniéndolas sanas e hidratadas.", "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&auto=format&fit=crop&q=60"),
            ("Protector Térmico Antifrizz L'Oréal Studio", "Cuidado Capilar", 350.00, 16, "Escudo protector hasta 230°C para uso de secadora, plancha y tenaza moldeadora.", "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=60"),
            ("Exfoliante Corporal y Facial de Café y Coco", "Cuidado Facial", 290.00, 12, "Remueve células muertas, estimula la circulación y deja la piel renovada y luminosa.", "https://images.unsplash.com/photo-1567928805192-d35d641494b8?w=500&auto=format&fit=crop&q=60")
        ]
        cursor.executemany("""
            INSERT INTO products (name, category, price, stock, description, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, seed_products)

    cursor.execute("SELECT COUNT(*) as count FROM services")
    if cursor.fetchone()["count"] == 0:
        seed_services = [
            ("Corte de Cabello Dama (Lavado y Peinado Express)", "Cortes", 280.00, 45, "Diagnóstico capilar personalizado, lavado relajante con masaje craneal, corte estilizado y peinado express."),
            ("Corte de Cabello Caballero & Perfilado", "Barbería", 180.00, 35, "Corte clásico o moderno degradado (fade), perfilado de contornos y aplicación de tónico refrescante."),
            ("Ritual Barba Clásica con Toalla Caliente", "Barbería", 220.00, 40, "Afeitado o perfilado profesional con vaporización de toalla caliente, aceites esenciales y loción balsámica."),
            ("Corte Infantil (Niña / Niño)", "Cortes", 160.00, 30, "Corte paciente y divertido adaptado a los más pequeños del hogar."),
            ("Tinte Global / Retoque de Raíz", "Colorimetría", 680.00, 90, "Aplicación de tinte profesional con cobertura 100% de canas, máxima protección y brillo duradero."),
            ("Efectos de Color: Balayage / Babylights / Ombré", "Colorimetría", 1650.00, 180, "Técnica avanzada de iluminación y degradado personalizado según tono de piel y estilo deseado."),
            ("Alaciado Permanente con Keratina Brasileña", "Tratamientos", 1350.00, 150, "Elimina 95% del frizz, reduce volumen y aporta brillo extremo hasta por 4 meses."),
            ("Botox Capilar Hidronutritivo", "Tratamientos", 580.00, 60, "Tratamiento rejuvenecedor que rellena la fibra capilar, recuperando grosor y elasticidad."),
            ("Manicure Spa con Esmaltado Semipermanente", "Uñas & Spa", 340.00, 50, "Limpieza completa, exfoliación aromática, masaje y aplicación de gelish 21 días."),
            ("Pedicure Clínico y Relajante Spa", "Uñas & Spa", 420.00, 60, "Hidromasaje en tina con sales relajantes, remoción de asperezas, exfoliación y esmaltado."),
            ("Peinado Social & Maquillaje Profesional", "Eventos & Belleza", 950.00, 90, "Look deslumbrante para eventos, bodas o graduaciones con fijación de larga duración."),
            ("Limpieza Facial Profunda con Hidratación Ultrasónica", "Cuidado Facial", 520.00, 60, "Extracción de impurezas, peeling suave ultrasónico, mascarilla nutritiva y fototerapia LED.")
        ]
        cursor.executemany("""
            INSERT INTO services (name, category, price, duration_mins, description)
            VALUES (?, ?, ?, ?, ?)
        """, seed_services)

    cursor.execute("SELECT COUNT(*) as count FROM staff")
    if cursor.fetchone()["count"] == 0:
        seed_staff = [
            ("Irene Mendoza", "Directora & Máster Estilista (Color y Tratamientos)"),
            ("Carlos Valdés", "Especialista en Barbería, Cortes Modernos y Texturizado"),
            ("Sofía Navarro", "Cosmetóloga & Máster en Uñas y Maquillaje"),
            ("Cualquier Profesional Disponible", "El estilista con mejor disponibilidad inmediata")
        ]
        cursor.executemany("""
            INSERT INTO staff (name, specialty)
            VALUES (?, ?)
        """, seed_staff)

    cursor.execute("SELECT COUNT(*) as count FROM announcements")
    if cursor.fetchone()["count"] == 0:
        seed_announcements = [
            ("¡Semana de Renovación Capilar!", "Obtén un 15% de descuento en Alaciados con Keratina y Botox Capilar agendando de Martes a Jueves.", "Descuento Especial"),
            ("Aviso de Citas para Fiestas y Graduaciones", "Recomendamos agendar tus servicios de peinado y maquillaje con 48 horas de anticipación para garantizar tu horario preferido.", "Recomendación"),
            ("Confirmación Digital Inmediata", "Recibe tu comprobante por correo electrónico y enlace directo de WhatsApp al agendar tu cita en nuestro portal.", "Servicio Digital")
        ]
        cursor.executemany("""
            INSERT INTO announcements (title, content, badge)
            VALUES (?, ?, ?)
        """, seed_announcements)

    # Añadir algunas citas de muestra si está vacío
    cursor.execute("SELECT COUNT(*) as count FROM appointments")
    if cursor.fetchone()["count"] == 0:
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        seed_appointments = [
            ("CITA-8421", "María Fernanda Torres", "5512345678", "mafer.torres@ejemplo.com", 1, 1, today, "10:00", 280.00, "Prefiere corte con degrafilado ligero", "Confirmada"),
            ("CITA-8422", "Alejandro Morales", "5587654321", "alex.morales@ejemplo.com", 2, 2, today, "11:30", 180.00, "Corte fade con perfilado de barba", "Pendiente"),
            ("CITA-8423", "Lucía Benítez", "5543219876", "lucia.b@ejemplo.com", 5, 1, tomorrow, "15:00", 680.00, "Retoque de tinte tono castaño rojizo", "Confirmada"),
            ("CITA-8424", "Valeria Gómez", "5598761234", "valeria.g@ejemplo.com", 9, 3, tomorrow, "16:30", 340.00, "Manicure gelish tono nude", "Pendiente")
        ]
        cursor.executemany("""
            INSERT INTO appointments (folio, client_name, client_phone, client_email, service_id, staff_id, appointment_date, appointment_time, total_amount, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_appointments)

    conn.commit()
    conn.close()


def generate_email_template(folio, client_name, service_name, staff_name, date, time, total_amount):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 6px solid #0d9488; }}
        .header {{ background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 30px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; }}
        .header p {{ margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }}
        .content {{ padding: 30px; color: #334155; line-height: 1.6; }}
        .folio-badge {{ display: inline-block; background: #f0fdfa; color: #0f766e; font-weight: bold; padding: 8px 16px; border-radius: 8px; border: 1px solid #ccfbf1; font-size: 16px; margin-bottom: 20px; }}
        .details-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .details-table td {{ padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }}
        .details-table td.label {{ color: #64748b; font-weight: 600; width: 40%; }}
        .details-table td.val {{ color: #0f172a; font-weight: 600; }}
        .total-box {{ background: #f8fafc; border: 1px dashed #0d9488; border-radius: 8px; padding: 15px; text-align: right; margin-top: 15px; }}
        .total-box span {{ font-size: 20px; color: #0f766e; font-weight: 800; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Estética Unisex Irene</h1>
          <p>Comprobante Oficial de Cita Agendada</p>
        </div>
        <div class="content">
          <p>Hola <strong>{client_name}</strong>,</p>
          <p>¡Tu cita ha sido registrada con éxito en nuestro sistema en línea! A continuación encuentras el resumen y el aviso de monto por pagar:</p>
          
          <div style="text-align: center;">
            <div class="folio-badge">Folio de Cita: #{folio}</div>
          </div>

          <table class="details-table">
            <tr>
              <td class="label">Servicio Agendado:</td>
              <td class="val">{service_name}</td>
            </tr>
            <tr>
              <td class="label">Especialista:</td>
              <td class="val">{staff_name}</td>
            </tr>
            <tr>
              <td class="label">Fecha:</td>
              <td class="val">{date}</td>
            </tr>
            <tr>
              <td class="label">Horario:</td>
              <td class="val">{time} hrs</td>
            </tr>
            <tr>
              <td class="label">Ubicación:</td>
              <td class="val">Av. Principal #102, Centro (Estética Unisex Irene)</td>
            </tr>
          </table>

          <div class="total-box">
            Aviso de monto por pagar al llegar: <span>${total_amount:.2f} MXN</span>
          </div>

          <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
            * Te sugerimos llegar con 5 a 10 minutos de anticipación. Si requieres cancelar o reprogramar, comunícate con nosotros vía WhatsApp.
          </p>
        </div>
        <div class="footer">
          <p>Estética Unisex Irene &copy; Todos los derechos reservados.</p>
          <p>Recibiste este correo automático porque registraste una cita en nuestra plataforma web.</p>
        </div>
      </div>
    </body>
    </html>
    """


class IreneRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for dynamic API responses
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Servir index.html y admin.html desde el root
        if path == "/" or path == "/index.html":
            file_path = os.path.join(STATIC_DIR, "index.html")
            return self.serve_file(file_path, "text/html; charset=utf-8")
        elif path == "/admin" or path == "/admin.html":
            file_path = os.path.join(STATIC_DIR, "admin.html")
            return self.serve_file(file_path, "text/html; charset=utf-8")

        # API Endpoints
        if path == "/api/products":
            return self.handle_get_products(query)
        elif path == "/api/services":
            return self.handle_get_services()
        elif path == "/api/staff":
            return self.handle_get_staff()
        elif path == "/api/availability":
            return self.handle_get_availability(query)
        elif path == "/api/appointments":
            return self.handle_get_appointments(query)
        elif path == "/api/quotes":
            return self.handle_get_quotes()
        elif path == "/api/announcements":
            return self.handle_get_announcements()
        elif path == "/api/admin/metrics":
            return self.handle_get_metrics()
        elif path == "/api/admin/email-logs":
            return self.handle_get_email_logs()

        # Si no es un endpoint de API, usar el comportamiento estándar de archivo estático
        return super().do_GET()

    def serve_file(self, full_path, content_type):
        if not os.path.exists(full_path):
            self.send_error(404, "Archivo no encontrado")
            return
        with open(full_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        data = self.read_json_body()

        if path == "/api/appointments":
            return self.handle_post_appointment(data)
        elif path == "/api/quotes":
            return self.handle_post_quote(data)
        elif path == "/api/products":
            return self.handle_post_product(data)
        elif path == "/api/services":
            return self.handle_post_service(data)
        elif path == "/api/announcements":
            return self.handle_post_announcement(data)
        elif path == "/api/admin/login":
            return self.handle_admin_login(data)
        elif path == "/api/notifications/send-reminder":
            return self.handle_send_reminder(data)
        else:
            self.send_json({"error": "Endpoint no encontrado"}, status=404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        data = self.read_json_body()

        if path.startswith("/api/appointments/") and path.endswith("/status"):
            parts = path.split("/")
            apt_id = parts[3]
            return self.handle_update_appointment_status(apt_id, data)
        elif path.startswith("/api/products/"):
            parts = path.split("/")
            prod_id = parts[3]
            return self.handle_put_product(prod_id, data)
        elif path.startswith("/api/services/"):
            parts = path.split("/")
            serv_id = parts[3]
            return self.handle_put_service(serv_id, data)
        else:
            self.send_json({"error": "Endpoint no encontrado"}, status=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/products/"):
            parts = path.split("/")
            prod_id = parts[3]
            return self.handle_delete_product(prod_id)
        elif path.startswith("/api/appointments/"):
            parts = path.split("/")
            apt_id = parts[3]
            return self.handle_delete_appointment(apt_id)
        elif path.startswith("/api/services/"):
            parts = path.split("/")
            serv_id = parts[3]
            return self.handle_delete_service(serv_id)
        elif path.startswith("/api/announcements/"):
            parts = path.split("/")
            ann_id = parts[3]
            return self.handle_delete_announcement(ann_id)
        else:
            self.send_json({"error": "Endpoint no encontrado"}, status=404)

    # ---------------- HANDLERS ---------------- #

    def handle_get_products(self, query):
        conn = get_db()
        cursor = conn.cursor()
        category = query.get("category", [None])[0]
        search = query.get("search", [None])[0]

        sql = "SELECT * FROM products WHERE 1=1"
        params = []
        if category and category != "Todos":
            sql += " AND category = ?"
            params.append(category)
        if search:
            sql += " AND (name LIKE ? OR description LIKE ?)"
            params.append(f"%{search}%")
            params.append(f"%{search}%")

        sql += " ORDER BY id DESC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        products = [dict(row) for row in rows]
        conn.close()
        self.send_json({"success": True, "products": products})

    def handle_get_services(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services ORDER BY category, price ASC")
        rows = cursor.fetchall()
        services = [dict(row) for row in rows]
        conn.close()
        self.send_json({"success": True, "services": services})

    def handle_get_staff(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM staff WHERE is_active = 1")
        rows = cursor.fetchall()
        staff = [dict(row) for row in rows]
        conn.close()
        self.send_json({"success": True, "staff": staff})

    def handle_get_announcements(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM announcements WHERE is_active = 1 ORDER BY id DESC")
        rows = cursor.fetchall()
        announcements = [dict(row) for row in rows]
        conn.close()
        self.send_json({"success": True, "announcements": announcements})

    def handle_get_availability(self, query):
        date_str = query.get("date", [datetime.now().strftime("%Y-%m-%d")])[0]
        staff_id = query.get("staff_id", [None])[0]

        # Horas disponibles entre 09:00 y 19:00 (intervalos de 1 hora)
        all_slots = [
            "09:00", "10:00", "11:00", "12:00", "13:00",
            "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
        ]

        conn = get_db()
        cursor = conn.cursor()
        sql = "SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != 'Cancelada'"
        params = [date_str]
        if staff_id and staff_id != "all":
            sql += " AND staff_id = ?"
            params.append(staff_id)

        cursor.execute(sql, params)
        busy_times = {row["appointment_time"] for row in cursor.fetchall()}
        conn.close()

        slots = []
        for slot in all_slots:
            slots.append({
                "time": slot,
                "available": slot not in busy_times
            })

        self.send_json({"date": date_str, "slots": slots})

    def handle_get_appointments(self, query):
        conn = get_db()
        cursor = conn.cursor()
        status = query.get("status", [None])[0]
        date_filter = query.get("date", [None])[0]

        sql = """
            SELECT a.*, s.name as service_name, s.duration_mins, st.name as staff_name
            FROM appointments a
            LEFT JOIN services s ON a.service_id = s.id
            LEFT JOIN staff st ON a.staff_id = st.id
            WHERE 1=1
        """
        params = []
        if status and status != "Todos":
            sql += " AND a.status = ?"
            params.append(status)
        if date_filter:
            sql += " AND a.appointment_date = ?"
            params.append(date_filter)

        sql += " ORDER BY a.appointment_date DESC, a.appointment_time ASC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        appointments = [dict(row) for row in rows]
        conn.close()
        self.send_json({"success": True, "appointments": appointments})

    def handle_post_appointment(self, data):
        # Validar campos obligatorios
        client_name = data.get("client_name", "").strip()
        client_phone = data.get("client_phone", "").strip()
        client_email = data.get("client_email", "").strip()
        service_id = data.get("service_id")
        staff_id = data.get("staff_id") or 1
        appointment_date = data.get("appointment_date")
        appointment_time = data.get("appointment_time")
        notes = data.get("notes", "")

        if not all([client_name, client_phone, client_email, service_id, appointment_date, appointment_time]):
            return self.send_json({"success": False, "error": "Todos los campos principales son obligatorios"}, status=400)

        conn = get_db()
        cursor = conn.cursor()

        # Obtener datos del servicio
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        service = cursor.fetchone()
        if not service:
            conn.close()
            return self.send_json({"success": False, "error": "Servicio no válido"}, status=400)

        total_amount = float(service["price"])

        # Obtener staff
        cursor.execute("SELECT name FROM staff WHERE id = ?", (staff_id,))
        staff_row = cursor.fetchone()
        staff_name = staff_row["name"] if staff_row else "Estilista Asignado"

        # Verificar si la hora ya fue tomada
        cursor.execute("""
            SELECT id FROM appointments 
            WHERE appointment_date = ? AND appointment_time = ? AND staff_id = ? AND status != 'Cancelada'
        """, (appointment_date, appointment_time, staff_id))
        if cursor.fetchone():
            conn.close()
            return self.send_json({"success": False, "error": "Este horario ya ha sido reservado. Por favor elige otra hora u otro estilista."}, status=409)

        # Generar folio único
        folio = f"IRENE-{datetime.now().strftime('%y%m%d')}-{cursor.execute('SELECT COUNT(*) FROM appointments').fetchone()[0] + 101}"

        cursor.execute("""
            INSERT INTO appointments (folio, client_name, client_phone, client_email, service_id, staff_id, appointment_date, appointment_time, total_amount, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
        """, (folio, client_name, client_phone, client_email, service_id, staff_id, appointment_date, appointment_time, total_amount, notes))
        apt_id = cursor.lastrowid

        # Simular y registrar envío de correo de confirmación (Paso "Confirmación por correo" del diagrama)
        email_html = generate_email_template(folio, client_name, service["name"], staff_name, appointment_date, appointment_time, total_amount)
        subject = f"Confirmación de Cita #{folio} - Estética Unisex Irene"
        cursor.execute("""
            INSERT INTO email_logs (recipient, subject, body_html, appointment_folio, status)
            VALUES (?, ?, ?, ?, 'Entregado con éxito')
        """, (client_email, subject, email_html, folio))

        conn.commit()
        conn.close()

        # Generar texto para WhatsApp
        wa_text = urllib.parse.quote(
            f"¡Hola Estética Irene! Acabo de agendar una cita en línea.\n"
            f"Folio: #{folio}\n"
            f"Cliente: {client_name}\n"
            f"Servicio: {service['name']}\n"
            f"Fecha: {appointment_date} a las {appointment_time} hrs\n"
            f"Monto estimado por pagar: ${total_amount:.2f} MXN"
        )
        wa_url = f"https://api.whatsapp.com/send?phone=525512345678&text={wa_text}"

        self.send_json({
            "success": True,
            "message": "Cita agendada exitosamente",
            "appointment": {
                "id": apt_id,
                "folio": folio,
                "client_name": client_name,
                "client_phone": client_phone,
                "client_email": client_email,
                "service_name": service["name"],
                "staff_name": staff_name,
                "date": appointment_date,
                "time": appointment_time,
                "total_amount": total_amount,
                "status": "Pendiente"
            },
            "email_preview": {
                "recipient": client_email,
                "subject": subject,
                "body_html": email_html
            },
            "whatsapp_url": wa_url
        })

    def handle_post_quote(self, data):
        client_name = data.get("client_name", "Cliente").strip()
        client_phone = data.get("client_phone", "").strip()
        client_email = data.get("client_email", "").strip()
        items = data.get("items", [])
        notes = data.get("notes", "")

        if not items:
            return self.send_json({"success": False, "error": "No hay elementos seleccionados para cotizar"}, status=400)

        total_amount = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in items)
        folio = f"COT-{datetime.now().strftime('%m%d%H%M')}"

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO quotes (folio, client_name, client_phone, client_email, items_json, total_amount, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (folio, client_name, client_phone, client_email, json.dumps(items, ensure_ascii=False), total_amount, notes))
        quote_id = cursor.lastrowid
        conn.commit()
        conn.close()

        items_summary = "\n".join([f"- {it['name']} x{it.get('quantity', 1)}: ${float(it['price'])*int(it.get('quantity', 1)):.2f}" for it in items])
        wa_text = urllib.parse.quote(
            f"¡Hola Estética Irene! Quisiera cotizar los siguientes productos/servicios:\n"
            f"Folio Cotización: #{folio}\n"
            f"Cliente: {client_name}\n"
            f"Detalles:\n{items_summary}\n"
            f"Total Cotizado: ${total_amount:.2f} MXN"
        )
        wa_url = f"https://api.whatsapp.com/send?phone=525512345678&text={wa_text}"

        self.send_json({
            "success": True,
            "folio": folio,
            "total_amount": total_amount,
            "whatsapp_url": wa_url
        })

    def handle_get_quotes(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quotes ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
        quotes = []
        for r in rows:
            q = dict(r)
            try:
                q["items"] = json.loads(q["items_json"])
            except Exception:
                q["items"] = []
            quotes.append(q)
        conn.close()
        self.send_json({"success": True, "quotes": quotes})

    def handle_post_product(self, data):
        name = data.get("name", "").strip()
        category = data.get("category", "Cuidado Capilar").strip()
        price = float(data.get("price", 0))
        stock = int(data.get("stock", 0))
        description = data.get("description", "").strip()
        image_url = data.get("image_url", "").strip() or "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60"

        if not name or price <= 0:
            return self.send_json({"success": False, "error": "Nombre y precio válido son obligatorios"}, status=400)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, category, price, stock, description, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, category, price, stock, description, image_url))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.send_json({"success": True, "message": "Producto creado con éxito", "id": new_id})

    def handle_put_product(self, prod_id, data):
        name = data.get("name", "").strip()
        category = data.get("category", "Cuidado Capilar").strip()
        price = float(data.get("price", 0))
        stock = int(data.get("stock", 0))
        description = data.get("description", "").strip()
        image_url = data.get("image_url", "").strip()

        if not name or price <= 0:
            return self.send_json({"success": False, "error": "Nombre y precio son obligatorios"}, status=400)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE products 
            SET name = ?, category = ?, price = ?, stock = ?, description = ?, image_url = ?
            WHERE id = ?
        """, (name, category, price, stock, description, image_url, prod_id))
        conn.commit()
        conn.close()

        self.send_json({"success": True, "message": "Producto actualizado"})

    def handle_delete_product(self, prod_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (prod_id,))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Producto eliminado"})

    def handle_post_service(self, data):
        name = data.get("name", "").strip()
        category = data.get("category", "Cortes").strip()
        price = float(data.get("price", 0))
        duration = int(data.get("duration_mins", 45))
        desc = data.get("description", "").strip()

        if not name or price <= 0:
            return self.send_json({"success": False, "error": "Nombre y precio requeridos"}, status=400)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO services (name, category, price, duration_mins, description)
            VALUES (?, ?, ?, ?, ?)
        """, (name, category, price, duration, desc))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()
        self.send_json({"success": True, "id": new_id})

    def handle_put_service(self, serv_id, data):
        name = data.get("name", "").strip()
        category = data.get("category", "Cortes").strip()
        price = float(data.get("price", 0))
        duration = int(data.get("duration_mins", 45))
        desc = data.get("description", "").strip()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE services 
            SET name = ?, category = ?, price = ?, duration_mins = ?, description = ?
            WHERE id = ?
        """, (name, category, price, duration, desc, serv_id))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Servicio actualizado"})

    def handle_delete_service(self, serv_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM services WHERE id = ?", (serv_id,))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Servicio eliminado"})

    def handle_update_appointment_status(self, apt_id, data):
        new_status = data.get("status", "Confirmada")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (new_status, apt_id))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": f"Estado de cita actualizado a {new_status}"})

    def handle_delete_appointment(self, apt_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM appointments WHERE id = ?", (apt_id,))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Cita eliminada"})

    def handle_post_announcement(self, data):
        title = data.get("title", "").strip()
        content = data.get("content", "").strip()
        badge = data.get("badge", "Aviso").strip()
        if not title or not content:
            return self.send_json({"success": False, "error": "Título y contenido requeridos"}, status=400)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO announcements (title, content, badge) VALUES (?, ?, ?)", (title, content, badge))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()
        self.send_json({"success": True, "id": new_id})

    def handle_delete_announcement(self, ann_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM announcements WHERE id = ?", (ann_id,))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Aviso eliminado"})

    def handle_admin_login(self, data):
        password = data.get("password", "")
        # Contraseña del sistema
        if password in ["irene2026", "admin123", "irene"]:
            self.send_json({"success": True, "token": "irene_admin_session_valid", "role": "admin"})
        else:
            self.send_json({"success": False, "error": "Contraseña de administrador incorrecta (prueba: irene2026)"}, status=401)

    def handle_send_reminder(self, data):
        client_email = data.get("email")
        folio = data.get("folio")
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT a.*, s.name as service_name, st.name as staff_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN staff st ON a.staff_id = st.id WHERE a.folio = ?", (folio,))
        apt = cursor.fetchone()
        if not apt:
            conn.close()
            return self.send_json({"success": False, "error": "Cita no encontrada"}, status=404)

        html = generate_email_template(apt["folio"], apt["client_name"], apt["service_name"], apt["staff_name"], apt["appointment_date"], apt["appointment_time"], apt["total_amount"])
        cursor.execute("""
            INSERT INTO email_logs (recipient, subject, body_html, appointment_folio, status)
            VALUES (?, ?, ?, ?, 'Recordatorio Enviado')
        """, (client_email or apt["client_email"], f"Recordatorio de Cita #{apt['folio']} - Estética Irene", html, apt["folio"]))
        conn.commit()
        conn.close()
        self.send_json({"success": True, "message": "Recordatorio enviado por correo (simulado)"})

    def handle_get_metrics(self):
        conn = get_db()
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")

        cursor.execute("SELECT COUNT(*) FROM appointments WHERE appointment_date = ?", (today,))
        today_apts = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Pendiente'")
        pending_apts = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products WHERE stock <= 5")
        low_stock = cursor.fetchone()[0]

        cursor.execute("SELECT COALESCE(SUM(total_amount), 0) FROM appointments WHERE status != 'Cancelada'")
        projected_revenue = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM quotes")
        total_quotes = cursor.fetchone()[0]

        conn.close()
        self.send_json({
            "today_appointments": today_apts,
            "pending_appointments": pending_apts,
            "total_products": total_products,
            "low_stock_products": low_stock,
            "projected_revenue": projected_revenue,
            "total_quotes": total_quotes
        })

    def handle_get_email_logs(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM email_logs ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
        emails = [dict(r) for r in rows]
        conn.close()
        self.send_json({"success": True, "emails": emails})


def run_server():
    init_db()
    server_address = ("0.0.0.0", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, IreneRequestHandler)
    print(f"================================================================")
    print(f" Servidor de Estética Unisex Irene iniciado con éxito!")
    print(f" URL Cliente:  http://localhost:{PORT}/")
    print(f" URL Admin:    http://localhost:{PORT}/admin.html")
    print(f" Presione Ctrl+C para detener el servidor.")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
