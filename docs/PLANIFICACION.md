# 📋 PLANIFICACIÓN DEL PROYECTO COOP-SMART
**Desarrollo de Aplicaciones de Vanguardia**

---

## 📌 INFORMACIÓN GENERAL

**Nombre del Proyecto**: COOP-SMART  
**Tipo de Aplicación**: Sistema de Gestión para Cooperativas de Ahorro y Crédito  
**Fecha de Inicio**: 17 de Octubre de 2025  
**Fecha de Entrega Estimada**: Diciembre 2025  
**Estado Actual**: Fase 3 - Desarrollo (Backend Completado)

---

## 1️⃣ FASE DE PLANIFICACIÓN ✅

### 1.1 Idea y Propuesta del Proyecto

**Descripción**:  
Sistema digital completo para cooperativas de ahorro y crédito en Honduras que permita:
- Gestión de socios y clientes
- Manejo de cuentas de ahorro (depósitos, retiros, consultas)
- Gestión de préstamos (solicitud, aprobación, pagos)
- Generación de reportes financieros
- Auditoría completa de operaciones

**Justificación**:  
Las cooperativas en Honduras aún utilizan sistemas manuales o desactualizados. COOP-SMART moderniza estas operaciones con una solución web y móvil integrada.

**Usuarios Objetivo**:
- Administradores (gestión completa)
- Cajeros (operaciones diarias)
- Socios (consulta de información)

---

### 1.2 Tecnologías y Arquitectura

#### **Stack Tecnológico Completo**

```
┌─────────────────────────────────────────────┐
│           APLICACIÓN MÓVIL                  │
│              (Flutter)                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           FRONTEND WEB                      │
│        (Vue.js + Nuxt.js)                   │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────┐
│           BACKEND API                       │
│        (Node.js + Express)                  │
│         Autenticación JWT                   │
└──────────────┬──────────────┬───────────────┘
               │              │
    ┌──────────▼─────┐   ┌───▼──────────┐
    │     MySQL      │   │   MongoDB    │
    │  (Relacional)  │   │   (NoSQL)    │
    └────────────────┘   └──────────────┘
```

#### **Tecnologías Específicas**

| Componente | Tecnología | Versión | Justificación |
|------------|-----------|---------|---------------|
| **Backend Runtime** | Node.js | v24.5.0 | Asíncrono, escalable, ecosistema amplio |
| **Backend Framework** | Express.js | v4.18.2 | Minimalista, flexible, ampliamente adoptado |
| **BD Relacional** | MySQL | v8.0+ | Datos transaccionales y relacionales |
| **BD NoSQL** | MongoDB | v6.0+ | Logs, auditoría, datos no estructurados |
| **ORM** | Sequelize | v6.35.2 | Manejo eficiente de MySQL |
| **ODM** | Mongoose | v8.0.3 | Manejo de MongoDB |
| **Autenticación** | JWT | v9.0.2 | Stateless, seguro, escalable |
| **Encriptación** | bcrypt | v5.1.1 | Hash de contraseñas seguro |
| **Frontend Framework** | Vue.js | v3.x | Reactivo, componentes, fácil integración |
| **SSR Framework** | Nuxt.js | v3.x | SEO, rendimiento, SSR/SSG |
| **Estilos CSS** | Tailwind CSS | v3.x | Utility-first, personalizable |
| **Estado Frontend** | Pinia | Latest | Store moderno para Vue 3 |
| **HTTP Cliente** | Axios | v1.x | Interceptores, manejo de errores |
| **App Móvil** | Flutter | v3.x | Multiplataforma, nativo, performante |
| **HTTP Móvil** | Dio | v5.x | Cliente HTTP robusto para Flutter |
| **Estado Móvil** | Provider | Latest | Gestión de estado eficiente |

---

#### **Arquitectura del Backend (N-Capas)**

```
┌───────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN                  │
│  (Rutas - routes/)                            │
│  • Define endpoints REST                      │
│  • Mapea URLs a controladores                 │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│         CAPA DE MIDDLEWARES                   │
│  (middlewares/)                               │
│  • Verificación JWT                           │
│  • Validación de roles                        │
│  • Logger de auditoría                        │
│  • Manejo de errores                          │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│      CAPA DE LÓGICA DE NEGOCIO                │
│  (Controladores - controllers/)               │
│  • Lógica de autenticación                    │
│  • Operaciones CRUD                           │
│  • Cálculos financieros                       │
│  • Validaciones de negocio                    │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│         CAPA DE ACCESO A DATOS                │
│  (Modelos - models/)                          │
│  • Definición de esquemas                     │
│  • Relaciones entre entidades                 │
│  • Queries a base de datos                    │
└──────────────────┬────────────────────────────┘
                   │
       ┌───────────┴──────────┐
       │                      │
┌──────▼─────┐        ┌──────▼─────┐
│   MySQL    │        │  MongoDB   │
└────────────┘        └────────────┘
```

---

#### **División de Responsabilidades entre Bases de Datos**

##### **MySQL - Datos Relacionales y Transaccionales**
```
✅ Usado para:
├── Usuarios (autenticación, roles)
├── Socios/Clientes (información personal)
├── Cuentas de Ahorro (saldos, tipos)
├── Préstamos (montos, plazos, estados)
├── Pagos (transacciones de préstamos)
└── Transacciones (depósitos, retiros)

📊 Justificación:
• Relaciones complejas entre entidades
• Integridad referencial (foreign keys)
• Transacciones ACID requeridas
• Queries complejos con JOINs
• Datos críticos del negocio
```

##### **MongoDB - Datos No Estructurados y Logs**
```
✅ Usado para:
├── Logs de Auditoría
│   ├── Registro de acciones de usuarios
│   ├── Historial de cambios
│   └── Intentos de acceso
├── Configuraciones del Sistema (futuro)
├── Notificaciones (futuro)
└── Sesiones temporales (futuro)

📊 Justificación:
• Esquema flexible (no todos los logs son iguales)
• Alto volumen de escrituras
• No requiere relaciones complejas
• Queries simples por fecha/usuario
• Datos históricos que no se modifican
```

---

#### **Estructura de Carpetas del Proyecto**

```
COOP-SMART/
│
├── 📁 backend/                    ✅ COMPLETADO
│   ├── src/
│   │   ├── config/               # Configuraciones DB
│   │   │   ├── mysql.js
│   │   │   └── mongo.js
│   │   ├── models/               # Modelos de datos
│   │   │   ├── Usuario.js       (MySQL)
│   │   │   ├── Socio.js         (MySQL)
│   │   │   ├── Cuenta.js        (MySQL)
│   │   │   ├── Prestamo.js      (MySQL)
│   │   │   ├── Pago.js          (MySQL)
│   │   │   ├── Transaccion.js   (MySQL)
│   │   │   ├── Log.js           (MongoDB)
│   │   │   └── index.js
│   │   ├── controllers/          # Lógica de negocio
│   │   │   ├── auth.controller.js
│   │   │   ├── socios.controller.js
│   │   │   ├── cuentas.controller.js
│   │   │   ├── prestamos.controller.js (por completar)
│   │   │   ├── pagos.controller.js (por completar)
│   │   │   └── reportes.controller.js (por crear)
│   │   ├── routes/               # Rutas API REST
│   │   │   ├── auth.routes.js
│   │   │   ├── socios.routes.js
│   │   │   ├── cuentas.routes.js
│   │   │   ├── prestamos.routes.js
│   │   │   ├── pagos.routes.js
│   │   │   ├── reportes.routes.js
│   │   │   └── logs.routes.js
│   │   ├── middlewares/          # Middlewares
│   │   │   ├── auth.js          (JWT, roles)
│   │   │   ├── logger.js        (auditoría)
│   │   │   └── validator.js     (por crear)
│   │   ├── utils/                # Utilidades
│   │   │   ├── seed.js          (datos prueba)
│   │   │   ├── pdf.js           (por crear)
│   │   │   └── excel.js         (por crear)
│   │   └── app.js                # Servidor principal
│   ├── tests/                    # Pruebas (por crear)
│   │   ├── auth.test.js
│   │   ├── socios.test.js
│   │   └── cuentas.test.js
│   ├── .env                      # Variables de entorno
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── 📁 frontend/                   ⏳ POR CREAR
│   ├── pages/                    # Páginas Nuxt
│   │   ├── index.vue            (home)
│   │   ├── login.vue
│   │   ├── dashboard.vue
│   │   ├── socios/
│   │   │   ├── index.vue        (lista)
│   │   │   ├── [id].vue         (detalle)
│   │   │   └── crear.vue
│   │   ├── cuentas/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── prestamos/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   └── reportes/
│   │       └── index.vue
│   ├── components/               # Componentes Vue
│   │   ├── layout/
│   │   │   ├── Navbar.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Footer.vue
│   │   ├── socios/
│   │   │   ├── SocioForm.vue
│   │   │   ├── SocioCard.vue
│   │   │   └── SocioTable.vue
│   │   ├── cuentas/
│   │   │   ├── CuentaCard.vue
│   │   │   ├── TransaccionModal.vue
│   │   │   └── SaldoWidget.vue
│   │   └── common/
│   │       ├── Button.vue
│   │       ├── Input.vue
│   │       └── Modal.vue
│   ├── store/                    # Pinia stores
│   │   ├── auth.js
│   │   ├── socios.js
│   │   ├── cuentas.js
│   │   └── prestamos.js
│   ├── composables/              # Composables Vue
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   └── useNotification.js
│   ├── services/                 # Servicios API
│   │   ├── api.js               (axios config)
│   │   ├── authService.js
│   │   ├── sociosService.js
│   │   └── cuentasService.js
│   ├── assets/
│   │   ├── css/
│   │   └── images/
│   ├── nuxt.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── 📁 mobile/                     ⏳ POR CREAR
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/              # Pantallas
│   │   │   ├── splash_screen.dart
│   │   │   ├── login_screen.dart
│   │   │   ├── home_screen.dart
│   │   │   ├── dashboard_screen.dart
│   │   │   ├── socios/
│   │   │   │   ├── socios_list_screen.dart
│   │   │   │   └── socio_detail_screen.dart
│   │   │   ├── cuentas/
│   │   │   │   ├── cuentas_screen.dart
│   │   │   │   └── transacciones_screen.dart
│   │   │   └── prestamos/
│   │   │       ├── prestamos_screen.dart
│   │   │       └── pagos_screen.dart
│   │   ├── widgets/              # Widgets reutilizables
│   │   │   ├── cuenta_card.dart
│   │   │   ├── transaccion_item.dart
│   │   │   ├── custom_button.dart
│   │   │   └── loading_widget.dart
│   │   ├── providers/            # Estado (Provider)
│   │   │   ├── auth_provider.dart
│   │   │   ├── socio_provider.dart
│   │   │   └── cuenta_provider.dart
│   │   ├── services/             # Servicios
│   │   │   ├── api_service.dart (Dio)
│   │   │   ├── storage_service.dart
│   │   │   └── auth_service.dart
│   │   ├── models/               # Modelos
│   │   │   ├── usuario.dart
│   │   │   ├── socio.dart
│   │   │   ├── cuenta.dart
│   │   │   └── transaccion.dart
│   │   └── utils/
│   │       ├── constants.dart
│   │       └── validators.dart
│   ├── assets/
│   │   └── images/
│   ├── android/
│   ├── ios/
│   ├── pubspec.yaml
│   └── README.md
│
├── 📁 docs/                       ✅ COMPLETADO
│   ├── planificacion/            # Fase 1
│   │   ├── PLANIFICACION.md     (este archivo)
│   │   └── CRONOGRAMA.md
│   ├── diseno/                   # Fase 2 (por crear)
│   │   ├── prototipos/
│   │   ├── modelo-datos.md
│   │   └── guia-estilos.md
│   ├── desarrollo/               # Fase 3
│   │   ├── API.md
│   │   ├── DATABASE.md
│   │   └── ARQUITECTURA.md
│   ├── pruebas/                  # Fase 4 (por crear)
│   │   ├── plan-pruebas.md
│   │   └── casos-prueba.md
│   └── entrega/                  # Fase 5 (por crear)
│       ├── manual-usuario.md
│       └── manual-tecnico.md
│
├── 📁 tests/                      ⏳ POR CREAR
│   ├── postman/
│   │   └── COOP-SMART.postman_collection.json
│   └── e2e/
│
├── .github/                       ⏳ POR CREAR
│   └── workflows/
│       └── ci.yml                # GitHub Actions
│
├── README.md                      ✅
├── INICIO-RAPIDO.md               ✅
├── .gitignore                     ✅
└── package.json                   (monorepo - opcional)
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Componentes Completados ✅

| Componente | Progreso | Archivos | Líneas de Código |
|------------|----------|----------|------------------|
| Backend API | 100% | 30 | ~3,000 |
| Modelos de Datos | 100% | 7 | ~800 |
| Controladores | 60% | 3/5 | ~600 |
| Rutas API | 100% | 8 | ~300 |
| Middlewares | 100% | 2 | ~200 |
| Documentación | 100% | 8 | ~2,500 |
| Base de Datos MySQL | 100% | 1 SQL | ~350 |
| Base de Datos MongoDB | 100% | 1 modelo | ~100 |

**Total Backend**: ~7,850 líneas de código

### Componentes Pendientes ⏳

| Componente | Progreso | Prioridad |
|------------|----------|-----------|
| Frontend Web (Nuxt) | 0% | 🔴 Alta |
| App Móvil (Flutter) | 0% | 🔴 Alta |
| Prototipos UI/UX | 0% | 🟡 Media |
| Swagger Docs | 0% | 🟡 Media |
| Pruebas Postman | 0% | 🟡 Media |
| GitHub Actions | 0% | 🟢 Baja |

---

## 🎯 SIGUIENTES PASOS INMEDIATOS

1. ✅ **Completar instalación de MySQL** (requisito para ejecutar backend)
2. ⏳ **Crear prototipos UI/UX en Figma** (Fase 2)
3. ⏳ **Iniciar desarrollo Frontend** (Fase 3)
4. ⏳ **Documentar API con Swagger** (Fase 3)
5. ⏳ **Crear colección Postman** (Fase 4)

---

**Última actualización**: 21 de Octubre de 2025  
**Versión del documento**: 1.0  
**Estado del proyecto**: ✅ Backend completado, ⏳ Frontend pendiente
