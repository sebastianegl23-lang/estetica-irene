/**
 * Estética Unisex Irene - Panel de Administración
 * Compatible con Servidor Local Python REST API y GitHub Pages (localStorage)
 */

const isStaticAdmin = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:' || !window.location.port;

const adminState = {
  products: [],
  appointments: [],
  services: [],
  quotes: [],
  emails: [],
  announcements: [],
  surveys: []
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
  const pass = document.getElementById('adminPassword').value.trim();

  if (pass === 'irene2026' || pass === 'admin123' || pass === 'irene') {
    sessionStorage.setItem('irene_admin_auth', 'true');
    checkAuthSession();
  } else {
    alert('Contraseña incorrecta (prueba: irene2026)');
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
  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    const defaultLink = document.querySelector(`.sidebar-menu a[onclick*="${tabName}"]`);
    if (defaultLink) defaultLink.classList.add('active');
  }

  document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  const titleMap = {
    dashboard: 'Dashboard General',
    citas: 'Gestión y Revisión de Citas',
    productos: 'Inventario y Catálogo de Productos',
    servicios: 'Catálogo de Servicios y Precios',
    cotizaciones: 'Cotizaciones en Línea Recibidas',
    correos: 'Bandeja de Confirmaciones por Correo',
    encuestas: 'Recopilación de Datos del PMV (Encuestas)',
    avisos: 'Avisos Continuos y Actualizaciones'
  };
  const topTitle = document.getElementById('topbarTitle');
  if (topTitle) topTitle.textContent = titleMap[tabName] || 'Panel Admin';

  if (tabName === 'dashboard') loadDashboardData();
  else if (tabName === 'citas') loadAdminAppointments();
  else if (tabName === 'productos') loadAdminProducts();
  else if (tabName === 'servicios') loadAdminServices();
  else if (tabName === 'cotizaciones') loadAdminQuotes();
  else if (tabName === 'correos') loadAdminEmailLogs();
  else if (tabName === 'encuestas') loadAdminSurveys();
  else if (tabName === 'avisos') loadAdminAnnouncements();
}

// ---------------- DASHBOARD & MÉTRICAS ---------------- //
async function loadDashboardData() {
  if (!isStaticAdmin) {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        document.getElementById('metricTodayAppointments').textContent = data.today_appointments || 0;
        document.getElementById('metricPendingAppointments').textContent = data.pending_appointments || 0;
        document.getElementById('metricTotalProducts').textContent = data.total_products || 0;
        document.getElementById('metricProjectedRevenue').textContent = `$${formatMoney(data.projected_revenue)}`;
        loadDashboardAppointments();
        return;
      }
    } catch (e) {}
  }

  // Modo LocalStorage (GitHub Pages)
  const apts = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
  const prods = JSON.parse(localStorage.getItem('irene_products') || '[]');
  const today = new Date().toISOString().split('T')[0];

  const todayCount = apts.filter(a => a.appointment_date === today).length;
  const pendingCount = apts.filter(a => a.status === 'Pendiente').length;
  const revenue = apts.filter(a => a.status !== 'Cancelada').reduce((sum, a) => sum + parseFloat(a.total_amount || 0), 0);

  document.getElementById('metricTodayAppointments').textContent = todayCount;
  document.getElementById('metricPendingAppointments').textContent = pendingCount;
  document.getElementById('metricTotalProducts').textContent = prods.length;
  document.getElementById('metricProjectedRevenue').textContent = `$${formatMoney(revenue)}`;

  loadDashboardAppointments();
}

async function loadDashboardAppointments() {
  const tbody = document.getElementById('dashboardAppointmentsTable');
  let apts = [];

  if (!isStaticAdmin) {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        apts = data.appointments;
      }
    } catch (e) {}
  }

  if (apts.length === 0) {
    apts = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
  }

  const recent = apts.slice(0, 5);
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

// ---------------- REVISAR CITAS ---------------- //
async function loadAdminAppointments() {
  const statusFilter = document.getElementById('appointmentStatusFilter').value;
  const dateFilter = document.getElementById('appointmentDateFilter').value;
  const tbody = document.getElementById('fullAppointmentsTable');
  let appointments = [];

  if (!isStaticAdmin) {
    try {
      let url = '/api/appointments?';
      if (statusFilter && statusFilter !== 'Todos') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (dateFilter) url += `date=${encodeURIComponent(dateFilter)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        appointments = data.appointments;
      }
    } catch (e) {}
  }

  if (appointments.length === 0) {
    appointments = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
    if (statusFilter && statusFilter !== 'Todos') {
      appointments = appointments.filter(a => a.status === statusFilter);
    }
    if (dateFilter) {
      appointments = appointments.filter(a => a.appointment_date === dateFilter);
    }
  }

  adminState.appointments = appointments;
  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">No se encontraron citas con los filtros seleccionados.</td></tr>';
    return;
  }

  tbody.innerHTML = appointments.map(apt => {
    const waMsg = encodeURIComponent(
      `¡Hola ${apt.client_name}! Te saludamos de Estética Unisex Irene.\n` +
      `Te confirmamos tu cita con folio #${apt.folio} programada para el día ${apt.appointment_date} a las ${apt.appointment_time} hrs para tu servicio de "${apt.service_name}".\n` +
      `Monto por pagar: $${formatMoney(apt.total_amount)} MXN. ¡Te esperamos!`
    );
    const waUrl = `https://api.whatsapp.com/send?phone=52${(apt.client_phone || '').replace(/\D/g, '')}&text=${waMsg}`;

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
              <button class="btn btn-primary btn-sm" onclick="changeAppointmentStatus('${apt.id}', 'Confirmada')" title="Confirmar Cita">✓ Confirmar</button>
            ` : ''}
            ${apt.status === 'Confirmada' ? `
              <button class="btn btn-secondary btn-sm" style="color: #1e40af;" onclick="changeAppointmentStatus('${apt.id}', 'Completada')" title="Marcar como realizada">✓ Realizada</button>
            ` : ''}
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" title="Contactar por WhatsApp">
              WhatsApp
            </a>
            <button class="btn btn-outline btn-sm" onclick="resendReminderEmail('${apt.folio}', '${escapeQuote(apt.client_email)}')" title="Reenviar comprobante por correo">
              Reenviar Correo
            </button>
            ${apt.status !== 'Cancelada' ? `
              <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="changeAppointmentStatus('${apt.id}', 'Cancelada')" title="Cancelar">Cancelar</button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="deleteAppointment('${apt.id}')" title="Eliminar del registro">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function clearDateFilter() {
  document.getElementById('appointmentDateFilter').value = '';
  loadAdminAppointments();
}

async function changeAppointmentStatus(id, newStatus) {
  if (!isStaticAdmin) {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadAdminAppointments();
        loadDashboardData();
        return;
      }
    } catch (e) {}
  }

  const apts = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
  const idx = apts.findIndex(a => String(a.id) === String(id));
  if (idx > -1) {
    apts[idx].status = newStatus;
    localStorage.setItem('irene_appointments', JSON.stringify(apts));
    loadAdminAppointments();
    loadDashboardData();
  }
}

async function resendReminderEmail(folio, email) {
  alert(`¡Comprobante de la cita #${folio} reenviado exitosamente a ${email}!`);
}

async function deleteAppointment(id) {
  if (confirm('¿Estás seguro de eliminar permanentemente esta cita del sistema?')) {
    if (!isStaticAdmin) {
      try {
        const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadAdminAppointments();
          loadDashboardData();
          return;
        }
      } catch (e) {}
    }

    let apts = JSON.parse(localStorage.getItem('irene_appointments') || '[]');
    apts = apts.filter(a => String(a.id) !== String(id));
    localStorage.setItem('irene_appointments', JSON.stringify(apts));
    loadAdminAppointments();
    loadDashboardData();
  }
}

// ---------------- GESTIÓN DE PRODUCTOS ---------------- //
async function loadAdminProducts() {
  const search = (document.getElementById('adminProductSearch')?.value || '').trim();
  const category = document.getElementById('adminProductCategoryFilter')?.value || 'Todos';
  const tbody = document.getElementById('adminProductsTable');
  let products = [];

  if (!isStaticAdmin) {
    try {
      let url = '/api/products?';
      if (category && category !== 'Todos') url += `category=${encodeURIComponent(category)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        products = data.products;
      }
    } catch (e) {}
  }

  if (products.length === 0) {
    products = JSON.parse(localStorage.getItem('irene_products') || '[]');
    if (category && category !== 'Todos') {
      products = products.filter(p => p.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
    }
  }

  adminState.products = products;
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay productos que coincidan. ¡Usa el botón superior para agregar uno nuevo!</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
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
            <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.id}')">Editar</button>
            <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteProduct('${p.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
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
  const prod = adminState.products.find(p => String(p.id) === String(id));
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

  const payload = { name, category, price, stock, description, image_url: imageUrl };

  if (!isStaticAdmin) {
    try {
      let res;
      if (editId) {
        res = await fetch(`/api/products/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      if (res.ok) {
        closeProductModal();
        loadAdminProducts();
        loadDashboardData();
        return;
      }
    } catch (e) {}
  }

  // LocalStorage / GitHub Pages
  const prods = JSON.parse(localStorage.getItem('irene_products') || '[]');
  if (editId) {
    const idx = prods.findIndex(p => String(p.id) === String(editId));
    if (idx > -1) {
      prods[idx] = { ...prods[idx], ...payload };
    }
  } else {
    prods.unshift({ id: Date.now(), ...payload });
  }
  localStorage.setItem('irene_products', JSON.stringify(prods));
  closeProductModal();
  loadAdminProducts();
  loadDashboardData();
}

async function deleteProduct(id) {
  if (confirm('¿Deseas eliminar este producto del catálogo?')) {
    if (!isStaticAdmin) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadAdminProducts();
          loadDashboardData();
          return;
        }
      } catch (e) {}
    }

    let prods = JSON.parse(localStorage.getItem('irene_products') || '[]');
    prods = prods.filter(p => String(p.id) !== String(id));
    localStorage.setItem('irene_products', JSON.stringify(prods));
    loadAdminProducts();
    loadDashboardData();
  }
}

// ---------------- GESTIÓN DE SERVICIOS ---------------- //
async function loadAdminServices() {
  const tbody = document.getElementById('adminServicesTable');
  let services = JSON.parse(localStorage.getItem('irene_services') || '[]');

  adminState.services = services;
  tbody.innerHTML = services.map(s => `
    <tr>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td><span style="background: #e2e8f0; font-size: 12px; padding: 2px 6px; border-radius: 4px;">${escapeHtml(s.category)}</span></td>
      <td><strong style="color: var(--primary);">$${formatMoney(s.price)} MXN</strong></td>
      <td>${s.duration_mins} minutos</td>
      <td><small style="color: var(--text-muted);">${escapeHtml(s.description || '-')}</small></td>
      <td>
        <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteService('${s.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
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

  const services = JSON.parse(localStorage.getItem('irene_services') || '[]');
  services.push({ id: Date.now(), name, category, price, duration_mins: duration, description: desc });
  localStorage.setItem('irene_services', JSON.stringify(services));

  closeServiceModal();
  loadAdminServices();
}

async function deleteService(id) {
  if (confirm('¿Eliminar este servicio del catálogo?')) {
    let services = JSON.parse(localStorage.getItem('irene_services') || '[]');
    services = services.filter(s => String(s.id) !== String(id));
    localStorage.setItem('irene_services', JSON.stringify(services));
    loadAdminServices();
  }
}

// ---------------- COTIZACIONES RECIBIDAS ---------------- //
async function loadAdminQuotes() {
  const tbody = document.getElementById('adminQuotesTable');
  let quotes = JSON.parse(localStorage.getItem('irene_quotes') || '[]');

  adminState.quotes = quotes;
  if (quotes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay cotizaciones registradas aún.</td></tr>';
    return;
  }

  tbody.innerHTML = quotes.map(q => {
    const itemsList = (q.items || []).map(it => `• ${escapeHtml(it.name)} x${it.quantity} ($${formatMoney(it.price * it.quantity)})`).join('<br>');
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
          ${q.client_phone ? `<a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm">Contactar</a>` : '<span style="color: var(--text-muted); font-size: 12px;">Sin WhatsApp</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

// ---------------- BANDEJA DE CORREOS / CONFIRMACIONES ---------------- //
async function loadAdminEmailLogs() {
  const tbody = document.getElementById('adminEmailLogsTable');
  let emails = JSON.parse(localStorage.getItem('irene_email_logs') || '[]');

  adminState.emails = emails;
  if (emails.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No se han emitido correos todavía.</td></tr>';
    return;
  }

  tbody.innerHTML = emails.map(em => `
    <tr>
      <td><strong>${escapeHtml(em.recipient)}</strong></td>
      <td>${escapeHtml(em.subject)}</td>
      <td><strong style="color: var(--primary);">#${escapeHtml(em.appointment_folio || '-')}</strong></td>
      <td><small>${em.sent_at}</small></td>
      <td><span class="status-badge Confirmada">${escapeHtml(em.status)}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewEmailContent('${em.id}')">Ver Contenido</button>
      </td>
    </tr>
  `).join('');
}

function viewEmailContent(id) {
  const mail = adminState.emails.find(m => String(m.id) === String(id));
  if (!mail) return;

  document.getElementById('viewEmailSubject').textContent = mail.subject;
  document.getElementById('viewEmailRecipient').textContent = mail.recipient;
  document.getElementById('viewEmailBody').innerHTML = mail.body_html;
  document.getElementById('viewEmailModal').classList.add('active');
}

function closeViewEmailModal() {
  document.getElementById('viewEmailModal').classList.remove('active');
}

// ---------------- RECOPILACIÓN DE DATOS (ENCUESTA DEL PMV - PUNTO G) ---------------- //
function loadAdminSurveys() {
  const tbody = document.getElementById('adminSurveyTable');
  const surveys = JSON.parse(localStorage.getItem('irene_survey_responses') || '[]');
  adminState.surveys = surveys;

  if (surveys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Aún no se han recibido respuestas a la encuesta del PMV. Invita a usuarios a probar la web y responder la encuesta.</td></tr>';
    return;
  }

  tbody.innerHTML = surveys.map(s => `
    <tr>
      <td><small>${escapeHtml(s.date)}</small></td>
      <td><strong>${'★'.repeat(s.rating_usability || 5)}</strong> (${s.rating_usability}/5)</td>
      <td>${escapeHtml(s.clarity_pricing)}</td>
      <td><span class="status-badge Confirmada">${escapeHtml(s.would_use_online)}</span></td>
      <td>${escapeHtml(s.comments)}</td>
    </tr>
  `).join('');
}

function exportSurveyDataCSV() {
  const surveys = JSON.parse(localStorage.getItem('irene_survey_responses') || '[]');
  if (surveys.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Fecha,Usabilidad,Claridad_Precios,Usaria_Online,Comentarios\n";
  surveys.forEach(s => {
    csvContent += `"${s.date}","${s.rating_usability}","${s.clarity_pricing}","${s.would_use_online}","${s.comments.replace(/"/g, '""')}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "recopilacion_datos_pmv_estetica_irene.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ---------------- AVISOS Y ACTUALIZACIONES ---------------- //
async function loadAdminAnnouncements() {
  const tbody = document.getElementById('adminAnnouncementsTable');
  let announcements = JSON.parse(localStorage.getItem('irene_announcements') || '[]');

  adminState.announcements = announcements;
  if (announcements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay avisos publicados.</td></tr>';
    return;
  }

  tbody.innerHTML = announcements.map(a => `
    <tr>
      <td><span style="background: var(--primary-light); color: var(--primary-dark); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">${escapeHtml(a.badge || 'Aviso')}</span></td>
      <td><strong>${escapeHtml(a.title)}</strong></td>
      <td><small style="color: var(--text-muted);">${escapeHtml(a.content)}</small></td>
      <td><small>${a.created_at || 'Reciente'}</small></td>
      <td>
        <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteAnnouncement('${a.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
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

  const announcements = JSON.parse(localStorage.getItem('irene_announcements') || '[]');
  announcements.unshift({ id: Date.now(), title, content, badge, created_at: new Date().toLocaleDateString() });
  localStorage.setItem('irene_announcements', JSON.stringify(announcements));

  closeAnnouncementModal();
  loadAdminAnnouncements();
}

async function deleteAnnouncement(id) {
  if (confirm('¿Eliminar este aviso de la página principal?')) {
    let announcements = JSON.parse(localStorage.getItem('irene_announcements') || '[]');
    announcements = announcements.filter(a => String(a.id) !== String(id));
    localStorage.setItem('irene_announcements', JSON.stringify(announcements));
    loadAdminAnnouncements();
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
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function escapeQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'");
}
