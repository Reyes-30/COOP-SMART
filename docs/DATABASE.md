# 📊 Documentación de la Base de Datos

## Estructura General

El sistema COOP-SMART utiliza dos bases de datos:

- **MySQL**: Base de datos relacional principal para datos transaccionales
- **MongoDB**: Base de datos NoSQL para logs y auditoría

---

## 📋 Tablas MySQL

### 1. `usuarios`
**Descripción**: Almacena información de usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| nombre_usuario | VARCHAR(50) | Nombre de usuario único |
| email | VARCHAR(100) | Correo electrónico |
| contrasena_hash | VARCHAR(255) | Contraseña encriptada con bcrypt |
| rol | ENUM | administrador, cajero, socio |
| nombre_completo | VARCHAR(100) | Nombre completo del usuario |
| activo | BOOLEAN | Estado del usuario |

**Roles**:
- `administrador`: Acceso completo al sistema
- `cajero`: Operaciones y transacciones
- `socio`: Solo consulta de información personal

---

### 2. `socios`
**Descripción**: Información de socios y clientes de la cooperativa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| identidad | VARCHAR(20) | Número de identidad hondureño |
| nombre | VARCHAR(100) | Nombre del socio |
| apellido | VARCHAR(100) | Apellido del socio |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| genero | ENUM | M, F, Otro |
| telefono | VARCHAR(20) | Teléfono fijo |
| celular | VARCHAR(20) | Teléfono móvil |
| email | VARCHAR(100) | Correo electrónico |
| tipo | ENUM | socio, cliente |
| estado | ENUM | activo, inactivo, suspendido |

**Tipos**:
- `socio`: Miembro de la cooperativa con todos los derechos
- `cliente`: Usuario de servicios sin membresía completa

---

### 3. `cuentas`
**Descripción**: Cuentas de ahorro y corrientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| numero_cuenta | VARCHAR(20) | Número único de cuenta |
| id_socio | INT | Referencia al socio |
| tipo_cuenta | ENUM | ahorro, corriente, plazo_fijo |
| saldo | DECIMAL(12,2) | Saldo actual |
| tasa_interes | DECIMAL(5,2) | Tasa de interés anual (%) |
| estado | ENUM | activa, inactiva, bloqueada, cerrada |
| moneda | ENUM | HNL, USD |

---

### 4. `prestamos`
**Descripción**: Préstamos otorgados a socios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| numero_prestamo | VARCHAR(20) | Número único de préstamo |
| id_socio | INT | Referencia al socio |
| monto_aprobado | DECIMAL(12,2) | Monto aprobado |
| tasa_interes | DECIMAL(5,2) | Tasa de interés anual (%) |
| plazo_meses | INT | Plazo en meses |
| cuota_mensual | DECIMAL(10,2) | Cuota mensual calculada |
| saldo_pendiente | DECIMAL(12,2) | Saldo por pagar |
| tipo_prestamo | ENUM | personal, vehicular, hipotecario, comercial, emergencia |
| estado | ENUM | solicitado, aprobado, activo, pagado, vencido |

**Estados del préstamo**:
1. `solicitado`: Recién solicitado
2. `en_revision`: En análisis
3. `aprobado`: Aprobado pero no desembolsado
4. `desembolsado`: Dinero entregado
5. `activo`: En proceso de pago
6. `pagado`: Completamente pagado
7. `vencido`: Con pagos atrasados
8. `cancelado`: Cancelado

---

### 5. `pagos`
**Descripción**: Pagos realizados a préstamos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| numero_recibo | VARCHAR(20) | Número de recibo |
| id_prestamo | INT | Referencia al préstamo |
| monto | DECIMAL(10,2) | Monto total pagado |
| monto_capital | DECIMAL(10,2) | Monto a capital |
| monto_interes | DECIMAL(10,2) | Monto a interés |
| mora | DECIMAL(10,2) | Monto de mora |
| metodo_pago | ENUM | efectivo, cheque, transferencia, tarjeta |

---

### 6. `transacciones`
**Descripción**: Movimientos de cuentas (depósitos, retiros).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | Identificador único |
| numero_transaccion | VARCHAR(20) | Número único |
| id_cuenta | INT | Referencia a la cuenta |
| tipo | ENUM | deposito, retiro, transferencia, etc. |
| monto | DECIMAL(12,2) | Monto de la transacción |
| saldo_anterior | DECIMAL(12,2) | Saldo antes de la transacción |
| saldo_nuevo | DECIMAL(12,2) | Saldo después de la transacción |

---

## 🍃 Colección MongoDB

### `logs`
**Descripción**: Bitácora de auditoría del sistema.

```javascript
{
  usuario_id: Number,
  usuario_nombre: String,
  rol: String,
  accion: String,
  modulo: String,
  descripcion: String,
  datos_anteriores: Object,
  datos_nuevos: Object,
  ip: String,
  user_agent: String,
  resultado: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Relaciones

```
socios (1) ----< (N) cuentas
socios (1) ----< (N) prestamos
prestamos (1) ----< (N) pagos
cuentas (1) ----< (N) transacciones
usuarios (1) ----< (N) prestamos (aprobador)
usuarios (1) ----< (N) pagos (cajero)
usuarios (1) ----< (N) transacciones (cajero)
```

---

## 📊 Diagrama ER

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   SOCIOS    │       │   CUENTAS   │       │TRANSACCIONES │
├─────────────┤       ├─────────────┤       ├──────────────┤
│ • id        │───┐   │ • id        │───┐   │ • id         │
│ • identidad │   └───│ • id_socio  │   └───│ • id_cuenta  │
│ • nombre    │       │ • saldo     │       │ • monto      │
│ • tipo      │       │ • estado    │       │ • tipo       │
└─────────────┘       └─────────────┘       └──────────────┘
       │
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────┐                      ┌─────────────┐
│  PRESTAMOS  │                      │    PAGOS    │
├─────────────┤                      ├─────────────┤
│ • id        │──────────────────────│ • id        │
│ • id_socio  │                      │ • id_presta │
│ • monto     │                      │ • monto     │
│ • estado    │                      │ • fecha     │
└─────────────┘                      └─────────────┘
```

---

## 🔒 Consideraciones de Seguridad

1. **Contraseñas**: Siempre encriptadas con bcrypt (salt rounds: 10)
2. **SQL Injection**: Uso de Sequelize para prevenir inyecciones
3. **Soft Delete**: Los registros se marcan como inactivos en lugar de eliminarse
4. **Auditoría**: Todas las operaciones críticas se registran en MongoDB
5. **Restricciones**: Foreign keys con `ON DELETE RESTRICT` para evitar pérdida de datos

---

## 📝 Notas de Implementación

- **Validaciones**: A nivel de aplicación y base de datos
- **Índices**: Creados en campos frecuentemente consultados
- **Timestamps**: Automáticos en todas las tablas
- **Moneda**: Soporte para Lempiras (HNL) y Dólares (USD)
