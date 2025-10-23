# 🔌 API REST - Endpoints de COOP-SMART

URL Base: `http://localhost:3000/api`

---

## 🔐 Autenticación

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "nombre_usuario": "admin",
  "contrasena": "admin123"
}
```

**Respuesta**:
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre_usuario": "admin",
    "nombre_completo": "Administrador",
    "rol": "administrador"
  }
}
```

### Obtener Perfil
```http
GET /api/auth/perfil
Authorization: Bearer {token}
```

### Cambiar Contraseña
```http
PUT /api/auth/cambiar-contrasena
Authorization: Bearer {token}
Content-Type: application/json

{
  "contrasena_actual": "admin123",
  "contrasena_nueva": "nuevacontrasena"
}
```

---

## 👥 Socios

### Listar Socios
```http
GET /api/socios?pagina=1&limite=10&busqueda=juan&tipo=socio&estado=activo
Authorization: Bearer {token}
```

**Parámetros**:
- `pagina` (opcional): Número de página (default: 1)
- `limite` (opcional): Registros por página (default: 10)
- `busqueda` (opcional): Buscar por nombre, apellido o identidad
- `tipo` (opcional): socio | cliente
- `estado` (opcional): activo | inactivo | suspendido

**Respuesta**:
```json
{
  "socios": [...],
  "paginacion": {
    "total": 50,
    "pagina": 1,
    "limite": 10,
    "total_paginas": 5
  }
}
```

### Obtener Socio por ID
```http
GET /api/socios/:id
Authorization: Bearer {token}
```

### Crear Socio
```http
POST /api/socios
Authorization: Bearer {token}
Content-Type: application/json

{
  "identidad": "0801199012345",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fecha_nacimiento": "1990-05-15",
  "genero": "M",
  "telefono": "22451234",
  "celular": "98765432",
  "email": "juan@example.com",
  "direccion": "Colonia Las Palmas",
  "ciudad": "Tegucigalpa",
  "departamento": "Francisco Morazán",
  "tipo": "socio",
  "ocupacion": "Ingeniero",
  "lugar_trabajo": "Empresa XYZ",
  "ingresos_mensuales": 25000.00
}
```

**Permisos**: Administrador, Cajero

### Actualizar Socio
```http
PUT /api/socios/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "telefono": "22459999",
  "direccion": "Nueva dirección"
}
```

**Permisos**: Administrador, Cajero

### Eliminar Socio
```http
DELETE /api/socios/:id
Authorization: Bearer {token}
```

**Permisos**: Solo Administrador

---

## 💰 Cuentas

### Listar Cuentas
```http
GET /api/cuentas?pagina=1&limite=10&id_socio=5&estado=activa
Authorization: Bearer {token}
```

### Obtener Cuenta por ID
```http
GET /api/cuentas/:id
Authorization: Bearer {token}
```

### Crear Cuenta
```http
POST /api/cuentas
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_socio": 5,
  "tipo_cuenta": "ahorro",
  "monto_inicial": 500.00,
  "tasa_interes": 2.5,
  "moneda": "HNL"
}
```

**Permisos**: Administrador, Cajero

### Realizar Depósito
```http
POST /api/cuentas/:id/depositar
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto": 1000.00,
  "descripcion": "Depósito en efectivo"
}
```

**Permisos**: Administrador, Cajero

### Realizar Retiro
```http
POST /api/cuentas/:id/retirar
Authorization: Bearer {token}
Content-Type: application/json

{
  "monto": 500.00,
  "descripcion": "Retiro en efectivo"
}
```

**Permisos**: Administrador, Cajero

---

## 📋 Préstamos (En desarrollo)

```http
GET /api/prestamos
Authorization: Bearer {token}
```

---

## 💳 Pagos (En desarrollo)

```http
GET /api/pagos
Authorization: Bearer {token}
```

---

## 📊 Reportes (En desarrollo)

```http
GET /api/reportes
Authorization: Bearer {token}
```

**Permisos**: Administrador, Cajero

---

## 📝 Logs/Bitácora

### Obtener Logs
```http
GET /api/logs?pagina=1&limite=50&usuario_id=1&modulo=socios&fecha_inicio=2025-01-01
Authorization: Bearer {token}
```

**Parámetros**:
- `pagina`: Número de página
- `limite`: Registros por página
- `usuario_id`: Filtrar por usuario
- `modulo`: auth | socios | cuentas | prestamos | pagos | reportes
- `accion`: Acción específica
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `fecha_fin`: Fecha final (YYYY-MM-DD)

**Permisos**: Solo Administrador

---

## 🔒 Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Petición incorrecta
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error del servidor

---

## 🛡️ Autenticación

Todas las rutas (excepto `/api/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

El token expira en 24 horas (configurable en `.env`).

---

## 📋 Roles y Permisos

| Endpoint | Administrador | Cajero | Socio |
|----------|---------------|--------|-------|
| Login | ✅ | ✅ | ✅ |
| Ver socios | ✅ | ✅ | ❌ |
| Crear/Editar socios | ✅ | ✅ | ❌ |
| Eliminar socios | ✅ | ❌ | ❌ |
| Ver cuentas | ✅ | ✅ | ✅* |
| Crear cuentas | ✅ | ✅ | ❌ |
| Depósitos/Retiros | ✅ | ✅ | ❌ |
| Ver préstamos | ✅ | ✅ | ✅* |
| Ver logs | ✅ | ❌ | ❌ |

*Socios solo pueden ver sus propias cuentas y préstamos

---

## 🧪 Ejemplo de Prueba

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario":"admin","contrasena":"admin123"}'

# 2. Listar socios (usa el token del paso 1)
curl -X GET http://localhost:3000/api/socios \
  -H "Authorization: Bearer {tu_token_aqui}"
```
