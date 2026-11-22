/**
 * Estética Unisex Irene - Panel de Administración
 * Gestión de Productos, Citas, Servicios, Avisos y Confirmaciones
 */

const adminState = {
  products: [],
  appointments: [],
  services: [],
  quotes: [],
  emails: [],
  announcements: []
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
});

// ---------------- AUTENTICACIÓN ---------------- //
function checkAuthSession() {
  const isAuth = sessionStorage.getItem('irene_admin_auth');
  const loginScreen = document.getElementById('loginScreen');
  const adminLayout = document.getElementById('adminLayout');

  if (isAuth === 'true') {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    loadDashboardData();
  } else {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminLayout) adminLayout.style.display = 'none';
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPassword').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem('irene_admin_auth', 'true');
      checkAuthSession();
    } else {
      alert(data.error || 'Contraseña incorrecta');
    }
  } catch (err) {
    alert('Error al conectar con el servidor.');
  }
}

function logoutAdmin() {
  if (confirm('¿Cerrar sesión del panel de administración?')) {
    sessionStorage.removeItem('irene_admin_auth');
    checkAuthSession();
  }
}

// ---------------- NAVEGACIÓN DE TABS ---------------- //
function switchAdminTab(tabName, linkEl) {
  // Cambiar links de la barra lateral
  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    const defaultLink = document.querySelector(`.sidebar-menu a[onclick*="${tabName}"]`);
    if (defaultLink) defaultLink.classList.add('active');
  }

  // Cambiar paneles
  document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  // Actualizar título
  const titleMap = {
    dashboard: 'Dashboard General',
    citas: 'Gestión y Revisión de Citas',
    productos: 'Inventario y Catálogo de Productos',
    servicios: 'Catálogo de Servicios y Precios',
    cotizaciones: 'Cotizaciones en Línea Recibidas',
    correos: 'Bandeja de Confirmaciones por Correo',
    avisos: 'Avisos Continuos y Actualizaciones'
  };
  const topTitle = document.getElementById('topbarTitle');
  if (topTitle) topTitle.textContent = titleMap[tabName] || 'Panel Admin';

  // Cargar datos según el tab seleccionado
  if (tabName === 'dashboard') loadDashboardData();
  else if (tabName === 'citas') loadAdminAppointments();
  else if (tabName === 'productos') loadAdminProducts();
  else if (tabName === 'servicios') loadAdminServices();
  else if (tabName === 'cotizaciones') loadAdminQuotes();
  else if (tabName === 'correos') loadAdminEmailLogs();
  else if (tabName === 'avisos') loadAdminAnnouncements();
}

// ---------------- DASHBOARD & MÉTRICAS ---------------- //
async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/metrics');
    const data = await res.json();

    document.getElementById('metricTodayAppointments').textContent = data.today_appointments || 0;
    document.getElementById('metricPendingAppointments').textContent = data.pending_appointments || 0;
    document.getElementById('metricTotalProducts').textContent = data.total_products || 0;
    document.getElementById('metricProjectedRevenue').textContent = `$${formatMoney(data.projected_revenue)}`;

    loadDashboardAppointments();
  } catch (err) {
    console.error('Error al cargar métricas:', err);
  }
}

async function loadDashboardAppointments() {
  try {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    if (data.success) {
      const recent = data.appointments.slice(0, 5);
      const tbody = document.getElementById('dashboardAppointmentsTable');
      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No hay citas registradas en el sistema.</td></tr>';
        return;
      }
      tbody.innerHTML = recent.map(apt => `
        <tr>
          <td><strong style="color: var(--primary);">#${escapeHtml(apt.folio)}</strong></td>
          <td>
            <strong>${escapeHtml(apt.client_name)}</strong><br>
            <small style="color: var(--text-muted);">${escapeHtml(apt.client_phone)}</small>
          </td>
          <td>${escapeHtml(apt.service_name || 'Servicio')}</td>
          <td>${escapeHtml(apt.staff_name || 'Estilista')}</td>
          <td>${apt.appointment_date} <br><small>${apt.appointment_time} hrs</small></td>
          <td><strong>$${formatMoney(apt.total_amount)}</strong></td>
          <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="switchAdminTab('citas')">Ver</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// ---------------- REVISAR CITAS (COMPLETO) ---------------- //
async function loadAdminAppointments() {
  const statusFilter = document.getElementById('appointmentStatusFilter').value;
  const dateFilter = document.getElementById('appointmentDateFilter').value;

  let url = '/api/appointments?';
  if (statusFilter && statusFilter !== 'Todos') url += `status=${encodeURIComponent(statusFilter)}&`;
  if (dateFilter) url += `date=${encodeURIComponent(dateFilter)}&`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const tbody = document.getElementById('fullAppointmentsTable');

    if (data.success) {
      adminState.appointments = data.appointments;
      if (adminState.appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">No se encontraron citas con los filtros seleccionados.</td></tr>';
        return;
      }

      tbody.innerHTML = adminState.appointments.map(apt => {
        const waMsg = encodeURIComponent(
          `¡Hola ${apt.client_name}! Te saludamos de Estética Unisex Irene.\n` +
          `Te confirmamos tu cita con folio #${apt.folio} programada para el día ${apt.appointment_date} a las ${apt.appointment_time} hrs para tu servicio de "${apt.service_name}".\n` +
          `Monto por pagar: $${formatMoney(apt.total_amount)} MXN. ¡Te esperamos!`
        );
        const waUrl = `https://api.whatsapp.com/send?phone=52${apt.client_phone.replace(/\D/g, '')}&text=${waMsg}`;

        return `
          <tr>
            <td><strong style="color: var(--primary);">#${escapeHtml(apt.folio)}</strong></td>
            <td>
              <strong>${escapeHtml(apt.client_name)}</strong><br>
              <small style="color: var(--text-muted);">${escapeHtml(apt.client_phone)} &bull; ${escapeHtml(apt.client_email)}</small>
            </td>
            <td><strong>${escapeHtml(apt.service_name || 'Servicio')}</strong></td>
            <td>${escapeHtml(apt.staff_name || 'Estilista')}</td>
            <td><strong>${apt.appointment_date}</strong><br><span style="color: var(--primary); font-weight: 700;">${apt.appointment_time} hrs</span></td>
            <td><strong style="color: var(--primary-dark); font-size: 15px;">$${formatMoney(apt.total_amount)} MXN</strong></td>
            <td><small style="color: #64748b;">${escapeHtml(apt.notes || 'Sin notas')}</small></td>
            <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
            <td>
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${apt.status === 'Pendiente' ? `
                  <button class="btn btn-primary btn-sm" onclick="changeAppointmentStatus(${apt.id}, 'Confirmada')" title="Confirmar Cita">✓ Confirmar</button>
                ` : ''}
                ${apt.status === 'Confirmada' ? `
                  <button class="btn btn-secondary btn-sm" style="color: #1e40af;" onclick="changeAppointmentStatus(${apt.id}, 'Completada')" title="Marcar como realizada">✓ Realizada</button>
                ` : ''}
                <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" title="Contactar por WhatsApp">
                  WhatsApp
                </a>
                <button class="btn btn-outline btn-sm" onclick="resendReminderEmail('${apt.folio}', '${escapeQuote(apt.client_email)}')" title="Reenviar comprobante por correo">
                  Reenviar Correo
                </button>
                ${apt.status !== 'Cancelada' ? `
                  <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="changeAppointmentStatus(${apt.id}, 'Cancelada')" title="Cancelar">Cancelar</button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="deleteAppointment(${apt.id})" title="Eliminar del registro">&times;</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error al cargar citas:', err);
  }
}

function clearDateFilter() {
  document.getElementById('appointmentDateFilter').value = '';
  loadAdminAppointments();
}

async function changeAppointmentStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      loadAdminAppointments();
      loadDashboardData();
    }
  } catch (err) {
    alert('Error al actualizar el estado de la cita.');
  }
}

async function resendReminderEmail(folio, email) {
  try {
    const res = await fetch('/api/notifications/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folio: folio, email: email })
    });
    const data = await res.json();
    if (data.success) {
      alert(`¡Comprobante y confirmación de la cita #${folio} reenviado exitosamente a ${email}!`);
      loadAdminEmailLogs();
    }
  } catch (err) {
    alert('Error al reenviar correo.');
  }
}

async function deleteAppointment(id) {
  if (confirm('¿Estás seguro de eliminar permanentemente esta cita del sistema?')) {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAdminAppointments();
        loadDashboardData();
      }
    } catch (err) {
      alert('Error al eliminar la cita.');
    }
  }
}

// ---------------- GESTIÓN DE PRODUCTOS (AGREGAR / EDITAR / ELIMINAR) ---------------- //
async function loadAdminProducts() {
  const search = document.getElementById('adminProductSearch').value.trim();
  const category = document.getElementById('adminProductCategoryFilter').value;

  let url = '/api/products?';
  if (category && category !== 'Todos') url += `category=${encodeURIComponent(category)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const tbody = document.getElementById('adminProductsTable');

    if (data.success) {
      adminState.products = data.products;
      if (adminState.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay productos que coincidan. ¡Usa el botón superior para agregar uno nuevo!</td></tr>';
        return;
      }

      tbody.innerHTML = adminState.products.map(p => {
        const isLow = p.stock <= 5;
        return `
          <tr>
            <td>
              <img src="${p.image_url || 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border);" alt="Foto">
            </td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td><span style="background: #e2e8f0; font-size: 12px; padding: 3px 8px; border-radius: 4px;">${escapeHtml(p.category)}</span></td>
            <td><strong style="color: var(--primary); font-size: 15px;">$${formatMoney(p.price)} MXN</strong></td>
            <td>
              <span style="font-weight: 700; color: ${isLow ? '#ef4444' : '#10b981'};">
                ${p.stock} pzas ${isLow ? '(Bajo)' : ''}
              </span>
            </td>
            <td><small style="color: var(--text-muted); max-width: 250px; display: inline-block;">${escapeHtml(p.description || '-')}</small></td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm" onclick="openEditProductModal(${p.id})">Editar</button>
                <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteProduct(${p.id})">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error al cargar productos admin:', err);
  }
}

function openNewProductModal() {
  document.getElementById('productModalTitle').textContent = 'Agregar Nuevo Producto al Catálogo';
  document.getElementById('prodEditId').value = '';
  document.getElementById('prodName').value = '';
  document.getElementById('prodCategory').value = 'Cuidado Capilar';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodStock').value = '10';
  document.getElementById('prodDescription').value = '';
  document.getElementById('prodImageUrl').value = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=60';
  document.getElementById('productModal').classList.add('active');
}

function openEditProductModal(id) {
  const prod = adminState.products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('productModalTitle').textContent = 'Editar Producto';
  document.getElementById('prodEditId').value = prod.id;
  document.getElementById('prodName').value = prod.name;
  document.getElementById('prodCategory').value = prod.category;
  document.getElementById('prodPrice').value = prod.price;
  document.getElementById('prodStock').value = prod.stock;
  document.getElementById('prodDescription').value = prod.description || '';
  document.getElementById('prodImageUrl').value = prod.image_url || '';
  document.getElementById('productModal').classList.add('active');
}

function setPresetImage(url) {
  document.getElementById('prodImageUrl').value = url;
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('prodEditId').value;
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const stock = parseInt(document.getElementById('prodStock').value);
  const description = document.getElementById('prodDescription').value.trim();
  const imageUrl = document.getElementById('prodImageUrl').value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert('Ingresa un nombre y precio válido.');
    return;
  }

  const payload = {
    name,
    category,
    price,
    stock,
    description,
    image_url: imageUrl
  };

  try {
    let res;
    if (editId) {
      res = await fetch(`/api/products/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    const data = await res.json();
    if (data.success) {
      closeProductModal();
      loadAdminProducts();
      loadDashboardData();
    } else {
      alert(data.error || 'Error al guardar el producto.');
    }
  } catch (err) {
    alert('Error al conectar con el servidor.');
  }
}

async function deleteProduct(id) {
  if (confirm('¿Deseas eliminar este producto del catálogo?')) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAdminProducts();
        loadDashboardData();
      }
    } catch (err) {
      alert('Error al eliminar producto.');
    }
  }
}

// ---------------- GESTIÓN DE SERVICIOS ---------------- //
async function loadAdminServices() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    const tbody = document.getElementById('adminServicesTable');

    if (data.success) {
      adminState.services = data.services;
      tbody.innerHTML = adminState.services.map(s => `
        <tr>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td><span style="background: #e2e8f0; font-size: 12px; padding: 2px 6px; border-radius: 4px;">${escapeHtml(s.category)}</span></td>
          <td><strong style="color: var(--primary);">$${formatMoney(s.price)} MXN</strong></td>
          <td>${s.duration_mins} minutos</td>
          <td><small style="color: var(--text-muted);">${escapeHtml(s.description || '-')}</small></td>
          <td>
            <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteService(${s.id})">Eliminar</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar servicios:', err);
  }
}

function openNewServiceModal() {
  document.getElementById('servName').value = '';
  document.getElementById('servCategory').value = 'Cortes';
  document.getElementById('servPrice').value = '';
  document.getElementById('servDuration').value = '45';
  document.getElementById('servDesc').value = '';
  document.getElementById('serviceModal').classList.add('active');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.remove('active');
}

async function handleSaveService(e) {
  e.preventDefault();
  const name = document.getElementById('servName').value.trim();
  const category = document.getElementById('servCategory').value.trim();
  const price = parseFloat(document.getElementById('servPrice').value);
  const duration = parseInt(document.getElementById('servDuration').value);
  const desc = document.getElementById('servDesc').value.trim();

  try {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, price, duration_mins: duration, description: desc })
    });
    const data = await res.json();
    if (data.success) {
      closeServiceModal();
      loadAdminServices();
    }
  } catch (err) {
    alert('Error al guardar servicio.');
  }
}

async function deleteService(id) {
  if (confirm('¿Eliminar este servicio del catálogo?')) {
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      loadAdminServices();
    } catch (err) {
      alert('Error al eliminar servicio.');
    }
  }
}

// ---------------- COTIZACIONES RECIBIDAS ---------------- //
async function loadAdminQuotes() {
  try {
    const res = await fetch('/api/quotes');
    const data = await res.json();
    const tbody = document.getElementById('adminQuotesTable');

    if (data.success) {
      adminState.quotes = data.quotes;
      if (adminState.quotes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay cotizaciones registradas aún.</td></tr>';
        return;
      }

      tbody.innerHTML = adminState.quotes.map(q => {
        const itemsList = q.items.map(it => `• ${escapeHtml(it.name)} x${it.quantity} ($${formatMoney(it.price * it.quantity)})`).join('<br>');
        const waMsg = encodeURIComponent(`Hola ${q.client_name}, te escribimos de Estética Unisex Irene respecto a tu cotización #${q.folio}.`);
        const waUrl = q.client_phone ? `https://api.whatsapp.com/send?phone=52${q.client_phone.replace(/\D/g, '')}&text=${waMsg}` : '#';

        return `
          <tr>
            <td><strong style="color: var(--primary);">#${escapeHtml(q.folio)}</strong></td>
            <td><strong>${escapeHtml(q.client_name)}</strong></td>
            <td><small>${escapeHtml(q.client_phone || 'Sin tel')} &bull; ${escapeHtml(q.client_email || '')}</small></td>
            <td><small>${itemsList || 'Sin detalles'}</small></td>
            <td><strong style="color: var(--primary-dark); font-size: 15px;">$${formatMoney(q.total_amount)} MXN</strong></td>
            <td><small>${q.created_at}</small></td>
            <td>
              ${q.client_phone ? `
                <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm">Contactar</a>
              ` : '<span style="color: var(--text-muted); font-size: 12px;">Sin WhatsApp</span>'}
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error al cargar cotizaciones:', err);
  }
}

// ---------------- BANDEJA DE CORREOS / CONFIRMACIONES ---------------- //
async function loadAdminEmailLogs() {
  try {
    const res = await fetch('/api/admin/email-logs');
    const data = await res.json();
    const tbody = document.getElementById('adminEmailLogsTable');

    if (data.success) {
      adminState.emails = data.emails;
      if (adminState.emails.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No se han emitido correos todavía.</td></tr>';
        return;
      }

      tbody.innerHTML = adminState.emails.map(em => `
        <tr>
          <td><strong>${escapeHtml(em.recipient)}</strong></td>
          <td>${escapeHtml(em.subject)}</td>
          <td><strong style="color: var(--primary);">#${escapeHtml(em.appointment_folio || '-')}</strong></td>
          <td><small>${em.sent_at}</small></td>
          <td><span class="status-badge Confirmada">${escapeHtml(em.status)}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="viewEmailContent(${em.id})">Ver Contenido</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar logs de correo:', err);
  }
}

function viewEmailContent(id) {
  const mail = adminState.emails.find(m => m.id === id);
  if (!mail) return;

  document.getElementById('viewEmailSubject').textContent = mail.subject;
  document.getElementById('viewEmailRecipient').textContent = mail.recipient;
  document.getElementById('viewEmailBody').innerHTML = mail.body_html;
  document.getElementById('viewEmailModal').classList.add('active');
}

function closeViewEmailModal() {
  document.getElementById('viewEmailModal').classList.remove('active');
}

// ---------------- AVISOS Y ACTUALIZACIONES ---------------- //
async function loadAdminAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const tbody = document.getElementById('adminAnnouncementsTable');

    if (data.success) {
      adminState.announcements = data.announcements;
      if (adminState.announcements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay avisos publicados. ¡Agrega uno con el botón superior!</td></tr>';
        return;
      }

      tbody.innerHTML = adminState.announcements.map(a => `
        <tr>
          <td><span style="background: var(--primary-light); color: var(--primary-dark); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">${escapeHtml(a.badge || 'Aviso')}</span></td>
          <td><strong>${escapeHtml(a.title)}</strong></td>
          <td><small style="color: var(--text-muted);">${escapeHtml(a.content)}</small></td>
          <td><small>${a.created_at}</small></td>
          <td>
            <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteAnnouncement(${a.id})">Eliminar</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar avisos admin:', err);
  }
}

function openNewAnnouncementModal() {
  document.getElementById('annTitle').value = '';
  document.getElementById('annContent').value = '';
  document.getElementById('annBadge').value = 'Promoción';
  document.getElementById('announcementModal').classList.add('active');
}

function closeAnnouncementModal() {
  document.getElementById('announcementModal').classList.remove('active');
}

async function handleSaveAnnouncement(e) {
  e.preventDefault();
  const title = document.getElementById('annTitle').value.trim();
  const content = document.getElementById('annContent').value.trim();
  const badge = document.getElementById('annBadge').value.trim();

  try {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, badge })
    });
    const data = await res.json();
    if (data.success) {
      closeAnnouncementModal();
      loadAdminAnnouncements();
    }
  } catch (err) {
    alert('Error al publicar aviso.');
  }
}

async function deleteAnnouncement(id) {
  if (confirm('¿Eliminar este aviso de la página principal?')) {
    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      loadAdminAnnouncements();
    } catch (err) {
      alert('Error al eliminar aviso.');
    }
  }
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
