// ===================================
// COOP-SMART Mobile API Service
// ===================================

const API = {
    // Configuración base
    baseURL: 'http://localhost:3000/api',
    
    // Token de autenticación
    getToken() {
        return localStorage.getItem('mobile_token');
    },
    
    setToken(token) {
        localStorage.setItem('mobile_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('mobile_token');
        localStorage.removeItem('mobile_user');
    },
    
    // Usuario actual
    getUser() {
        const user = localStorage.getItem('mobile_user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser(user) {
        localStorage.setItem('mobile_user', JSON.stringify(user));
    },
    
    // Headers comunes
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Método genérico para peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // =====================
    // Auth Endpoints
    // =====================
    async login(usuario, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usuario, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
            this.setUser(response.usuario);
        }
        
        return response;
    },
    
    logout() {
        this.removeToken();
        window.location.href = 'index.html';
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // =====================
    // Cuentas Endpoints
    // =====================
    async getCuentas() {
        const user = this.getUser();
        if (!user) throw new Error('No autenticado');
        
        // Obtener cuentas del socio
        const response = await this.request(`/cuentas?socio_id=${user.socio_id || ''}`);
        return response;
    },
    
    async getCuentaDetalle(id) {
        const response = await this.request(`/cuentas/${id}`);
        return response;
    },
    
    async getSaldoTotal() {
        const cuentas = await this.getCuentas();
        const total = cuentas.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
        return total;
    },
    
    // =====================
    // Transacciones Endpoints
    // =====================
    async getTransacciones(params = {}) {
        const user = this.getUser();
        if (!user) throw new Error('No autenticado');
        
        let query = `?limit=${params.limit || 50}`;
        if (params.tipo) query += `&tipo=${params.tipo}`;
        
        const response = await this.request(`/transacciones${query}`);
        return response;
    },
    
    async realizarTransferencia(data) {
        const response = await this.request('/transacciones/transferencia-movil', {
            method: 'POST',
            body: JSON.stringify({
                cuenta_origen_id: data.cuentaOrigenId,
                cuenta_destino_id: data.cuentaDestinoId,
                monto: data.monto,
                descripcion: data.descripcion || 'Transferencia móvil'
            })
        });
        return response;
    },
    
    // =====================
    // Préstamos Endpoints
    // =====================
    async getPrestamos() {
        const user = this.getUser();
        if (!user) throw new Error('No autenticado');
        
        const response = await this.request(`/prestamos?socio_id=${user.socio_id || ''}`);
        return response;
    },
    
    async getPrestamoDetalle(id) {
        const response = await this.request(`/prestamos/${id}`);
        return response;
    },
    
    // =====================
    // Pagos Endpoints
    // =====================
    async getPagos() {
        const user = this.getUser();
        if (!user) throw new Error('No autenticado');
        
        const response = await this.request(`/pagos`);
        return response;
    },
    
    // =====================
    // Socio/Cliente Info
    // =====================
    async getSocioInfo() {
        const user = this.getUser();
        if (!user || !user.socio_id) return null;
        
        const response = await this.request(`/socios/${user.socio_id}`);
        return response;
    }
};

// Hacer API global
window.API = API;
