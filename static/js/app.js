/**
 * Estética Unisex Irene - Frontend Client Application
 * Manejo de Catálogo, Agendador de Citas, Cotizador y Avisos
 */

// Estado global de la aplicación cliente
const state = {
  products: [],
  services: [],
  staff: [],
  announcements: [],
  cart: [], // Items agregados a la cotización: { id, type, name, price, quantity, category }
  selectedCategory: 'Todos',
  booking: {
    serviceId: null,
    staffId: null,
    date: null,
    time: null,
    servicePrice: 0
  }
};

// Inicialización al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  setupEventListeners();
  loadCartFromStorage();
  setDefaultBookingDate();
});

// Cargar datos desde la API
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
  // Manejo de tabs o scroll suave
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Actualizar links activos
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ---------------- SERVICIOS ---------------- //
async function fetchServices() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success) {
      state.services = data.services;
      renderServices();
      populateBookingServices();
    }
  } catch (err) {
    console.error('Error al cargar servicios:', err);
  }
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
    const res = await fetch('/api/staff');
    const data = await res.json();
    if (data.success) {
      state.staff = data.staff;
      const select = document.getElementById('bookingStaff');
      if (select) {
        select.innerHTML = state.staff.map(st => `
          <option value="${st.id}">${escapeHtml(st.name)} (${escapeHtml(st.specialty)})</option>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error al cargar estilistas:', err);
  }
}

// ---------------- CATÁLOGO DE PRODUCTOS ---------------- //
async function fetchProducts(category = null, search = null) {
  try {
    let url = '/api/products?';
    if (category && category !== 'Todos') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      state.products = data.products;
      renderProducts();
    }
  } catch (err) {
    console.error('Error al cargar productos:', err);
  }
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

// ---------------- AGENDADOR DE CITAS (WIZARD & AVAILABILITY) ---------------- //
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
  slotsContainer.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px;">Consultando disponibilidad...</div>';

  try {
    const res = await fetch(`/api/availability?date=${dateVal}&staff_id=${staffVal}`);
    const data = await res.json();

    if (data.slots && data.slots.length > 0) {
      slotsContainer.innerHTML = data.slots.map(s => {
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
    } else {
      slotsContainer.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px;">No hay horarios para la fecha seleccionada.</div>';
    }
  } catch (err) {
    slotsContainer.innerHTML = '<div style="grid-column: 1/-1; color: var(--danger); font-size: 13px;">Error al consultar disponibilidad.</div>';
  }
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

  // Activar pane
  document.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx === stepNumber - 1);
  });

  // Activar barra de progreso
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
  const staffId = document.getElementById('bookingStaff').value;

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

  const payload = {
    client_name: name,
    client_phone: phone,
    client_email: email,
    service_id: state.booking.serviceId,
    staff_id: parseInt(staffId) || 1,
    appointment_date: state.booking.date,
    appointment_time: state.booking.time,
    notes: notes
  };

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showAppointmentConfirmationModal(data);
      // Limpiar formulario y resetear estado
      resetBookingWizard();
    } else {
      alert(data.error || 'Ocurrió un error al agendar la cita. Por favor intenta otro horario.');
    }
  } catch (err) {
    alert('Error de conexión con el servidor al agendar.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Confirmar y Agendar Cita
    `;
  }
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

  // Insertar vista previa del correo (Flujo del diagrama: "Confirmación por correo")
  const emailWrapper = document.getElementById('emailPreviewContainer');
  if (emailWrapper && data.email_preview) {
    emailWrapper.innerHTML = data.email_preview.body_html;
  }

  // Configurar enlace de WhatsApp
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
    state.cart.push({
      type,
      id,
      name,
      price: parseFloat(price),
      category,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  showQuickToast(`Agregado a la cotización: ${name}`);
}

function updateQuoteItemQuantity(index, newQty) {
  const qty = parseInt(newQty);
  if (qty <= 0) {
    state.cart.splice(index, 1);
  } else {
    state.cart[index].quantity = qty;
  }
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

  try {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: name,
        client_phone: phone,
        items: state.cart
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Cotización guardada exitosamente con el Folio: #${data.folio}. Total: $${formatMoney(data.total_amount)} MXN.`);
    }
  } catch (err) {
    alert('Error al registrar la cotización.');
  }
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

// ---------------- AVISOS CONTINUOS Y ACTUALIZACIONES ---------------- //
async function fetchAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    if (data.success) {
      state.announcements = data.announcements;
      renderAnnouncements();
    }
  } catch (err) {
    console.error('Error al cargar avisos:', err);
  }
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

// ---------------- UTILIDADES ---------------- //
function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
