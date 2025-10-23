# 🧪 PRUEBAS DEL API - COOP-SMART

El servidor está corriendo en: **http://localhost:3000**

---

## ✅ ESTADO ACTUAL

- ✅ MySQL conectado correctamente
- ✅ Base de datos `coop_smart` creada
- ✅ 6 tablas creadas (usuarios, socios, cuentas, prestamos, pagos, transacciones)
- ✅ Backend corriendo en puerto 3000
- ⚠️ MongoDB desconectado (opcional - solo para logs)

---

## 🔐 CREDENCIALES DE PRUEBA

Necesitas crear usuarios primero. Usa este script:

```bash
cd c:\Users\JOSUE\Desktop\COOP-SMART\backend
node src/utils/create-users.js
```

(Voy a crear este archivo a continuación)

---

## 📋 ENDPOINTS DISPONIBLES

### 1️⃣ Verificar que el servidor responde

**URL**: http://localhost:3000

**Método**: GET

**Respuesta esperada**:
```json
{
  "message": "API de COOP-SMART funcionando",
  "version": "1.0.0",
  "timestamp": "2025-10-21T..."
}
```

**Probar en navegador**: Solo abre http://localhost:3000

---

### 2️⃣ Login de Usuario

**URL**: http://localhost:3000/api/auth/login

**Método**: POST

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "nombre_usuario": "admin",
  "contrasena": "admin123"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre_usuario": "admin",
      "email": "admin@coopsmart.com",
      "rol": "administrador",
      "nombre_completo": "Administrador del Sistema"
    }
  }
}
```

**Cómo probar**:

**Opción A - Con PowerShell**:
```powershell
$body = @{
    nombre_usuario = "admin"
    contrasena = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Opción B - Con Postman**:
1. Crear nuevo request
2. Método: POST
3. URL: http://localhost:3000/api/auth/login
4. Body → raw → JSON:
```json
{
  "nombre_usuario": "admin",
  "contrasena": "admin123"
}
```

---

### 3️⃣ Obtener Perfil (requiere token)

**URL**: http://localhost:3000/api/auth/perfil

**Método**: GET

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_usuario": "admin",
    "email": "admin@coopsmart.com",
    "rol": "administrador",
    "nombre_completo": "Administrador del Sistema",
    "activo": true
  }
}
```

---

### 4️⃣ Listar Socios

**URL**: http://localhost:3000/api/socios

**Método**: GET

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
```

**Query Params (opcionales)**:
- `pagina=1`
- `limite=10`
- `busqueda=juan`
- `tipo=socio`
- `estado=activo`

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "socios": [],
    "paginacion": {
      "total": 0,
      "pagina": 1,
      "limite": 10,
      "totalPaginas": 0
    }
  }
}
```

---

### 5️⃣ Crear un Socio

**URL**: http://localhost:3000/api/socios

**Método**: POST

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
Content-Type: application/json
```

**Body**:
```json
{
  "identidad": "0801199912345",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fecha_nacimiento": "1999-05-15",
  "genero": "M",
  "telefono": "2234-5678",
  "celular": "9876-5432",
  "email": "juan.perez@email.com",
  "direccion": "Col. Kennedy, Blvd. del Norte",
  "ciudad": "Tegucigalpa",
  "departamento": "Francisco Morazán",
  "tipo": "socio",
  "ocupacion": "Ingeniero",
  "lugar_trabajo": "Empresa Tech S.A.",
  "ingresos_mensuales": 25000.00
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Socio creado exitosamente",
  "data": {
    "id": 1,
    "identidad": "0801199912345",
    "nombre": "Juan",
    "apellido": "Pérez",
    ...
  }
}
```

---

### 6️⃣ Crear una Cuenta

**URL**: http://localhost:3000/api/cuentas

**Método**: POST

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
Content-Type: application/json
```

**Body**:
```json
{
  "id_socio": 1,
  "tipo_cuenta": "ahorro",
  "saldo_inicial": 1000.00,
  "tasa_interes": 5.5,
  "moneda": "HNL"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Cuenta creada exitosamente",
  "data": {
    "id": 1,
    "numero_cuenta": "2025102112345",
    "id_socio": 1,
    "tipo_cuenta": "ahorro",
    "saldo": 1000.00,
    ...
  }
}
```

---

### 7️⃣ Realizar Depósito

**URL**: http://localhost:3000/api/cuentas/:id/depositar

**Método**: POST

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
Content-Type: application/json
```

**Body**:
```json
{
  "monto": 500.00,
  "descripcion": "Depósito de nómina"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Depósito realizado exitosamente",
  "data": {
    "transaccion": {
      "numero_transaccion": "TXN-2025102112345",
      "tipo": "deposito",
      "monto": 500.00,
      "saldo_anterior": 1000.00,
      "saldo_nuevo": 1500.00
    },
    "cuenta": {
      "saldo": 1500.00
    }
  }
}
```

---

### 8️⃣ Realizar Retiro

**URL**: http://localhost:3000/api/cuentas/:id/retirar

**Método**: POST

**Headers**:
```
Authorization: Bearer {TOKEN_DEL_LOGIN}
Content-Type: application/json
```

**Body**:
```json
{
  "monto": 200.00,
  "descripcion": "Retiro para compras"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Retiro realizado exitosamente",
  "data": {
    "transaccion": {
      "numero_transaccion": "TXN-2025102112346",
      "tipo": "retiro",
      "monto": 200.00,
      "saldo_anterior": 1500.00,
      "saldo_nuevo": 1300.00
    },
    "cuenta": {
      "saldo": 1300.00
    }
  }
}
```

---

## 🔧 PRÓXIMOS PASOS

1. ✅ Crear usuarios con el script
2. ✅ Probar login y obtener token
3. ✅ Crear algunos socios
4. ✅ Crear cuentas para los socios
5. ✅ Probar depósitos y retiros
6. 📝 Documentar con Swagger
7. 🎨 Crear prototipos en Figma
8. 💻 Iniciar desarrollo del frontend

---

**Última actualización**: 21 de Octubre de 2025
