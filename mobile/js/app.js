// ===================================
// COOP-SMART Mobile App Main
// ===================================

const App = {
    // Estado de la aplicación
    currentPage: null,
    user: null,
    
    // =====================
    // Inicialización
    // =====================
    async init() {
        // Registrar Service Worker
        this.registerServiceWorker();
        
        // Verificar autenticación
        if (API.isAuthenticated()) {
            this.user = API.getUser();
            await this.showPage('home');
        } else {
            await this.showPage('login');
        }
    },
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registrado'))
                .catch(err => console.log('Error SW:', err));
        }
    },
    
    // =====================
    // Navegación
    // =====================
    async showPage(page) {
        this.currentPage = page;
        const app = document.getElementById('app');
        
        // Renderizar página
        switch(page) {
            case 'login':
                app.innerHTML = this.renderLoginPage();
                this.initLoginPage();
                break;
            case 'home':
                app.innerHTML = this.renderHomePage();
                await this.initHomePage();
                break;
            case 'cuentas':
                app.innerHTML = this.renderCuentasPage();
                await this.initCuentasPage();
                break;
            case 'transferir':
                app.innerHTML = this.renderTransferirPage();
                await this.initTransferirPage();
                break;
            case 'prestamos':
                app.innerHTML = this.renderPrestamosPage();
                await this.initPrestamosPage();
                break;
            case 'historial':
                app.innerHTML = this.renderHistorialPage();
                await this.initHistorialPage();
                break;
            case 'perfil':
                app.innerHTML = this.renderPerfilPage();
                this.initPerfilPage();
                break;
        }
    },
    
    // =====================
    // Login Page
    // =====================
    renderLoginPage() {
        return `
            <div class="login-page">
                <div class="login-header">
                    <div class="login-logo">🏦</div>
                    <h1 class="login-title">COOP-SMART</h1>
                    <p class="login-subtitle">Banca móvil para socios</p>
                </div>
                
                <form class="login-form" id="loginForm">
                    <div class="login-error" id="loginError"></div>
                    
                    <div class="form-group">
                        <label class="form-label">Usuario</label>
                        <div class="input-icon-wrapper">
                            <span class="input-icon">👤</span>
                            <input type="text" class="form-input" id="loginUser" placeholder="Ingresa tu usuario" required autocomplete="username">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Contraseña</label>
                        <div class="input-icon-wrapper">
                            <span class="input-icon">🔒</span>
                            <input type="password" class="form-input" id="loginPassword" placeholder="Ingresa tu contraseña" required autocomplete="current-password">
                            <button type="button" class="password-toggle" id="togglePassword">👁️</button>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                        <span>Iniciar Sesión</span>
                    </button>
                </form>
                
                <div class="login-footer">
                    <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
                </div>
            </div>
        `;
    },
    
    initLoginPage() {
        const form = document.getElementById('loginForm');
        const toggleBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('loginPassword');
        
        // Toggle password visibility
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
        
        // Form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usuario = document.getElementById('loginUser').value;
            const password = document.getElementById('loginPassword').value;
            const loginBtn = document.getElementById('loginBtn');
            const errorDiv = document.getElementById('loginError');
            
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></span>';
            
            try {
                await API.login(usuario, password);
                this.user = API.getUser();
                
                // Verificar que sea socio o cliente
                if (this.user.rol !== 'socio' && this.user.rol !== 'cliente') {
                    errorDiv.textContent = 'Esta app es solo para socios y clientes';
                    errorDiv.classList.add('show');
                    API.logout();
                    return;
                }
                
                await this.showPage('home');
            } catch (error) {
                errorDiv.textContent = error.message || 'Usuario o contraseña incorrectos';
                errorDiv.classList.add('show');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Iniciar Sesión</span>';
            }
        });
    },
    
    // =====================
    // Home Page
    // =====================
    renderHomePage() {
        const user = API.getUser();
        const initials = user ? this.getInitials(user.nombre_completo || user.nombre_usuario) : 'U';
        const nombre = user ? (user.nombre_completo || user.nombre_usuario) : 'Usuario';
        
        return `
            <div class="app-container">
                <div class="app-content">
                    <div class="home-header">
                        <div class="user-greeting">
                            <div class="user-avatar">${initials}</div>
                            <div class="greeting-text">
                                <p>Bienvenido,</p>
                                <h2>${nombre}</h2>
                            </div>
                        </div>
                        <button class="notification-btn">
                            🔔
                            <span class="notification-badge"></span>
                        </button>
                    </div>
                    
                    <div class="balance-card slide-up">
                        <div class="balance-label">Saldo Total Disponible</div>
                        <div class="balance-amount" id="totalBalance">L. 0.00</div>
                        <div class="balance-account">
                            <span>💳</span>
                            <span id="accountPreview">Cargando...</span>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <div class="quick-action" onclick="App.showPage('transferir')">
                            <div class="action-icon-circle transfer">💸</div>
                            <span>Transferir</span>
                        </div>
                        <div class="quick-action" onclick="App.showPage('cuentas')">
                            <div class="action-icon-circle pay">💳</div>
                            <span>Cuentas</span>
                        </div>
                        <div class="quick-action" onclick="App.showPage('historial')">
                            <div class="action-icon-circle history">📋</div>
                            <span>Historial</span>
                        </div>
                        <div class="quick-action" onclick="App.showPage('prestamos')">
                            <div class="action-icon-circle more">📊</div>
                            <span>Préstamos</span>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        <h3 class="section-title">Transacciones Recientes</h3>
                        <a href="#" class="section-link" onclick="App.showPage('historial')">Ver todo</a>
                    </div>
                    
                    <div class="transaction-list" id="recentTransactions">
                        <div class="empty-state">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Cargando...</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderBottomNav('home')}
            </div>
        `;
    },
    
    async initHomePage() {
        try {
            // Cargar saldo total
            const cuentas = await API.getCuentas();
            const total = cuentas.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0);
            document.getElementById('totalBalance').textContent = this.formatMoney(total);
            
            // Mostrar cuenta principal
            if (cuentas.length > 0) {
                const cuenta = cuentas[0];
                document.getElementById('accountPreview').textContent = 
                    `${cuenta.tipo_cuenta || 'Cuenta'} ****${String(cuenta.numero_cuenta).slice(-4)}`;
            }
            
            // Cargar transacciones recientes
            await this.loadRecentTransactions();
        } catch (error) {
            console.error('Error cargando home:', error);
            document.getElementById('recentTransactions').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p class="empty-text">Error al cargar datos</p>
                </div>
            `;
        }
    },
    
    async loadRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        
        try {
            const transacciones = await API.getTransacciones({ limit: 5 });
            
            if (!transacciones || transacciones.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p class="empty-title">Sin transacciones</p>
                        <p class="empty-text">Aún no tienes movimientos</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = transacciones.slice(0, 5).map(t => this.renderTransactionItem(t)).join('');
        } catch (error) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">No hay transacciones</p>
                </div>
            `;
        }
    },
    
    // =====================
    // Cuentas Page
    // =====================
    renderCuentasPage() {
        return `
            <div class="app-container">
                <div class="app-header">
                    <button class="header-action" onclick="App.showPage('home')">←</button>
                    <h1 class="header-title">Mis Cuentas</h1>
                    <div class="header-action"></div>
                </div>
                
                <div class="app-content">
                    <div id="cuentasList">
                        <div class="empty-state">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Cargando cuentas...</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderBottomNav('cuentas')}
            </div>
        `;
    },
    
    async initCuentasPage() {
        const container = document.getElementById('cuentasList');
        
        try {
            const cuentas = await API.getCuentas();
            
            if (!cuentas || cuentas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">💳</div>
                        <p class="empty-title">Sin cuentas</p>
                        <p class="empty-text">No tienes cuentas registradas</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = cuentas.map(cuenta => `
                <div class="account-card slide-up" onclick="App.showCuentaDetalle(${cuenta.id})">
                    <div class="account-header">
                        <div class="account-type">
                            <div class="account-type-icon">💳</div>
                            <div>
                                <div class="account-type-name">${cuenta.tipo_cuenta || 'Cuenta'}</div>
                                <div class="account-number">****${String(cuenta.numero_cuenta).slice(-4)}</div>
                            </div>
                        </div>
                        <span class="account-status ${cuenta.estado === 'activa' ? 'active' : ''}">${cuenta.estado || 'Activa'}</span>
                    </div>
                    <div class="account-label">Saldo disponible</div>
                    <div class="account-balance">${this.formatMoney(cuenta.saldo)}</div>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p class="empty-text">Error al cargar cuentas</p>
                </div>
            `;
        }
    },
    
    showCuentaDetalle(id) {
        // Por ahora solo mostrar un toast
        this.showToast('Detalle de cuenta próximamente', 'success');
    },
    
    // =====================
    // Transferir Page
    // =====================
    renderTransferirPage() {
        return `
            <div class="app-container transfer-page">
                <div class="app-header">
                    <button class="header-action" onclick="App.showPage('home')">←</button>
                    <h1 class="header-title">Transferir</h1>
                    <div class="header-action"></div>
                </div>
                
                <div class="app-content">
                    <div class="transfer-amount-section">
                        <div class="transfer-amount-label">Monto a transferir</div>
                        <input type="number" class="transfer-amount-input" id="transferAmount" placeholder="0.00" step="0.01" min="0">
                        <div class="transfer-currency">Lempiras (HNL)</div>
                    </div>
                    
                    <div class="transfer-form-section">
                        <div class="transfer-section-title">Desde</div>
                        <div class="account-selector" id="fromAccountSelector">
                            <div class="selector-icon">💳</div>
                            <div class="selector-info">
                                <div class="selector-label">Cuenta origen</div>
                                <div class="selector-value" id="fromAccountLabel">Seleccionar cuenta</div>
                            </div>
                            <span class="selector-arrow">›</span>
                        </div>
                    </div>
                    
                    <div class="transfer-form-section">
                        <div class="transfer-section-title">Hacia</div>
                        <div class="form-group mb-10">
                            <input type="text" class="form-input" id="destinationAccount" placeholder="Número de cuenta destino">
                        </div>
                        <div class="form-group">
                            <input type="text" class="form-input" id="transferDescription" placeholder="Descripción (opcional)">
                        </div>
                    </div>
                    
                    <button class="btn btn-primary btn-block transfer-btn" id="transferBtn" onclick="App.realizarTransferencia()">
                        Transferir
                    </button>
                </div>
            </div>
        `;
    },
    
    async initTransferirPage() {
        try {
            const cuentas = await API.getCuentas();
            
            if (cuentas.length > 0) {
                const cuenta = cuentas[0];
                document.getElementById('fromAccountLabel').textContent = 
                    `${cuenta.tipo_cuenta} - ${this.formatMoney(cuenta.saldo)}`;
                document.getElementById('fromAccountSelector').dataset.cuentaId = cuenta.id;
            }
        } catch (error) {
            console.error('Error cargando cuentas:', error);
        }
    },
    
    async realizarTransferencia() {
        const monto = parseFloat(document.getElementById('transferAmount').value);
        const cuentaOrigenId = document.getElementById('fromAccountSelector').dataset.cuentaId;
        const cuentaDestinoNum = document.getElementById('destinationAccount').value;
        const descripcion = document.getElementById('transferDescription').value;
        
        if (!monto || monto <= 0) {
            this.showToast('Ingresa un monto válido', 'error');
            return;
        }
        
        if (!cuentaOrigenId) {
            this.showToast('Selecciona una cuenta origen', 'error');
            return;
        }
        
        if (!cuentaDestinoNum) {
            this.showToast('Ingresa la cuenta destino', 'error');
            return;
        }
        
        const btn = document.getElementById('transferBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></span>';
        
        try {
            await API.realizarTransferencia({
                cuentaOrigenId,
                cuentaDestinoId: cuentaDestinoNum,
                monto,
                descripcion
            });
            
            this.showToast('¡Transferencia exitosa!', 'success');
            setTimeout(() => this.showPage('home'), 1500);
        } catch (error) {
            this.showToast(error.message || 'Error en la transferencia', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Transferir';
        }
    },
    
    // =====================
    // Préstamos Page
    // =====================
    renderPrestamosPage() {
        return `
            <div class="app-container">
                <div class="app-header">
                    <button class="header-action" onclick="App.showPage('home')">←</button>
                    <h1 class="header-title">Mis Préstamos</h1>
                    <div class="header-action"></div>
                </div>
                
                <div class="app-content">
                    <div id="prestamosList">
                        <div class="empty-state">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Cargando préstamos...</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderBottomNav('prestamos')}
            </div>
        `;
    },
    
    async initPrestamosPage() {
        const container = document.getElementById('prestamosList');
        
        try {
            const prestamos = await API.getPrestamos();
            
            if (!prestamos || prestamos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <p class="empty-title">Sin préstamos</p>
                        <p class="empty-text">No tienes préstamos activos</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = prestamos.map(prestamo => {
                const montoTotal = parseFloat(prestamo.monto) + parseFloat(prestamo.interes_total || 0);
                const montoPagado = parseFloat(prestamo.monto_pagado || 0);
                const progreso = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;
                const saldoPendiente = montoTotal - montoPagado;
                
                return `
                    <div class="loan-card slide-up">
                        <div class="loan-header">
                            <div class="loan-type">
                                <div class="loan-icon">📄</div>
                                <div>
                                    <div class="loan-name">${prestamo.tipo_prestamo || 'Préstamo'}</div>
                                    <div class="loan-id">#${prestamo.id}</div>
                                </div>
                            </div>
                            <span class="loan-status ${prestamo.estado === 'pagado' ? 'paid' : 'active'}">
                                ${prestamo.estado === 'pagado' ? 'Pagado' : 'Activo'}
                            </span>
                        </div>
                        
                        <div class="loan-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progreso}%"></div>
                            </div>
                            <div class="progress-labels">
                                <span>Pagado: ${progreso.toFixed(0)}%</span>
                                <span>${this.formatMoney(montoPagado)} / ${this.formatMoney(montoTotal)}</span>
                            </div>
                        </div>
                        
                        <div class="loan-details">
                            <div class="loan-detail-item">
                                <div class="loan-detail-label">Cuota mensual</div>
                                <div class="loan-detail-value">${this.formatMoney(prestamo.cuota_mensual || 0)}</div>
                            </div>
                            <div class="loan-detail-item">
                                <div class="loan-detail-label">Saldo pendiente</div>
                                <div class="loan-detail-value">${this.formatMoney(saldoPendiente)}</div>
                            </div>
                            <div class="loan-detail-item">
                                <div class="loan-detail-label">Tasa de interés</div>
                                <div class="loan-detail-value">${prestamo.tasa_interes || 0}%</div>
                            </div>
                            <div class="loan-detail-item">
                                <div class="loan-detail-label">Plazo</div>
                                <div class="loan-detail-value">${prestamo.plazo_meses || 0} meses</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p class="empty-text">Error al cargar préstamos</p>
                </div>
            `;
        }
    },
    
    // =====================
    // Historial Page
    // =====================
    renderHistorialPage() {
        return `
            <div class="app-container">
                <div class="app-header">
                    <button class="header-action" onclick="App.showPage('home')">←</button>
                    <h1 class="header-title">Historial</h1>
                    <div class="header-action"></div>
                </div>
                
                <div class="app-content">
                    <div class="filter-tabs" id="filterTabs">
                        <button class="filter-tab active" data-filter="todos">Todos</button>
                        <button class="filter-tab" data-filter="deposito">Depósitos</button>
                        <button class="filter-tab" data-filter="retiro">Retiros</button>
                        <button class="filter-tab" data-filter="transferencia">Transferencias</button>
                    </div>
                    
                    <div id="historialList">
                        <div class="empty-state">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Cargando historial...</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderBottomNav('historial')}
            </div>
        `;
    },
    
    async initHistorialPage() {
        // Event listeners para filtros
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.loadHistorial(e.target.dataset.filter);
            });
        });
        
        await this.loadHistorial('todos');
    },
    
    async loadHistorial(filtro = 'todos') {
        const container = document.getElementById('historialList');
        
        try {
            const params = filtro !== 'todos' ? { tipo: filtro } : {};
            const transacciones = await API.getTransacciones(params);
            
            if (!transacciones || transacciones.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p class="empty-title">Sin movimientos</p>
                        <p class="empty-text">No hay transacciones para mostrar</p>
                    </div>
                `;
                return;
            }
            
            // Agrupar por fecha
            const grouped = this.groupByDate(transacciones);
            let html = '';
            
            for (const [fecha, trans] of Object.entries(grouped)) {
                html += `<div class="date-header">${fecha}</div>`;
                html += '<div class="transaction-list">';
                trans.forEach(t => {
                    html += this.renderTransactionItem(t);
                });
                html += '</div>';
            }
            
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <p class="empty-text">Error al cargar historial</p>
                </div>
            `;
        }
    },
    
    // =====================
    // Perfil Page
    // =====================
    renderPerfilPage() {
        const user = API.getUser();
        const initials = user ? this.getInitials(user.nombre_completo || user.nombre_usuario) : 'U';
        const nombre = user ? (user.nombre_completo || user.nombre_usuario) : 'Usuario';
        const rol = user ? this.translateRole(user.rol) : 'Cliente';
        
        return `
            <div class="app-container">
                <div class="app-content">
                    <div class="profile-header">
                        <div class="profile-avatar">${initials}</div>
                        <h2 class="profile-name">${nombre}</h2>
                        <p class="profile-role">${rol}</p>
                    </div>
                    
                    <div class="profile-menu">
                        <div class="profile-menu-item">
                            <span class="menu-icon">👤</span>
                            <span class="menu-text">Mis datos personales</span>
                            <span class="menu-arrow">›</span>
                        </div>
                        <div class="profile-menu-item">
                            <span class="menu-icon">🔒</span>
                            <span class="menu-text">Cambiar contraseña</span>
                            <span class="menu-arrow">›</span>
                        </div>
                        <div class="profile-menu-item">
                            <span class="menu-icon">🔔</span>
                            <span class="menu-text">Notificaciones</span>
                            <span class="menu-arrow">›</span>
                        </div>
                        <div class="profile-menu-item">
                            <span class="menu-icon">❓</span>
                            <span class="menu-text">Ayuda y soporte</span>
                            <span class="menu-arrow">›</span>
                        </div>
                        <div class="profile-menu-item">
                            <span class="menu-icon">📋</span>
                            <span class="menu-text">Términos y condiciones</span>
                            <span class="menu-arrow">›</span>
                        </div>
                    </div>
                    
                    <div class="profile-menu mt-20">
                        <div class="profile-menu-item danger" onclick="App.logout()">
                            <span class="menu-icon">🚪</span>
                            <span class="menu-text">Cerrar sesión</span>
                        </div>
                    </div>
                    
                    <p class="text-center text-muted mt-20" style="font-size: 12px;">
                        COOP-SMART Móvil v1.0.0
                    </p>
                </div>
                
                ${this.renderBottomNav('perfil')}
            </div>
        `;
    },
    
    initPerfilPage() {
        // Eventos del perfil
    },
    
    logout() {
        if (confirm('¿Deseas cerrar sesión?')) {
            API.logout();
            this.showPage('login');
        }
    },
    
    // =====================
    // Bottom Navigation
    // =====================
    renderBottomNav(active = 'home') {
        return `
            <nav class="bottom-nav">
                <div class="nav-item ${active === 'home' ? 'active' : ''}" onclick="App.showPage('home')">
                    <div class="nav-icon">🏠</div>
                    <span class="nav-label">Inicio</span>
                </div>
                <div class="nav-item ${active === 'cuentas' ? 'active' : ''}" onclick="App.showPage('cuentas')">
                    <div class="nav-icon">💳</div>
                    <span class="nav-label">Cuentas</span>
                </div>
                <div class="nav-item ${active === 'historial' ? 'active' : ''}" onclick="App.showPage('historial')">
                    <div class="nav-icon">📋</div>
                    <span class="nav-label">Historial</span>
                </div>
                <div class="nav-item ${active === 'perfil' ? 'active' : ''}" onclick="App.showPage('perfil')">
                    <div class="nav-icon">👤</div>
                    <span class="nav-label">Perfil</span>
                </div>
            </nav>
        `;
    },
    
    // =====================
    // Helpers
    // =====================
    renderTransactionItem(t) {
        const isPositive = t.tipo === 'deposito' || (t.tipo === 'transferencia' && t.es_entrante);
        const icon = isPositive ? '↓' : '↑';
        const iconClass = isPositive ? 'income' : 'expense';
        const amountClass = isPositive ? 'positive' : 'negative';
        const prefix = isPositive ? '+' : '-';
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${iconClass}">${icon}</div>
                <div class="transaction-info">
                    <div class="transaction-title">${this.getTransactionTitle(t)}</div>
                    <div class="transaction-date">${this.formatDate(t.fecha_transaccion || t.fecha)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">${prefix} ${this.formatMoney(t.monto)}</div>
            </div>
        `;
    },
    
    getTransactionTitle(t) {
        const tipos = {
            'deposito': 'Depósito',
            'retiro': 'Retiro',
            'transferencia': 'Transferencia',
            'pago_prestamo': 'Pago de préstamo',
            'interes': 'Interés'
        };
        return t.descripcion || tipos[t.tipo] || t.tipo;
    },
    
    formatMoney(amount) {
        const num = parseFloat(amount) || 0;
        return 'L. ' + num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoy, ' + date.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer, ' + date.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
        }
        
        return date.toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    
    groupByDate(transactions) {
        const groups = {};
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        transactions.forEach(t => {
            const date = new Date(t.fecha_transaccion || t.fecha);
            let key;
            
            if (date.toDateString() === today) {
                key = 'Hoy';
            } else if (date.toDateString() === yesterday) {
                key = 'Ayer';
            } else {
                key = date.toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        
        return groups;
    },
    
    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    
    translateRole(role) {
        const roles = {
            'admin': 'Administrador',
            'cajero': 'Cajero',
            'socio': 'Socio',
            'cliente': 'Cliente'
        };
        return roles[role] || role;
    },
    
    showToast(message, type = 'success') {
        // Remover toast existente
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Hacer App global
window.App = App;
