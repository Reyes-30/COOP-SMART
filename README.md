# 🏦 COOP-SMART - Sistema de Gestión para Cooperativas

Sistema digital completo para cooperativas de ahorro y crédito en Honduras.

## 🎯 Características Principales

- ✅ Gestión de socios y clientes
- 💰 Cuentas de ahorro (depósitos, retiros)
- 📊 Préstamos (solicitud, aprobación, pagos)
- 💳 Operaciones financieras
- 📈 Reportes y estadísticas
- 🔐 Seguridad con JWT
- 📝 Bitácora de auditoría

## 🧱 Arquitectura

- **Backend**: Node.js + Express + MySQL + MongoDB
- **Frontend**: Vue.js + Nuxt.js + Tailwind CSS
- **Mobile**: Flutter (próximamente)

## 📁 Estructura del Proyecto

```
coop-smart/
├── backend/       # API REST
├── frontend/      # Aplicación web
├── mobile/        # App móvil (Flutter)
├── docs/          # Documentación
└── README.md
```

## 🔧 Requisitos

- Node.js v18+
- MySQL 8.0+
- MongoDB (opcional, para logs)
- Flutter 3.0+ (para móvil)

## 🚀 Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## 👥 Roles de Usuario

- **Administrador**: Acceso completo
- **Cajero**: Operaciones y transacciones
- **Socio**: Consulta de cuentas y préstamos

## 📝 Documentación

Ver carpeta `docs/` para:
- Diagramas de arquitectura
- Modelo de base de datos
- API endpoints
- Manual de usuario

## 📄 Licencia

Desarrollado para cooperativas de ahorro y crédito en Honduras.

---

**Versión**: 1.0.0  
**Fecha**: Octubre 2025
