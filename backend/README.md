# 🏦 Backend COOP-SMART

API REST para el sistema de gestión de cooperativas COOP-SMART.

## 📋 Requisitos Previos

Antes de ejecutar el backend, asegúrate de tener instalado:

- **Node.js** v18 o superior ✅
- **MySQL** 8.0 o superior
- **MongoDB** (opcional, para logs)

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del backend (copia desde `.env.example`):

```bash
cp .env.example .env
```

Edita el archivo `.env` con tu configuración:

```env
PORT=3000
DB_HOST=localhost
DB_NAME=coop_smart
DB_USER=root
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_clave_secreta
```

### 3. Crear la base de datos

Ejecuta el script SQL en MySQL:

```bash
mysql -u root -p < ../docs/database_schema.sql
```

O crea la base de datos manualmente:

```sql
CREATE DATABASE coop_smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Inicializar datos de prueba (opcional)

```bash
node src/utils/seed.js
```

Esto creará:
- 3 usuarios de prueba (admin, cajero, socio)
- 3 socios de ejemplo
- 3 cuentas de ahorro

## 🎬 Ejecutar el servidor

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (MySQL, MongoDB)
│   ├── models/          # Modelos de base de datos
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Rutas de la API
│   ├── middlewares/     # Middlewares (auth, logger)
│   ├── utils/           # Utilidades y helpers
│   └── app.js           # Punto de entrada
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
└── package.json         # Dependencias
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil

### Socios
- `GET /api/socios` - Listar socios
- `POST /api/socios` - Crear socio
- `GET /api/socios/:id` - Obtener socio
- `PUT /api/socios/:id` - Actualizar socio
- `DELETE /api/socios/:id` - Eliminar socio

### Cuentas
- `GET /api/cuentas` - Listar cuentas
- `POST /api/cuentas` - Crear cuenta
- `POST /api/cuentas/:id/depositar` - Depósito
- `POST /api/cuentas/:id/retirar` - Retiro

Ver documentación completa en: `../docs/API.md`

## 🧪 Probar la API

### Con curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario":"admin","contrasena":"admin123"}'

# Listar socios (con token)
curl -X GET http://localhost:3000/api/socios \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Con herramientas:
- Postman
- Insomnia
- Thunder Client (extensión de VS Code)

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación con JWT
- ✅ Validación de entrada
- ✅ Protección contra SQL injection (Sequelize)
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Logs de auditoría

## 📝 Credenciales de Prueba

Después de ejecutar `seed.js`:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| cajero1 | admin123 | Cajero |
| socio1 | admin123 | Socio |

⚠️ **Importante**: Cambia estas contraseñas en producción.

## 🐛 Troubleshooting

### Error de conexión a MySQL
```
❌ Error al conectar a MySQL: Access denied
```
**Solución**: Verifica usuario y contraseña en `.env`

### Error de puerto en uso
```
❌ Error: listen EADDRINUSE: address already in use :::3000
```
**Solución**: Cambia el puerto en `.env` o cierra la aplicación que usa el puerto 3000

### MongoDB no conecta
```
⚠️ El sistema funcionará sin logs en MongoDB
```
**Nota**: MongoDB es opcional. El sistema funciona sin él, pero no se guardarán logs de auditoría.

## 📦 Scripts Disponibles

```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm test           # Ejecutar pruebas (próximamente)
```

## 🤝 Contribuir

1. Crea una rama para tu feature
2. Haz commit de tus cambios
3. Push a la rama
4. Abre un Pull Request

## 📄 Licencia

Sistema desarrollado para cooperativas de ahorro y crédito en Honduras.
