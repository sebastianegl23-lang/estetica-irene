/**
 * Estética Unisex Irene - Frontend Client Application
 * Compatible tanto con Servidor Local (Python REST API)
 * como con GitHub Pages (Client-side Storage y Simulación en Vivo)
 */

// Datos semilla para funcionamiento estático en GitHub Pages
const SEED_DATA = {
  products: [
    { id: 1, name: "Shampoo Matizador Rubio Radiante 500ml", category: "Cuidado Capilar", price: 480.00, stock: 15, description: "Fórmula profesional violeta que neutraliza visos amarillos y nutre el cabello teñido o decolorado.", image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=60" },
    { id: 2, name: "Tratamiento Reparador Olaplex Hair Perfector", category: "Cuidado Capilar", price: 650.00, stock: 12, description: "Reconstruye los enlaces rotos del cabello dañados por procesos químicos y térmicos.", image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60" },
    { id: 3, name: "Aceite de Argán Puro Reestructurante 100ml", category: "Cuidado Capilar", price: 390.00, stock: 18, description: "Aporta brillo sublime, suavidad de terciopelo y control de frizz sin sensación pesada.", image_url: "https://images.unsplash.com/photo-1608248597359-07b9737976fe?w=500&auto=format&fit=crop&q=60" },
    { id: 4, name: "Mascarilla de Hidratación Profunda con Keratina", category: "Cuidado Capilar", price: 420.00, stock: 14, description: "Tratamiento intensivo para cabellos secos o procesados con aminoácidos esenciales.", image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
    { id: 5, name: "Cera Fijadora Mate para Caballero Elegance", category: "Barbería & Caballero", price: 230.00, stock: 25, description: "Fijación fuerte y duradera con acabado natural mate sin residuos ni grasa.", image_url: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60" },
    { id: 6, name: "Aceite Nutritivo para Barba con Vitamina E", category: "Barbería & Caballero", price: 280.00, stock: 20, description: "Humecta la piel bajo la barba, suaviza el vello facial y deja un aroma amaderado fresco.", image_url: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=500&auto=format&fit=crop&q=60" },
    { id: 7, name: "Serum Rejuvenecedor Vitamina C + Ácido Hialurónico", category: "Cuidado Facial", price: 490.00, stock: 10, description: "Potente antioxidante que unifica el tono de piel, reduce líneas finas e ilumina el rostro.", image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60" },
    { id: 8, name: "Protector Solar Toque Seco FPS 50+ Facial", category: "Cuidado Facial", price: 390.00, stock: 15, description: "Protección alta contra rayos UVA/UVB con textura ultra ligera de rápida absorción.", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60" },
    { id: 9, name: "Esmalte Gel Semipermanente 21 Días Rojo Pasión", category: "Uñas & Spa", price: 160.00, stock: 30, description: "Larga duración con brillo espejo resistente a astilladuras para secado en lámpara UV/LED.", image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=60" },
    { id: 10, name: "Aceite Regenerador para Cutículas Aroma Vainilla", category: "Uñas & Spa", price: 130.00, stock: 22, description: "Nutre profundamente el nacimiento de las uñas manteniéndolas sanas e hidratadas.", image_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&auto=format&fit=crop&q=60" },
    { id: 11, name: "Protector Térmico Antifrizz L'Oréal Studio", category: "Cuidado Capilar", price: 350.00, stock: 16, description: "Escudo protector hasta 230°C para uso de secadora, plancha y tenaza moldeadora.", image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=60" },
    { id: 12, name: "Exfoliante Corporal y Facial de Café y Coco", category: "Cuidado Facial", price: 290.00, stock: 12, description: "Remueve células muertas, estimula la circulación y deja la piel renovada y luminosa.", image_url: "https://images.unsplash.com/photo-1567928805192-d35d641494b8?w=500&auto=format&fit=crop&q=60" }
  ],
  services: [
    { id: 1, name: "Corte de Cabello Dama (Lavado y Peinado Express)", category: "Cortes", price: 280.00, duration_mins: 45, description: "Diagnóstico capilar personalizado, lavado relajante con masaje craneal, corte estilizado y peinado express." },
    { id: 2, name: "Corte de Cabello Caballero & Perfilado", category: "Barbería", price: 180.00, duration_mins: 35, description: "Corte clásico o moderno degradado (fade), perfilado de contornos y aplicación de tónico refrescante." },
    { id: 3, name: "Ritual Barba Clásica con Toalla Caliente", category: "Barbería", price: 220.00, duration_mins: 40, description: "Afeitado o perfilado profesional con vaporización de toalla caliente, aceites esenciales y loción balsámica." },
    { id: 4, name: "Corte Infantil (Niña / Niño)", category: "Cortes", price: 160.00, duration_mins: 30, description: "Corte paciente y divertido adaptado a los más pequeños del hogar." },
    { id: 5, name: "Tinte Global / Retoque de Raíz", category: "Colorimetría", price: 680.00, duration_mins: 90, description: "Aplicación de tinte profesional con cobertura 100% de canas, máxima protección y brillo duradero." },
    { id: 6, name: "Efectos de Color: Balayage / Babylights / Ombré", category: "Colorimetría", price: 1650.00, duration_mins: 180, description: "Técnica avanzada de iluminación y degradado personalizado según tono de piel y estilo deseado." },
    { id: 7, name: "Alaciado Permanente con Keratina Brasileña", category: "Tratamientos", price: 1350.00, duration_mins: 150, description: "Elimina 95% del frizz, reduce volumen y aporta brillo extremo hasta por 4 meses." },
    { id: 8, name: "Botox Capilar Hidronutritivo", category: "Tratamientos", price: 580.00, duration_mins: 60, description: "Tratamiento rejuvenecedor que rellena la fibra capilar, recuperando grosor y elasticidad." },
    { id: 9, name: "Manicure Spa con Esmaltado Semipermanente", category: "Uñas & Spa", price: 340.00, duration_mins: 50, description: "Limpieza completa, exfoliación aromática, masaje y aplicación de gelish 21 días." },
    { id: 10, name: "Pedicure Clínico y Relajante Spa", category: "Uñas & Spa", price: 420.00, duration_mins: 60, description: "Hidromasaje en tina con sales relajantes, remoción de asperezas, exfoliación y esmaltado." },
    { id: 11, name: "Peinado Social & Maquillaje Profesional", category: "Eventos & Belleza", price: 950.00, duration_mins: 90, description: "Look deslumbrante para eventos, bodas o graduaciones con fijación de larga duración." },
    { id: 12, name: "Limpieza Facial Profunda con Hidratación Ultrasónica", category: "Cuidado Facial", price: 520.00, duration_mins: 60, description: "Extracción de impurezas, peeling suave ultrasónico, mascarilla nutritiva y fototerapia LED." }
  ],
  staff: [
    { id: 1, name: "Irene Mendoza", specialty: "Directora & Máster Estilista (Color y Tratamientos)" },
    { id: 2, name: "Carlos Valdés", specialty: "Especialista en Barbería, Cortes Modernos y Texturizado" },
    { id: 3, name: "Sofía Navarro", specialty: "Cosmetóloga & Máster en Uñas y Maquillaje" },
    { id: 4, name: "Cualquier Profesional Disponible", specialty: "El estilista con mejor disponibilidad inmediata" }
  ],
  announcements: [
    { id: 1, title: "¡Semana de Renovación Capilar!", content: "Obtén un 15% de descuento en Alaciados con Keratina y Botox Capilar agendando de Martes a Jueves.", badge: "Descuento Especial" },
    { id: 2, title: "Aviso de Citas para Fiestas y Graduaciones", content: "Recomendamos agendar tus servicios de peinado y maquillaje con 48 horas de anticipación para garantizar tu horario preferido.", badge: "Recomendación" },
    { id: 3, title: "Confirmación Digital Inmediata", content: "Recibe tu comprobante por correo electrónico y enlace directo de WhatsApp al agendar tu cita en nuestro portal.", badge: "Servicio Digital" }
  ],
  appointments: [
    { id: 1, folio: "IRENE-261122-101", client_name: "María Fernanda Torres", client_phone: "5512345678", client_email: "mafer.torres@ejemplo.com", service_id: 1, staff_id: 1, service_name: "Corte de Cabello Dama (Lavado y Peinado Express)", staff_name: "Irene Mendoza", appointment_date: "2026-11-23", appointment_time: "10:00", total_amount: 280.00, notes: "Prefiere corte degrafilado", status: "Confirmada" },
    { id: 2, folio: "IRENE-261122-102", client_name: "Alejandro Morales", client_phone: "5587654321", client_email: "alex.morales@ejemplo.com", service_id: 2, staff_id: 2, service_name: "Corte de Cabello Caballero & Perfilado", staff_name: "Carlos Valdés", appointment_date: "2026-11-23", appointment_time: "11:30", total_amount: 180.00, notes: "Fade con perfilado", status: "Pendiente" }
  ]
};

// Detectar si estamos en GitHub Pages o ambiente estático
const isStaticHost = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:' || !window.location.port;

// Inicializador de LocalStorage para modo GitHub Pages
function initLocalStorage() {
  if (!localStorage.getItem('irene_products')) {
    localStorage.setItem('irene_products', JSON.stringify(SEED_DATA.products));
  }
  if (!localStorage.getItem('irene_services')) {
    localStorage.setItem('irene_services', JSON.stringify(SEED_DATA.services));
  }
  if (!localStorage.getItem('irene_staff')) {
    localStorage.setItem('irene_staff', JSON.stringify(SEED_DATA.staff));
  }
  if (!localStorage.getItem('irene_announcements')) {
    localStorage.setItem('irene_announcements', JSON.stringify(SEED_DATA.announcements));
  }
  if (!localStorage.getItem('irene_appointments')) {
    localStorage.setItem('irene_appointments', JSON.stringify(SEED_DATA.appointments));
  }
  if (!localStorage.getItem('irene_email_logs')) {
    localStorage.setItem('irene_email_logs', JSON.stringify([]));
  }
  if (!localStorage.getItem('irene_survey_responses')) {
    localStorage.setItem('irene_survey_responses', JSON.stringify([]));
  }
}

// Estado global de la aplicación
const state = {
  products: [],
  services: [],
  staff: [],
  announcements: [],
  cart: [],
  selectedCategory: 'Todos',
  booking: {
    serviceId: null,
    staffId: null,
    date: null,
    time: null,
    servicePrice: 0
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initLocalStorage();
  loadInitialData();
  setupEventListeners();
  loadCartFromStorage();
  setDefaultBookingDate();
  setRating(1, 5); // Default de estrellas en encuesta
});

async function loadInitialData() {
  await Promise.all([
    fetchServices(),
    fetchStaff(),
    fetchProducts(),
    fetchAnnouncements()
  ]);
}

function setDefaultBookingDate() {
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}

function setupEventListeners() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ---------------- SERVICIOS ---------------- //
async function fetchServices() {
  try {
    if (!isStaticHost) {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        state.services = data.services;
        renderServices();
        populateBookingServices();
        return;
      }
    }
  } catch (e) {}

  // Fallback a LocalStorage / Seed (GitHub Pages)
  state.services = JSON.parse(localStorage.getItem('irene_services') || JSON.stringify(SEED_DATA.services));
  renderServices();
  populateBookingServices();
}

function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hay servicios registrados.</div>';
    return;
  }

  container.innerHTML = state.services.map(s => `
    <div class="service-card">
      <div>
        <div class="service-header">
          <h4 class="service-title">${escapeHtml(s.name)}</h4>
          <span class="service-price">$${formatMoney(s.price)}</span>
        </div>
        <div class="service-meta">
          <span>
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${s.duration_mins || 45} mins aprox.
          </span>
          <span>&bull;</span>
          <span>${escapeHtml(s.category)}</span>
        </div>
        <p class="service-desc">${escapeHtml(s.description || 'Atención personalizada de primera calidad.')}</p>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 15px;">
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="selectServiceForBooking(${s.id})">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Agendar Cita
        </button>
        <button class="btn btn-outline btn-sm" onclick="addToQuote('service', ${s.id}, '${escapeQuote(s.name)}', ${s.price}, '${escapeQuote(s.category)}')">
          + Cotizar
        </button>
      </div>
    </div>
  `).join('');
}

function populateBookingServices() {
  const select = document.getElementById('bookingService');
  if (!select) return;

  select.innerHTML = '<option value="">-- Elige un servicio del catálogo --</option>' +
    state.services.map(s => `
      <option value="${s.id}" data-price="${s.price}" data-duration="${s.duration_mins}">
        ${escapeHtml(s.name)} - $${formatMoney(s.price)} (${s.duration_mins} min)
      </option>
    `).join('');
}

// ---------------- ESTILISTAS / STAFF ---------------- //
async function fetchStaff() {
  try {
    if (!isStaticHost) {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        state.staff = data.staff;
        renderStaffSelect();
        return;
      }
    }
  } catch (e) {}

  state.staff = JSON.parse(localStorage.getItem('irene_staff') || JSON.stringify(SEED_DATA.staff));
  renderStaffSelect();
}

function renderStaffSelect() {
  const select = document.getElementById('bookingStaff');
  if (select) {
    select.innerHTML = state.staff.map(st => `
      <option value="${st.id}">${escapeHtml(st.name)} (${escapeHtml(st.specialty)})</option>
    `).join('');
  }
}

// ---------------- CATÁLOGO DE PRODUCTOS ---------------- //
async function fetchProducts(category = null, search = null) {
  try {
    if (!isStaticHost) {
      let url = '/api/products?';
      if (category && category !== 'Todos') url += `category=${encodeURIComponent(category)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        state.products = data.products;
        renderProducts();
        return;
      }
    }
  } catch (e) {}

  // LocalStorage en GitHub Pages
  let prods = JSON.parse(localStorage.getItem('irene_products') || JSON.stringify(SEED_DATA.products));
  if (category && category !== 'Todos') {
    prods = prods.filter(p => p.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    prods = prods.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
  }
  state.products = prods;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (state.products.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No se encontraron productos en esta categoría o búsqueda.</div>';
    return;
  }

  grid.innerHTML = state.products.map(p => {
    const isLowStock = p.stock <= 5;
    const stockClass = isLowStock ? 'low-stock' : 'in-stock';
    const stockText = p.stock > 0 ? `${p.stock} disponibles` : 'Agotado';

    return `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60'}" alt="${escapeHtml(p.name)}" loading="lazy">
          <span class="badge-category">${escapeHtml(p.category)}</span>
          <span class="badge-stock ${stockClass}">${stockText}</span>
        </div>
        <div class="product-info">
          <h4 class="product-name">${escapeHtml(p.name)}</h4>
          <p class="product-desc">${escapeHtml(p.description || 'Producto profesional para mantenimiento de tu estilo.')}</p>
          <div class="product-footer">
            <span class="product-price">$${formatMoney(p.price)} <small style="font-size: 11px; font-weight: normal; color: var(--text-muted);">MXN</small></span>
            <button class="btn btn-primary btn-sm" onclick="addToQuote('product', ${p.id}, '${escapeQuote(p.name)}', ${p.price}, '${escapeQuote(p.category)}')">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Cotizar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(categoryName) {
  state.selectedCategory = categoryName;
  document.querySelectorAll('#categoryFilterPills .pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === categoryName);
  });
  const search = document.getElementById('productSearchInput').value.trim();
  fetchProducts(categoryName, search);
}

let searchTimeout = null;
function searchProducts(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchProducts(state.selectedCategory, query.trim());
  }, 300);
}

// ---------------- AGENDADOR DE CITAS & HORARIOS ---------------- //
function selectServiceForBooking(serviceId) {
  const select = document.getElementById('bookingService');
  if (select) {
    select.value = serviceId;
    onBookingServiceChange();
    scrollToSection('agendar');
    goToStep(1);
  }
}

function onBookingServiceChange() {
  const select = document.getElementById('bookingService');
  const serviceId = parseInt(select.value);
  const previewBox = document.getElementById('serviceSummaryPreview');

  if (!serviceId) {
    state.booking.serviceId = null;
    state.booking.servicePrice = 0;
    if (previewBox) previewBox.style.display = 'none';
    return;
  }

  const service = state.services.find(s => s.id === serviceId);
  if (service) {
    state.booking.serviceId = service.id;
    state.booking.servicePrice = service.price;

    document.getElementById('previewServiceName').textContent = service.name;
    document.getElementById('previewServiceDesc').textContent = `${service.duration_mins} minutos aprox. | ${service.category}`;
    document.getElementById('previewServicePrice').textContent = `$${formatMoney(service.price)} MXN`;
    if (previewBox) previewBox.style.display = 'block';

    updateAmountPreview();
  }
}

async function fetchAvailability() {
  const dateInput = document.getElementById('bookingDate');
  const staffSelect = document.getElementById('bookingStaff');
  const slotsContainer = document.getElementById('timeSlotsContainer');

  if (!dateInput || !slotsContainer) return;

  const dateVal = dateInput.value;
  const staffVal = staffSelect ? staffSelect.value : 'all';

  if (!dateVal) {
    slotsContainer.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px;">Por favor selecciona una fecha válida.</div>';
    return;
  }

  state.booking.date = dateVal;

  const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  let busyTimes = new Set();
  if (!isStaticHost) {
    try {
      const res = await fetch(`/api/availability?date=${dateVal}&staff_id=${staffVal}`);
      if (res.ok) {
        const data = await res.json();
        renderSlots(data.slots);
        return;
      }
    } catch (e) {}
  }

  // En GitHub Pages / local storage:
  const appointments = JSON.parse(localStorage.getItem('irene_appointments') || JSON.stringify(SEED_DATA.appointments));
  appointments.forEach(apt => {
    if (apt.appointment_date === dateVal && apt.status !== 'Cancelada') {
      if (staffVal === 'all' || !apt.staff_id || String(apt.staff_id) === String(staffVal)) {
        busyTimes.add(apt.appointment_time);
      }
    }
  });

  const slots = allSlots.map(time => ({ time, available: !busyTimes.has(time) }));
  renderSlots(slots);
}

function renderSlots(slots) {
  const slotsContainer = document.getElementById('timeSlotsContainer');
  slotsContainer.innerHTML = slots.map(s => {
    if (!s.available) {
      return `<button type="button" class="time-slot-btn disabled" title="Horario no disponible" disabled>${s.time}</button>`;
    }
    const isSelected = state.booking.time === s.time;
    return `
      <button type="button" class="time-slot-btn ${isSelected ? 'selected' : ''}" onclick="selectTimeSlot('${s.time}', this)">
        ${s.time}
      </button>
    `;
  }).join('');
}

function selectTimeSlot(time, element) {
  state.booking.time = time;
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  if (element) element.classList.add('selected');

  const btnNext = document.getElementById('btnToStep3');
  if (btnNext) btnNext.disabled = false;

  updateAmountPreview();
}

function updateAmountPreview() {
  const service = state.services.find(s => s.id === state.booking.serviceId);
  const totalAmountEl = document.getElementById('summaryTotalAmount');
  const detailsEl = document.getElementById('summaryDetailsText');

  if (totalAmountEl && service) {
    totalAmountEl.textContent = `$${formatMoney(service.price)} MXN`;
  }
  if (detailsEl && service) {
    detailsEl.textContent = `Servicio: ${service.name} | Fecha: ${state.booking.date || 'Por elegir'} | Hora: ${state.booking.time || 'Por elegir'}`;
  }
}

function goToStep(stepNumber) {
  if (stepNumber === 2) {
    if (!state.booking.serviceId) {
      alert('Por favor selecciona primero un servicio para continuar.');
      return;
    }
    fetchAvailability();
  }

  if (stepNumber === 3) {
    if (!state.booking.time) {
      alert('Por favor selecciona un horario disponible.');
      return;
    }
    updateAmountPreview();
  }

  document.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx === stepNumber - 1);
  });

  for (let i = 1; i <= 3; i++) {
    const progEl = document.getElementById(`progStep${i}`);
    if (progEl) {
      progEl.classList.remove('active', 'completed');
      if (i === stepNumber) progEl.classList.add('active');
      else if (i < stepNumber) progEl.classList.add('completed');
    }
  }
}

async function submitAppointment() {
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const notes = document.getElementById('bookingNotes').value.trim();
  const staffId = parseInt(document.getElementById('bookingStaff').value) || 1;

  if (!name || !phone || !email) {
    alert('Por favor completa todos tus datos de contacto (Nombre, Teléfono y Correo).');
    return;
  }

  if (!validateEmail(email)) {
    alert('Por favor ingresa un correo electrónico válido para recibir tu confirmación.');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitAppointment');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = 'Agendando cita y preparando confirmación...';

  const service = state.services.find(s => s.id === state.booking.serviceId);
  const staffObj = state.staff.find(st => st.id === staffId);
  const staffName = staffObj ? staffObj.name : "Estilista Asignado";
  const folio = `IRENE-${Math.floor(100000 + Math.random() * 900000)}`;

  const payload = {
    client_name: name,
    client_phone: phone,
    client_email: email,
    service_id: state.booking.serviceId,
    staff_id: staffId,
    appointment_date: state.booking.date,
    appointment_time: state.booking.time,
    notes: notes
  };

  if (!isStaticHost) {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        showAppointmentConfirmationModal(data);
        resetBookingWizard();
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Confirmar y Agendar Cita';
        return;
      }
    } catch (e) {}
  }

  // Flujo en GitHub Pages / Almacenamiento Local
  const appointments = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
  const newAppointment = {
    id: Date.now(),
    folio: folio,
    client_name: name,
    client_phone: phone,
    client_email: email,
    service_id: state.booking.serviceId,
    service_name: service.name,
    staff_id: staffId,
    staff_name: staffName,
    appointment_date: state.booking.date,
    appointment_time: state.booking.time,
    total_amount: service.price,
    notes: notes,
    status: 'Pendiente',
    created_at: new Date().toLocaleString()
  };
  appointments.push(newAppointment);
  localStorage.setItem('irene_appointments', JSON.stringify(appointments));

  // Generar correo simulado (Confirmación por correo del diagrama)
  const emailHtml = generateClientEmailHtml(folio, name, service.name, staffName, state.booking.date, state.booking.time, service.price);
  const emailLogs = JSON.parse(localStorage.getItem('irene_email_logs') || '[]');
  emailLogs.push({
    id: Date.now(),
    recipient: email,
    subject: `Confirmación de Cita #${folio} - Estética Unisex Irene`,
    body_html: emailHtml,
    appointment_folio: folio,
    sent_at: new Date().toLocaleString(),
    status: 'Entregado con éxito'
  });
  localStorage.setItem('irene_email_logs', JSON.stringify(emailLogs));

  const waMsg = encodeURIComponent(
    `¡Hola Estética Irene! Acabo de agendar una cita en línea.\n` +
    `Folio: #${folio}\nCliente: ${name}\nServicio: ${service.name}\n` +
    `Fecha: ${state.booking.date} a las ${state.booking.time} hrs\n` +
    `Monto por pagar: $${formatMoney(service.price)} MXN`
  );

  showAppointmentConfirmationModal({
    appointment: {
      folio: folio,
      client_name: name,
      service_name: service.name,
      staff_name: staffName,
      date: state.booking.date,
      time: state.booking.time,
      total_amount: service.price,
      client_email: email
    },
    email_preview: { body_html: emailHtml },
    whatsapp_url: `https://api.whatsapp.com/send?phone=525512345678&text=${waMsg}`
  });

  resetBookingWizard();
  btnSubmit.disabled = false;
  btnSubmit.innerHTML = 'Confirmar y Agendar Cita';
}

function generateClientEmailHtml(folio, clientName, serviceName, staffName, date, time, total) {
  return `
    <div style="font-family: sans-serif; background: #fff; border-radius: 10px; padding: 25px; border-top: 5px solid #0d9488;">
      <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">Estética Unisex Irene</h2>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Comprobante Oficial de Cita Agendada</p>
      </div>
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Tu cita ha sido registrada con éxito. A continuación encuentras el aviso de monto por pagar:</p>
      <div style="text-align: center; margin: 15px 0;">
        <span style="background: #f0fdfa; color: #0f766e; font-weight: bold; padding: 6px 14px; border-radius: 6px; border: 1px solid #ccfbf1;">Folio: #${folio}</span>
      </div>
      <table style="width: 100%; font-size: 13.5px; border-collapse: collapse; margin-bottom: 15px;">
        <tr><td style="padding: 8px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Servicio:</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${serviceName}</td></tr>
        <tr><td style="padding: 8px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Especialista:</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${staffName}</td></tr>
        <tr><td style="padding: 8px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Fecha y Hora:</td><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${date} a las ${time} hrs</td></tr>
      </table>
      <div style="background: #f8fafc; border: 1px dashed #0d9488; padding: 12px; border-radius: 6px; text-align: right;">
        Aviso de monto por pagar al llegar: <strong style="color: #0f766e; font-size: 18px;">$${formatMoney(total)} MXN</strong>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">Por favor llega 5-10 minutos antes. Para dudas o cambios, contáctanos por WhatsApp.</p>
    </div>
  `;
}

function showAppointmentConfirmationModal(data) {
  const apt = data.appointment;
  document.getElementById('confirmedFolio').textContent = `#${apt.folio}`;
  document.getElementById('confirmedClientName').textContent = apt.client_name;
  document.getElementById('confirmedService').textContent = apt.service_name;
  document.getElementById('confirmedStaff').textContent = apt.staff_name;
  document.getElementById('confirmedDateTime').textContent = `${apt.date} a las ${apt.time} hrs`;
  document.getElementById('confirmedAmount').textContent = `$${formatMoney(apt.total_amount)} MXN`;
  document.getElementById('confirmedEmailNotice').textContent = apt.client_email;

  const emailWrapper = document.getElementById('emailPreviewContainer');
  if (emailWrapper && data.email_preview) {
    emailWrapper.innerHTML = data.email_preview.body_html;
  }

  const waBtn = document.getElementById('btnSendWhatsAppConfirmation');
  if (waBtn && data.whatsapp_url) {
    waBtn.href = data.whatsapp_url;
  }

  const modal = document.getElementById('appointmentSuccessModal');
  if (modal) modal.classList.add('active');
}

function closeSuccessModal() {
  const modal = document.getElementById('appointmentSuccessModal');
  if (modal) modal.classList.remove('active');
}

function resetBookingWizard() {
  document.getElementById('bookingService').value = '';
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('bookingNotes').value = '';
  state.booking = { serviceId: null, staffId: null, date: null, time: null, servicePrice: 0 };
  const previewBox = document.getElementById('serviceSummaryPreview');
  if (previewBox) previewBox.style.display = 'none';
  goToStep(1);
}

// ---------------- COTIZADOR / CARRITO ---------------- //
function addToQuote(type, id, name, price, category) {
  const existingIndex = state.cart.findIndex(i => i.type === type && i.id === id);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({ type, id, name, price: parseFloat(price), category, quantity: 1 });
  }

  saveCartToStorage();
  updateCartUI();
  showQuickToast(`Agregado a la cotización: ${name}`);
}

function updateQuoteItemQuantity(index, newQty) {
  const qty = parseInt(newQty);
  if (qty <= 0) state.cart.splice(index, 1);
  else state.cart[index].quantity = qty;
  saveCartToStorage();
  updateCartUI();
}

function removeQuoteItem(index) {
  state.cart.splice(index, 1);
  saveCartToStorage();
  updateCartUI();
}

function clearCart() {
  if (confirm('¿Deseas vaciar la lista de cotización?')) {
    state.cart = [];
    saveCartToStorage();
    updateCartUI();
  }
}

function updateCartUI() {
  const badge = document.getElementById('cartCountBadge');
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalCount;

  const emptyNotice = document.getElementById('quoteEmptyNotice');
  const tableWrapper = document.getElementById('quoteTableWrapper');
  const tbody = document.getElementById('quoteItemsTableBody');

  if (!emptyNotice || !tableWrapper || !tbody) return;

  if (state.cart.length === 0) {
    emptyNotice.style.display = 'block';
    tableWrapper.style.display = 'none';
    return;
  }

  emptyNotice.style.display = 'none';
  tableWrapper.style.display = 'block';

  let subtotal = 0;
  tbody.innerHTML = state.cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td><span style="font-size: 12px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(item.category)}</span></td>
        <td>$${formatMoney(item.price)}</td>
        <td>
          <input type="number" min="1" max="99" value="${item.quantity}" style="width: 60px; padding: 4px; border: 1px solid var(--border); border-radius: 4px;" onchange="updateQuoteItemQuantity(${idx}, this.value)">
        </td>
        <td><strong>$${formatMoney(itemTotal)}</strong></td>
        <td>
          <button style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 16px;" onclick="removeQuoteItem(${idx})" title="Eliminar">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('quoteTotalItems').textContent = totalCount;
  document.getElementById('quoteSubtotal').textContent = `$${formatMoney(subtotal)} MXN`;
  document.getElementById('quoteGrandTotal').textContent = `$${formatMoney(subtotal)} MXN`;
}

function openQuoteModal() {
  scrollToSection('cotizador');
}

function generateAndSendQuoteWhatsApp() {
  if (state.cart.length === 0) {
    alert('Añade al menos un producto o servicio para cotizar.');
    return;
  }

  const clientName = prompt('Ingresa tu nombre para personalizar la cotización:') || 'Cliente';
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsText = state.cart.map(it => `• ${it.name} (x${it.quantity}) - $${formatMoney(it.price * it.quantity)}`).join('\n');

  const message = `¡Hola Estética Irene! Quisiera cotizar los siguientes productos y servicios:\n\n${itemsText}\n\n*Total Cotizado Estimado:* $${formatMoney(totalAmount)} MXN\nCliente: ${clientName}\n\n¿Tienen disponibilidad y existencias? ¡Gracias!`;
  const url = `https://api.whatsapp.com/send?phone=525512345678&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

async function saveQuoteToServer() {
  if (state.cart.length === 0) {
    alert('Añade al menos un producto o servicio para cotizar.');
    return;
  }

  const name = prompt('Nombre completo para registrar la cotización:') || 'Cliente Anónimo';
  const phone = prompt('Teléfono o WhatsApp:') || '';
  const totalAmount = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const folio = `COT-${Math.floor(1000 + Math.random() * 9000)}`;

  const quotes = JSON.parse(localStorage.getItem('irene_quotes') || '[]');
  quotes.push({
    id: Date.now(),
    folio: folio,
    client_name: name,
    client_phone: phone,
    items: state.cart,
    total_amount: totalAmount,
    created_at: new Date().toLocaleString()
  });
  localStorage.setItem('irene_quotes', JSON.stringify(quotes));

  alert(`Cotización guardada con el Folio: #${folio}. Total: $${formatMoney(totalAmount)} MXN.`);
}

function saveCartToStorage() {
  try {
    localStorage.setItem('irene_cart', JSON.stringify(state.cart));
  } catch (e) {}
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('irene_cart');
    if (saved) {
      state.cart = JSON.parse(saved);
      updateCartUI();
    }
  } catch (e) {}
}

// ---------------- AVISOS CONTINUOS ---------------- //
async function fetchAnnouncements() {
  try {
    if (!isStaticHost) {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        state.announcements = data.announcements;
        renderAnnouncements();
        return;
      }
    }
  } catch (e) {}

  state.announcements = JSON.parse(localStorage.getItem('irene_announcements') || JSON.stringify(SEED_DATA.announcements));
  renderAnnouncements();
}

function renderAnnouncements() {
  const container = document.getElementById('announcementsGrid');
  if (!container) return;

  if (state.announcements.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hay avisos recientes por el momento.</div>';
    return;
  }

  container.innerHTML = state.announcements.map(a => `
    <div class="announcement-card">
      <span class="badge">${escapeHtml(a.badge || 'Aviso')}</span>
      <h4>${escapeHtml(a.title)}</h4>
      <p>${escapeHtml(a.content)}</p>
    </div>
  `).join('');
}

// ---------------- ENCUESTA DE VALIDACIÓN DEL PMV (GOOGLE FORMS) ---------------- //
function openSurveyModal() {
  window.open('https://forms.gle/UmgKvbkTxQmPfpWo6', '_blank');
}

function closeSurveyModal() {
  const modal = document.getElementById('surveyModal');
  if (modal) modal.classList.remove('active');
}

// ---------------- UTILIDADES ---------------- //
function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function escapeQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showQuickToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#0f172a';
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '9999';
  toast.style.transition = 'all 0.3s ease';
  toast.textContent = msg;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ---------------- MENÚ MÓVIL ---------------- //
function toggleMobileNav() {
  const navLinks = document.getElementById('mainNavLinks');
  const toggleBtn = document.getElementById('mobileMenuToggle');
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
  }
  if (toggleBtn) {
    toggleBtn.classList.toggle('open');
  }
}

function closeMobileMenu() {
  const navLinks = document.getElementById('mainNavLinks');
  const toggleBtn = document.getElementById('mobileMenuToggle');
  if (navLinks) navLinks.classList.remove('mobile-open');
  if (toggleBtn) toggleBtn.classList.remove('open');
}
