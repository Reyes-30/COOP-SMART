# 💰 COOP-SMART - Sistema de Gestión Cooperativa

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)](https://github.com/Reyes-30/COOP-SMART)
[![Node.js](https://img.shields.io/badge/Node.js-24.5.0-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sistema integral de gestión para cooperativas de ahorro y crédito, desarrollado con Node.js, Express y MySQL.

---

## 📋 Descripción del Proyecto

COOP-SMART es una aplicación web completa que permite a las cooperativas de ahorro y crédito gestionar de manera eficiente:

- 👥 **Socios y Clientes** - Registro y administración completa
- � **Cuentas Bancarias** - Ahorro, corriente y plazo fijo
- � **Préstamos** - Solicitud, aprobación y amortización
- 💸 **Pagos** - Registro de cuotas de préstamos
- � **Transacciones** - Depósitos, retiros y transferencias
- � **Reportes** - Estadísticas y análisis en tiempo real
- 🔐 **Seguridad** - Autenticación JWT y control de roles

---

## � Características Principales

### Backend
- ✅ API REST completa con 25+ endpoints
- ✅ Autenticación JWT con tokens de 24 horas
- ✅ Control de acceso basado en roles (Admin, Cajero, Socio)
- ✅ ORM Sequelize para abstracción de base de datos
- ✅ Middleware de seguridad (Helmet, CORS)
- ✅ Logging de peticiones con Morgan
- ✅ Validación de datos en todas las operaciones

### Base de Datos
- ✅ Diseño normalizado en 3FN
- ✅ 8 tablas con relaciones bien definidas
- ✅ Integridad referencial garantizada
- ✅ Triggers para auditoría automática
- ✅ Vistas optimizadas para reportes
- ✅ Procedimientos almacenados para cálculos

### Frontend
- ✅ Interfaz moderna con diseño responsive
- ✅ 6 módulos principales completamente funcionales
- ✅ Widgets informativos con estadísticas en tiempo real
- ✅ Sistema de notificaciones
- ✅ Gestión de sesiones con localStorage

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | 24.5.0 | Entorno de ejecución JavaScript |
| Express.js | 4.21.1 | Framework web minimalista |
| Sequelize | 6.35.2 | ORM para MySQL |
| MySQL2 | 3.6.5 | Driver de base de datos |
| JWT | 9.0.2 | Autenticación con tokens |
| bcrypt | 5.1.1 | Encriptación de contraseñas |

### Frontend
| Tecnología | Descripción |
|------------|-------------|
| HTML5 | Estructura semántica |
| CSS3 | Diseño moderno y responsive |
| JavaScript ES6+ | Lógica de aplicación |
| Fetch API | Comunicación con backend |

---

## 📁 Estructura del Proyecto

```
COOP-SMART/
├── backend/
│   ├── config/
│   │   └── database.js           # Configuración de conexión MySQL
│   ├── controllers/
│   │   ├── authController.js     # Autenticación y login
│   │   ├── sociosController.js   # CRUD de socios
│   │   ├── cuentasController.js  # Gestión de cuentas
│   │   ├── prestamosController.js # Gestión de préstamos
│   │   ├── pagosController.js    # Registro de pagos
│   │   └── transaccionesController.js # Transacciones bancarias
│   ├── models/
│   │   ├── Usuario.js            # Modelo de usuarios
│   │   ├── Socio.js              # Modelo de socios
│   │   ├── Cuenta.js             # Modelo de cuentas
│   │   ├── Prestamo.js           # Modelo de préstamos
│   │   ├── Pago.js               # Modelo de pagos
│   │   ├── Transaccion.js        # Modelo de transacciones
│   │   ├── Log.js                # Modelo de logs
│   │   └── Cliente.js            # Modelo de clientes
│   ├── routes/
│   │   ├── auth.routes.js        # Rutas de autenticación
│   │   ├── socios.routes.js      # Rutas de socios
│   │   ├── cuentas.routes.js     # Rutas de cuentas
│   │   ├── prestamos.routes.js   # Rutas de préstamos
│   │   ├── pagos.routes.js       # Rutas de pagos
│   │   └── transacciones.routes.js # Rutas de transacciones
│   ├── middleware/
│   │   └── auth.middleware.js    # Verificación JWT
│   ├── seeders/
│   │   └── 001-seed-all.js       # Datos de prueba (164 registros)
│   └── server.js                 # Punto de entrada del backend
├── frontend/
│   ├── css/
│   │   └── styles.css            # Estilos globales
│   ├── js/
│   │   ├── dashboard.js          # Lógica del dashboard
│   │   ├── socios.js             # Gestión de socios
│   │   ├── cuentas.js            # Gestión de cuentas
│   │   ├── prestamos.js          # Gestión de préstamos
│   │   ├── pagos.js              # Registro de pagos
│   │   └── transacciones.js      # Operaciones bancarias
│   ├── dashboard.html            # Panel principal
│   ├── socios.html               # Módulo de socios
│   ├── cuentas.html              # Módulo de cuentas
│   ├── prestamos.html            # Módulo de préstamos
│   ├── pagos.html                # Módulo de pagos
│   ├── transacciones.html        # Módulo de transacciones
│   └── login.html                # Página de inicio de sesión
├── database/
│   └── SCRIPT-BD-COMPLETO.sql    # Script completo de base de datos
├── AVANCE-1-BACKEND-BD.md        # 📘 Documentación técnica completa
├── PLAN-DE-ACCION.md             # Plan de desarrollo
└── README.md                      # Este archivo
```

---

## 🔧 Requisitos Previos

- **Node.js**: v18.0.0 o superior (probado con v24.5.0)
- **MySQL**: 8.0 o superior
- **npm**: 9.0.0 o superior
- **Git**: Para clonar el repositorio

---

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Reyes-30/COOP-SMART.git
cd COOP-SMART
```

### 2️⃣ Configurar Base de Datos

```bash
# Iniciar sesión en MySQL
mysql -u root -p

# Ejecutar el script de base de datos
mysql -u root -p < database/SCRIPT-BD-COMPLETO.sql
```

Esto creará:
- Base de datos `coop_smart`
- 8 tablas (usuarios, socios, cuentas, prestamos, pagos, transacciones, logs, clientes)
- 3 vistas optimizadas
- 2 procedimientos almacenados
- 3 triggers de auditoría
- Usuario administrador por defecto

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

### 3️⃣ Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` con las siguientes variables:

```env
# Servidor
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=coop_smart
DB_DIALECT=mysql

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=24h

# Entorno
NODE_ENV=development
```

### 4️⃣ Cargar Datos de Prueba (Opcional)

```bash
npm run seed
```

Esto generará:
- 25 socios
- 39 cuentas (ahorro, corriente, plazo fijo)
- 20 préstamos
- 69 pagos de préstamos
- 50 transacciones
- **Total: 164 registros de prueba**

### 5️⃣ Iniciar Backend

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### 6️⃣ Abrir Frontend

Abrir `frontend/login.html` en un navegador o usar un servidor local:

```bash
# Con Python 3
cd frontend
python -m http.server 8080

# Con Node.js (http-server)
npx http-server frontend -p 8080
```

Acceder a `http://localhost:8080/login.html`

---

## 🔐 Usuarios de Prueba

| Rol | Usuario | Contraseña | Permisos |
|-----|---------|------------|----------|
| Administrador | `admin` | `admin123` | Acceso completo al sistema |
| Cajero | `cajero1` | `cajero123` | Transacciones y operaciones |
| Socio | `socio1` | `socio123` | Solo consulta de cuentas |

---

## 📡 Endpoints de la API

La API REST incluye 25+ endpoints organizados en 6 categorías:

### 🔑 Autenticación
```
POST   /api/auth/register  - Registrar nuevo usuario
POST   /api/auth/login     - Iniciar sesión (obtener JWT)
GET    /api/auth/me        - Obtener perfil del usuario actual
```

### 👥 Socios
```
GET    /api/socios         - Listar todos los socios (con paginación)
POST   /api/socios         - Crear nuevo socio
GET    /api/socios/:id     - Obtener socio por ID
PUT    /api/socios/:id     - Actualizar socio
DELETE /api/socios/:id     - Eliminar socio
```

### 💳 Cuentas
```
GET    /api/cuentas        - Listar todas las cuentas
POST   /api/cuentas        - Crear nueva cuenta
GET    /api/cuentas/:id    - Obtener cuenta por ID
PUT    /api/cuentas/:id    - Actualizar cuenta
DELETE /api/cuentas/:id    - Eliminar cuenta
GET    /api/cuentas/socio/:id - Obtener cuentas de un socio
```

### 💵 Préstamos
```
GET    /api/prestamos      - Listar préstamos
POST   /api/prestamos      - Solicitar préstamo
GET    /api/prestamos/:id  - Obtener préstamo por ID
PUT    /api/prestamos/:id  - Actualizar préstamo
PUT    /api/prestamos/:id/aprobar - Aprobar préstamo
```

### 💸 Pagos
```
GET    /api/pagos          - Listar pagos
POST   /api/pagos          - Registrar pago de cuota
GET    /api/pagos/:id      - Obtener pago por ID
GET    /api/pagos/prestamo/:id - Obtener pagos de un préstamo
```

### 📝 Transacciones
```
GET    /api/transacciones  - Listar transacciones
POST   /api/transacciones  - Registrar transacción
GET    /api/transacciones/:id - Obtener transacción por ID
```

**Documentación completa:** Ver archivo `AVANCE-1-BACKEND-BD.md`

---

## 📊 Base de Datos

### Diseño ER (8 Tablas)

```
usuarios (1) ────── (N) logs
    │
    │ (1:1)
    │
socios (1) ──────── (N) cuentas (1) ──────── (N) transacciones
    │                   
    │ (1:N)             
    │                   
    └────────────── (N) prestamos (1) ───── (N) pagos
                            │
                            │ (N:1)
                            │
                        cuentas (cuenta de desembolso)


clientes (tabla independiente para gestión de contactos)
```

### Tablas Principales

1. **usuarios** - Credenciales y roles (Admin, Cajero, Socio)
2. **socios** - Información personal y laboral
3. **cuentas** - Ahorro, corriente y plazo fijo
4. **prestamos** - Solicitudes y estado de préstamos
5. **pagos** - Registro de cuotas pagadas
6. **transacciones** - Depósitos, retiros y transferencias
7. **logs** - Auditoría de operaciones
8. **clientes** - Gestión de contactos

**Script completo:** `database/SCRIPT-BD-COMPLETO.sql`

---

## 👥 Control de Acceso por Rol

| Módulo | Administrador | Cajero | Socio |
|--------|--------------|--------|-------|
| Dashboard | ✅ Total | ✅ Limitado | ✅ Personal |
| Socios | ✅ CRUD completo | ❌ Solo lectura | ❌ Sin acceso |
| Cuentas | ✅ CRUD completo | ✅ CRUD completo | ✅ Solo consulta |
| Préstamos | ✅ CRUD + Aprobar | ✅ Registrar | ✅ Solo consulta |
| Pagos | ✅ CRUD completo | ✅ CRUD completo | ✅ Solo consulta |
| Transacciones | ✅ CRUD completo | ✅ CRUD completo | ❌ Sin acceso |

---

## 📚 Documentación del Proyecto

### 📘 AVANCE-1-BACKEND-BD.md
Documento técnico completo que incluye:
- Introducción y objetivos del proyecto
- Stack tecnológico detallado
- Diseño completo de base de datos (diagramas ER, esquemas SQL)
- Arquitectura del backend
- Documentación de 25+ endpoints de la API
- Sistema de autenticación y seguridad
- Resultados de pruebas con datos de prueba
- Plan de desarrollo futuro

### 🗄️ database/SCRIPT-BD-COMPLETO.sql
Script SQL ejecutable que contiene:
- Creación de base de datos
- Definición de 8 tablas con restricciones
- 3 vistas optimizadas para reportes
- 2 procedimientos almacenados
- 3 triggers de auditoría automática
- Índices compuestos para rendimiento
- Usuario administrador inicial

---

## 🧪 Pruebas

### Ejecutar Seeders de Prueba

```bash
cd backend
npm run seed
```

**Datos generados:**
- ✅ 25 socios con información completa
- ✅ 39 cuentas de diferentes tipos
- ✅ 20 préstamos (aprobados y pendientes)
- ✅ 69 pagos de préstamos
- ✅ 50 transacciones bancarias
- ✅ **Total: 164 registros**

---

## 🐛 Solución de Problemas Comunes

### Error de conexión a MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solución:** Verificar que MySQL esté ejecutándose:
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### Error de autenticación JWT

```
Error: JsonWebTokenError: invalid token
```

**Solución:** Limpiar localStorage y volver a iniciar sesión

### Puerto 3000 en uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:** Cambiar puerto en `.env` o detener proceso existente:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

---

## 🚀 Próximas Funcionalidades

### Fase 2 - Segundo Avance
- [ ] Módulo de ventanilla completo (depósitos, retiros, transferencias)
- [ ] Sistema de reportes PDF exportables
- [ ] Gráficas estadísticas interactivas
- [ ] Calculadora de préstamos con tabla de amortización
- [ ] Sistema de notificaciones en tiempo real
- [ ] Backup automático de base de datos

### Fase 3 - Versión Final
- [ ] Integración con pasarelas de pago
- [ ] App móvil con Flutter
- [ ] Sistema de mensajería interna
- [ ] Panel de auditoría avanzado
- [ ] Reportes personalizables
- [ ] Integración con contabilidad

---

## 👨‍💻 Autor

**Josué Ramos**  
Estudiante de Ingeniería en Sistemas  
Universidad Nacional Autónoma de Honduras (UNAH)

---

## 📄 Licencia

Este proyecto ha sido desarrollado con fines académicos para la materia de Análisis y Diseño de Sistemas.

---

## 📞 Contacto

¿Preguntas o sugerencias?  
📧 Email: [tu-email@ejemplo.com]  
🐙 GitHub: [@Reyes-30](https://github.com/Reyes-30)

---

**Fecha de última actualización:** Noviembre 9, 2025  
**Versión:** 1.0.0 (Primer Avance - Backend y Base de Datos)

## 📅 Historial de Avances

### **Avance 1: Backend y Base de Datos**
- **Fecha:** 23 de Noviembre de 2025
- **Estado:** ✅ Completado
- **Entregables:** Estructura de BD, API RESTful, Configuración de Servidor.

### **Avance 2: Frontend y Diseño Móvil**
- **Fecha:** 23 de Noviembre de 2025
- **Estado:** ✅ Completado
- **Entregables:**
  - Interfaz Web completa (Dashboard, Socios, Reportes, etc.).
  - Mockups de Alta Fidelidad para App Móvil.
  - Documentación de Diseño (`AVANCE-2-FRONTEND-MOCKUPS.md`).
