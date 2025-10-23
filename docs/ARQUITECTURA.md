# 🏗️ Arquitectura del Sistema COOP-SMART

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS FINALES                         │
├─────────────────────────────────────────────────────────────┤
│  👨‍💼 Administrador  │  👨‍💻 Cajero  │  👤 Socio/Cliente      │
└──────────┬──────────────────────┬──────────────────┬────────┘
           │                      │                  │
           └──────────────────────┴──────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   🌐 NAVEGADOR WEB         │
                    │   (Vue.js + Nuxt)          │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   📱 APP MÓVIL             │
                    │   (Flutter)                │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   🔌 API REST              │
                    │   (Node.js + Express)      │
                    │   Puerto: 3000             │
                    └─────────────┬──────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
    ┌───────────▼─────────┐           ┌───────────▼─────────┐
    │   🗄️ MySQL          │           │   🍃 MongoDB        │
    │   Base de Datos     │           │   Logs/Auditoría    │
    │   Principal         │           │   (Opcional)        │
    └─────────────────────┘           └─────────────────────┘
```

---

## 🏛️ Arquitectura del Backend (N-Capas)

```
┌──────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │           RUTAS (routes/)                          │  │
│  │  • auth.routes.js                                  │  │
│  │  • socios.routes.js                                │  │
│  │  • cuentas.routes.js                               │  │
│  │  • prestamos.routes.js                             │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                  CAPA DE MIDDLEWARES                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  • Verificación de Token JWT                       │  │
│  │  • Verificación de Roles                           │  │
│  │  • Logger de Auditoría                             │  │
│  │  • Validación de Datos                             │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                  CAPA DE LÓGICA DE NEGOCIO               │
│  ┌────────────────────────────────────────────────────┐  │
│  │           CONTROLADORES (controllers/)             │  │
│  │  • auth.controller.js                              │  │
│  │  • socios.controller.js                            │  │
│  │  • cuentas.controller.js                           │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    CAPA DE DATOS                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              MODELOS (models/)                     │  │
│  │  • Usuario.js (Sequelize)                          │  │
│  │  • Socio.js (Sequelize)                            │  │
│  │  • Cuenta.js (Sequelize)                           │  │
│  │  • Prestamo.js (Sequelize)                         │  │
│  │  • Pago.js (Sequelize)                             │  │
│  │  • Transaccion.js (Sequelize)                      │  │
│  │  • Log.js (Mongoose)                               │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐              ┌──────▼────────┐
│   MySQL        │              │   MongoDB     │
│   (Relacional) │              │   (NoSQL)     │
└────────────────┘              └───────────────┘
```

---

## 🔐 Flujo de Autenticación

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Cliente │                 │   API   │                 │   BD    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  POST /api/auth/login     │                           │
     │  {user, password}         │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  SELECT usuario           │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  <usuario encontrado>     │
     │                           │<──────────────────────────┤
     │                           │                           │
     │                           │ Verificar password        │
     │                           │ con bcrypt                │
     │                           │                           │
     │                           │ Generar JWT token         │
     │                           │                           │
     │  {token, usuario}         │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │  Peticiones siguientes    │                           │
     │  Authorization: Bearer    │                           │
     │  <token>                  │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Verificar token           │
     │                           │ Extraer datos usuario     │
     │                           │                           │
     │  Respuesta autorizada     │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
```

---

## 💰 Flujo de Transacción (Depósito)

```
┌────────┐         ┌─────────┐         ┌──────────┐         ┌─────┐
│ Cajero │         │   API   │         │  MySQL   │         │ Log │
└───┬────┘         └────┬────┘         └────┬─────┘         └──┬──┘
    │                   │                   │                   │
    │ POST /cuentas/1/  │                   │                   │
    │ depositar         │                   │                   │
    │ {monto: 1000}     │                   │                   │
    ├──────────────────>│                   │                   │
    │                   │                   │                   │
    │                   │ Verificar token   │                   │
    │                   │ Verificar rol     │                   │
    │                   │                   │                   │
    │                   │ SELECT cuenta     │                   │
    │                   ├──────────────────>│                   │
    │                   │                   │                   │
    │                   │ <cuenta>          │                   │
    │                   │<──────────────────┤                   │
    │                   │                   │                   │
    │                   │ Calcular nuevo    │                   │
    │                   │ saldo             │                   │
    │                   │                   │                   │
    │                   │ BEGIN TRANSACTION │                   │
    │                   │                   │                   │
    │                   │ UPDATE cuenta     │                   │
    │                   │ SET saldo = nuevo │                   │
    │                   ├──────────────────>│                   │
    │                   │                   │                   │
    │                   │ INSERT transaccion│                   │
    │                   ├──────────────────>│                   │
    │                   │                   │                   │
    │                   │ COMMIT            │                   │
    │                   │                   │                   │
    │                   │ Registrar log     │                   │
    │                   ├───────────────────────────────────────>│
    │                   │                   │                   │
    │ {mensaje, saldo,  │                   │                   │
    │  transaccion}     │                   │                   │
    │<──────────────────┤                   │                   │
    │                   │                   │                   │
```

---

## 📊 Modelo de Datos (Relacional)

```
┌──────────────┐
│   USUARIOS   │
├──────────────┤
│ • id (PK)    │
│ • usuario    │───┐
│ • password   │   │
│ • rol        │   │
│ • activo     │   │
└──────────────┘   │
                   │
                   │ aprobado_por
                   │ recibido_por
                   │ realizado_por
                   │
┌──────────────┐   │              ┌───────────────┐
│   SOCIOS     │   │              │  PRESTAMOS    │
├──────────────┤   │              ├───────────────┤
│ • id (PK)    │───┼─────────────>│ • id (PK)     │
│ • identidad  │   │  id_socio    │ • monto       │
│ • nombre     │   │              │ • tasa        │
│ • tipo       │   │              │ • estado      │
│ • estado     │   │              │ • aprobado_por│──┘
└──────┬───────┘   │              └───────┬───────┘
       │           │                      │
       │ id_socio  │                      │ id_prestamo
       │           │                      │
       ▼           │                      ▼
┌──────────────┐   │              ┌───────────────┐
│   CUENTAS    │   │              │     PAGOS     │
├──────────────┤   │              ├───────────────┤
│ • id (PK)    │   │              │ • id (PK)     │
│ • numero     │   │              │ • monto       │
│ • saldo      │   │              │ • fecha       │
│ • tipo       │   │              │ • recibido_por│──┘
│ • estado     │   │              └───────────────┘
└──────┬───────┘   │
       │           │
       │ id_cuenta │
       ▼           │
┌──────────────┐   │
│TRANSACCIONES │   │
├──────────────┤   │
│ • id (PK)    │   │
│ • tipo       │   │
│ • monto      │   │
│ • saldo_ant  │   │
│ • saldo_nue  │   │
│ • realizado  │───┘
└──────────────┘

                 ┌──────────────┐
                 │  LOGS (Mongo)│
                 ├──────────────┤
                 │ • usuario_id │
                 │ • accion     │
                 │ • modulo     │
                 │ • timestamp  │
                 │ • datos      │
                 └──────────────┘
```

---

## 🔒 Sistema de Roles y Permisos

```
┌──────────────────────────────────────────────────────────┐
│                    ADMINISTRADOR                         │
├──────────────────────────────────────────────────────────┤
│ • Acceso completo a todos los módulos                    │
│ • Gestión de usuarios                                    │
│ • Ver logs de auditoría                                  │
│ • Aprobar préstamos                                      │
│ • Generar reportes                                       │
│ • Configuración del sistema                              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                        CAJERO                            │
├──────────────────────────────────────────────────────────┤
│ • Crear/Editar socios y clientes                         │
│ • Operaciones de cuentas (depósitos/retiros)             │
│ • Registrar pagos de préstamos                           │
│ • Consultar información                                  │
│ • NO puede: eliminar, aprobar préstamos, ver logs        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                         SOCIO                            │
├──────────────────────────────────────────────────────────┤
│ • Ver sus propias cuentas                                │
│ • Ver sus préstamos                                      │
│ • Consultar movimientos                                  │
│ • Actualizar datos personales                            │
│ • NO puede: ver otros socios, hacer transacciones        │
└──────────────────────────────────────────────────────────┘
```

---

## 🌐 Arquitectura Frontend (Por Implementar)

```
┌────────────────────────────────────────────────────────┐
│                  NUXT.JS APPLICATION                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │              PAGES (Páginas)                    │  │
│  │  • login.vue                                    │  │
│  │  • dashboard.vue                                │  │
│  │  • socios/index.vue                             │  │
│  │  • socios/[id].vue                              │  │
│  │  • cuentas/index.vue                            │  │
│  │  • prestamos/index.vue                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │           COMPONENTS (Componentes)              │  │
│  │  • Navbar.vue                                   │  │
│  │  • Sidebar.vue                                  │  │
│  │  • SocioForm.vue                                │  │
│  │  • CuentaCard.vue                               │  │
│  │  • TransaccionModal.vue                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │            STORE (Pinia - Estado)               │  │
│  │  • auth.js (autenticación)                      │  │
│  │  • socios.js (gestión socios)                   │  │
│  │  • cuentas.js (gestión cuentas)                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │           COMPOSABLES (Lógica)                  │  │
│  │  • useApi.js (llamadas API)                     │  │
│  │  • useAuth.js (autenticación)                   │  │
│  │  • useNotification.js (notificaciones)          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ HTTP/REST (Axios)
                     │
          ┌──────────▼──────────┐
          │   BACKEND API       │
          │   (Node.js)         │
          └─────────────────────┘
```

---

## 📱 Arquitectura Móvil (Por Implementar)

```
┌─────────────────────────────────────────────────────────┐
│                 FLUTTER APPLICATION                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SCREENS (Pantallas)                 │  │
│  │  • login_screen.dart                             │  │
│  │  • dashboard_screen.dart                         │  │
│  │  • cuentas_screen.dart                           │  │
│  │  • prestamos_screen.dart                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              WIDGETS (Componentes)               │  │
│  │  • cuenta_card.dart                              │  │
│  │  • transaccion_item.dart                         │  │
│  │  • custom_button.dart                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            PROVIDERS (Estado - Provider)         │  │
│  │  • auth_provider.dart                            │  │
│  │  • cuenta_provider.dart                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              SERVICES (Servicios)                │  │
│  │  • api_service.dart (HTTP con Dio)               │  │
│  │  • storage_service.dart (SharedPreferences)      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP/REST (Dio)
                      │
           ┌──────────▼──────────┐
           │   BACKEND API       │
           │   (Node.js)         │
           └─────────────────────┘
```

---

## 🔄 Flujo de Datos Completo

```
┌─────────┐                          ┌──────────┐
│ USUARIO │◄────────────────────────►│ FRONTEND │
└─────────┘                          └────┬─────┘
                                          │
                        Axios/Dio         │
                        HTTP/REST         │
                                          ▼
                                    ┌─────────┐
                                    │   API   │
                                    │ (Node)  │
                                    └────┬────┘
                                         │
                        ┌────────────────┼────────────────┐
                        │                │                │
                   ┌────▼────┐      ┌───▼───┐      ┌────▼────┐
                   │ MySQL   │      │ Mongo │      │ Redis   │
                   │ (Datos) │      │ (Logs)│      │ (Cache) │
                   └─────────┘      └───────┘      └─────────┘
                                                    (Futuro)
```

---

## 🛡️ Capas de Seguridad

```
┌──────────────────────────────────────────────────────────┐
│ 1. CAPA DE APLICACIÓN                                    │
│    • Validación de entrada                               │
│    • Escape de datos                                     │
│    • Sanitización                                        │
└──────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────┐
│ 2. CAPA DE AUTENTICACIÓN                                 │
│    • JWT con expiración                                  │
│    • Bcrypt (hash de passwords)                          │
│    • Verificación de token en cada request               │
└──────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────┐
│ 3. CAPA DE AUTORIZACIÓN                                  │
│    • Sistema de roles                                    │
│    • Verificación de permisos                            │
│    • Control de acceso a recursos                        │
└──────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────┐
│ 4. CAPA DE RED                                           │
│    • HTTPS (en producción)                               │
│    • CORS configurado                                    │
│    • Helmet (headers de seguridad)                       │
└──────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────┐
│ 5. CAPA DE DATOS                                         │
│    • Sequelize (previene SQL injection)                  │
│    • Transacciones ACID                                  │
│    • Backups automáticos (configurar)                    │
└──────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────┐
│ 6. CAPA DE AUDITORÍA                                     │
│    • Logs de todas las operaciones                       │
│    • Registro de intentos fallidos                       │
│    • Trazabilidad completa                               │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Directorios

```
COOP-SMART/
│
├── backend/
│   ├── src/
│   │   ├── config/              # Configuraciones
│   │   │   ├── mysql.js
│   │   │   └── mongo.js
│   │   ├── models/              # Modelos de datos
│   │   │   ├── Usuario.js
│   │   │   ├── Socio.js
│   │   │   ├── Cuenta.js
│   │   │   ├── Prestamo.js
│   │   │   ├── Pago.js
│   │   │   ├── Transaccion.js
│   │   │   ├── Log.js
│   │   │   └── index.js
│   │   ├── controllers/         # Lógica de negocio
│   │   │   ├── auth.controller.js
│   │   │   ├── socios.controller.js
│   │   │   └── cuentas.controller.js
│   │   ├── routes/              # Rutas de API
│   │   │   ├── auth.routes.js
│   │   │   ├── socios.routes.js
│   │   │   ├── cuentas.routes.js
│   │   │   ├── clientes.routes.js
│   │   │   ├── prestamos.routes.js
│   │   │   ├── pagos.routes.js
│   │   │   ├── reportes.routes.js
│   │   │   └── logs.routes.js
│   │   ├── middlewares/         # Middlewares
│   │   │   ├── auth.js
│   │   │   └── logger.js
│   │   ├── utils/               # Utilidades
│   │   │   └── seed.js
│   │   └── app.js               # Aplicación principal
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/                    # (Por crear)
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── composables/
│   └── nuxt.config.ts
│
├── mobile/                      # (Por crear)
│   ├── lib/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── providers/
│   │   └── services/
│   └── pubspec.yaml
│
├── docs/
│   ├── database_schema.sql
│   ├── DATABASE.md
│   ├── API.md
│   ├── INSTALACION.md
│   ├── ARQUITECTURA.md
│   └── RESUMEN.md
│
├── README.md
├── INICIO-RAPIDO.md
└── .gitignore
```

---

Esta documentación proporciona una visión completa de la arquitectura del sistema COOP-SMART, desde la estructura de datos hasta el flujo de autenticación y seguridad. 🏗️
