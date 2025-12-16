# 📱 COOP-SMART Móvil

App móvil para socios y clientes de la cooperativa COOP-SMART.

## 🎯 Características

- ✅ **Ver cuentas** - Consultar saldos y detalles de todas las cuentas
- ✅ **Transferencias** - Enviar dinero a otras cuentas
- ✅ **Préstamos** - Ver estado y progreso de préstamos activos
- ✅ **Historial** - Consultar todas las transacciones realizadas
- ✅ **Perfil** - Gestionar datos personales
- ✅ **PWA** - Se puede instalar como app nativa en el celular

## 📲 Instalación como App

### En Android (Chrome):
1. Abre `http://localhost:3000/mobile` en Chrome
2. Toca los 3 puntos del menú
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

### En iPhone (Safari):
1. Abre `http://localhost:3000/mobile` en Safari
2. Toca el botón de compartir (📤)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

## 🛠️ Requisitos Técnicos

### Backend (Ya existente)
- Node.js + Express
- MySQL
- JWT para autenticación

### Para desarrollo local
```bash
cd backend
npm run dev
```

La app móvil se sirve desde: `http://localhost:3000/mobile`

## 🔐 Acceso

Solo usuarios con rol `socio` o `cliente` pueden usar la app móvil.

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| socio1 | 123456 | Socio |

## 📁 Estructura del Proyecto

```
mobile/
├── index.html          # Página principal (SPA)
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker para cache
├── css/
│   └── app.css        # Estilos de la app
├── js/
│   ├── api.js         # Servicio de conexión al backend
│   └── app.js         # Lógica principal de la app
└── icons/             # Iconos de la app (pendiente)
```

## 🎨 Diseño

- **Tema:** Oscuro con acentos azules
- **Tipografía:** System fonts
- **Estilo:** Minimalista y moderno
- **Navegación:** Bottom navigation bar

## 📝 Notas de Desarrollo

### Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/cuentas` | Listar cuentas |
| GET | `/api/cuentas/:id` | Detalle cuenta |
| GET | `/api/transacciones` | Historial |
| POST | `/api/transacciones` | Nueva transferencia |
| GET | `/api/prestamos` | Listar préstamos |

### LocalStorage

- `mobile_token` - Token JWT
- `mobile_user` - Datos del usuario

## 🚀 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Biometría para login
- [ ] QR para transferencias
- [ ] Modo offline completo
- [ ] Exportar movimientos en PDF
