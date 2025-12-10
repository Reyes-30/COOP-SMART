# 🔐 Sistema de Roles y Permisos - COOP-SMART

## 📋 Tabla de Contenidos
1. [Roles de Usuario](#roles-de-usuario)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Sistema de Transacciones](#sistema-de-transacciones)
4. [Implementación Técnica](#implementación-técnica)

---

## 👥 Roles de Usuario

### 1. **ADMINISTRADOR** 🛡️
**Descripción**: Control total del sistema. Puede gestionar usuarios, configuraciones y tiene acceso a todos los módulos.

**Responsabilidades**:
- Crear y gestionar usuarios del sistema
- Aprobar y rechazar préstamos
- Ver todos los reportes y logs del sistema
- Configurar parámetros de la cooperativa
- Realizar todas las operaciones que puede hacer un cajero
- Acceso a módulo de auditoría

**Limitaciones**:
- Ninguna (acceso completo)

---

### 2. **CAJERO** 💼
**Descripción**: Personal de ventanilla que realiza operaciones diarias con socios.

**Responsabilidades**:
- Registrar nuevos socios
- Abrir y gestionar cuentas
- Realizar depósitos en ventanilla
- Realizar retiros en ventanilla
- Registrar pagos de préstamos
- Procesar transferencias entre cuentas
- Generar recibos de transacciones
- Ver información de socios y cuentas

**Limitaciones**:
- NO puede aprobar/rechazar préstamos (solo registrar solicitudes)
- NO puede eliminar socios
- NO puede crear otros usuarios
- NO puede ver logs del sistema
- NO puede modificar configuraciones del sistema
- NO puede eliminar transacciones

---

### 3. **SOCIO** 👤
**Descripción**: Miembro de la cooperativa con acceso limitado para consultar su información.

**Responsabilidades**:
- Ver su perfil personal
- Consultar sus cuentas y saldos
- Ver historial de transacciones propias
- Ver estado de sus préstamos
- Ver sus pagos realizados
- Descargar sus reportes personales

**Limitaciones**:
- NO puede ver información de otros socios
- NO puede realizar transacciones (debe ir a ventanilla)
- NO puede aprobar préstamos
- NO puede modificar datos de otros usuarios
- Acceso SOLO a su propia información

---

## 🔒 Matriz de Permisos

| Módulo / Acción | Administrador | Cajero | Socio |
|-----------------|:-------------:|:------:|:-----:|
| **Dashboard** |
| Ver estadísticas generales | ✅ | ✅ | ❌ |
| Ver estadísticas personales | ✅ | ❌ | ✅ |
| **Usuarios** |
| Listar usuarios | ✅ | ❌ | ❌ |
| Crear usuario | ✅ | ❌ | ❌ |
| Editar usuario | ✅ | ❌ | ❌ |
| Eliminar usuario | ✅ | ❌ | ❌ |
| Cambiar roles | ✅ | ❌ | ❌ |
| **Socios** |
| Listar socios | ✅ | ✅ | ❌ |
| Ver detalle socio | ✅ | ✅ | ✅ (solo propio) |
| Registrar socio | ✅ | ✅ | ❌ |
| Editar socio | ✅ | ✅ | ❌ |
| Eliminar socio | ✅ | ❌ | ❌ |
| **Cuentas** |
| Listar cuentas | ✅ | ✅ | ❌ |
| Ver detalle cuenta | ✅ | ✅ | ✅ (solo propias) |
| Abrir cuenta | ✅ | ✅ | ❌ |
| Editar cuenta | ✅ | ✅ | ❌ |
| Cerrar cuenta | ✅ | ✅ | ❌ |
| **Transacciones** |
| Listar transacciones | ✅ | ✅ | ❌ |
| Ver detalle transacción | ✅ | ✅ | ✅ (solo propias) |
| Realizar depósito | ✅ | ✅ | ❌ |
| Realizar retiro | ✅ | ✅ | ❌ |
| Realizar transferencia | ✅ | ✅ | ❌ |
| Eliminar transacción | ✅ | ❌ | ❌ |
| **Préstamos** |
| Listar préstamos | ✅ | ✅ | ❌ |
| Ver detalle préstamo | ✅ | ✅ | ✅ (solo propios) |
| Crear solicitud | ✅ | ✅ | ❌ |
| Aprobar préstamo | ✅ | ❌ | ❌ |
| Rechazar préstamo | ✅ | ❌ | ❌ |
| Editar préstamo | ✅ | ❌ | ❌ |
| Eliminar préstamo | ✅ | ❌ | ❌ |
| **Pagos** |
| Listar pagos | ✅ | ✅ | ❌ |
| Ver detalle pago | ✅ | ✅ | ✅ (solo propios) |
| Registrar pago | ✅ | ✅ | ❌ |
| Eliminar pago | ✅ | ❌ | ❌ |
| **Reportes** |
| Reportes generales | ✅ | ✅ | ❌ |
| Reportes personales | ✅ | ❌ | ✅ |
| Exportar datos | ✅ | ✅ | ❌ |
| **Logs/Auditoría** |
| Ver logs del sistema | ✅ | ❌ | ❌ |
| Ver auditoría | ✅ | ❌ | ❌ |

---

## 💵 Sistema de Transacciones

### Tipos de Transacciones

#### 1. **DEPÓSITO** 📥
**Descripción**: Ingreso de dinero a una cuenta desde ventanilla.

**Flujo**:
1. Socio llega a la cooperativa con efectivo
2. Cajero/Admin verifica identidad del socio
3. Cajero selecciona cuenta destino
4. Ingresa monto a depositar
5. Sistema valida monto > 0
6. Sistema actualiza saldo: `saldo_nuevo = saldo_anterior + monto`
7. Sistema genera número de transacción único
8. Sistema registra quién realizó el depósito (`realizado_por`)
9. Imprime recibo de depósito

**Campos**:
- `tipo`: 'deposito'
- `id_cuenta`: cuenta donde se deposita
- `monto`: cantidad depositada
- `saldo_anterior`: saldo antes del depósito
- `saldo_nuevo`: saldo después del depósito
- `realizado_por`: ID del cajero/admin
- `descripcion`: "Depósito en efectivo" (puede personalizar)
- `referencia`: Número de boleta o recibo externo (opcional)

---

#### 2. **RETIRO** 📤
**Descripción**: Extracción de dinero de una cuenta desde ventanilla.

**Flujo**:
1. Socio llega a la cooperativa solicitando retiro
2. Cajero/Admin verifica identidad (tarjeta, documento)
3. Cajero selecciona cuenta origen
4. Ingresa monto a retirar
5. Sistema valida: `saldo_anterior >= monto`
6. Si no hay fondos suficientes → ERROR
7. Sistema actualiza saldo: `saldo_nuevo = saldo_anterior - monto`
8. Sistema genera número de transacción único
9. Sistema registra quién realizó el retiro
10. Cajero entrega efectivo
11. Imprime recibo de retiro

**Campos**:
- `tipo`: 'retiro'
- `id_cuenta`: cuenta de donde se retira
- `monto`: cantidad retirada
- `saldo_anterior`: saldo antes del retiro
- `saldo_nuevo`: saldo después del retiro
- `realizado_por`: ID del cajero/admin
- `descripcion`: "Retiro en efectivo"
- `referencia`: Número de documento presentado (opcional)

**Validaciones**:
- Monto > 0
- Saldo suficiente en cuenta
- Cuenta debe estar activa

---

#### 3. **TRANSFERENCIA ENTRE CUENTAS** 🔄
**Descripción**: Movimiento de dinero de una cuenta a otra dentro de la cooperativa.

**Flujo**:
1. Socio solicita transferencia
2. Cajero/Admin verifica identidad
3. Ingresa:
   - Cuenta origen (de donde sale el dinero)
   - Cuenta destino (a donde llega el dinero)
   - Monto a transferir
4. Sistema valida:
   - Cuenta origen tiene fondos suficientes
   - Ambas cuentas existen y están activas
   - Monto > 0
5. **Sistema crea 2 transacciones**:
   
   **Transacción 1 - SALIDA**:
   - `tipo`: 'transferencia_salida'
   - `id_cuenta`: cuenta origen
   - `monto`: cantidad transferida
   - `saldo_nuevo = saldo_anterior - monto`
   - `descripcion`: "Transferencia a cuenta XXXX"
   
   **Transacción 2 - ENTRADA**:
   - `tipo`: 'transferencia_entrada'
   - `id_cuenta`: cuenta destino
   - `monto`: cantidad transferida
   - `saldo_nuevo = saldo_anterior + monto`
   - `descripcion`: "Transferencia desde cuenta XXXX"

6. Ambas transacciones comparten la misma `referencia` para vincularlas
7. Sistema genera comprobante

**Características**:
- **Transacción atómica**: Si una falla, se revierten ambas
- Mismo `realizado_por` en ambas transacciones
- Mismo `fecha_transaccion` en ambas
- `referencia` compartida para rastrearlas

---

#### 4. **OTROS TIPOS** ⚙️

##### INTERÉS
- `tipo`: 'interes'
- Abono automático de intereses a cuentas de ahorro/plazo fijo
- Realizado por proceso automático del sistema

##### CARGO
- `tipo`: 'cargo'
- Comisiones o mantenimiento de cuenta
- Puede ser automático o manual

##### APERTURA
- `tipo`: 'apertura'
- Depósito inicial al crear una cuenta
- Se registra al momento de abrir cuenta

##### CIERRE
- `tipo`: 'cierre'
- Retiro final al cerrar una cuenta
- Debe dejar saldo en 0

---

## 🔧 Implementación Técnica

### Backend - Middleware de Roles

```javascript
// Ya implementado en: backend/src/middlewares/auth.js

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      });
    }
    next();
  };
};
```

### Uso en Rutas

```javascript
// Ejemplo: Solo administrador puede eliminar socios
router.delete('/:id', 
  verificarToken,
  verificarRol('administrador'),
  sociosController.eliminar
);

// Ejemplo: Administrador y cajero pueden crear socios
router.post('/', 
  verificarToken,
  verificarRol('administrador', 'cajero'),
  sociosController.crear
);
```

### Frontend - Control de UI según Rol

```javascript
// En cada módulo, leer rol del usuario
const usuario = JSON.parse(localStorage.getItem('user'));
const rol = usuario.rol;

// Mostrar/ocultar botones según rol
if (rol === 'administrador') {
  document.getElementById('btnEliminar').style.display = 'block';
} else {
  document.getElementById('btnEliminar').style.display = 'none';
}
```

---

## 📝 Próximos Pasos

### 1. **Módulo de Usuarios** (Para Administrador)
- [ ] Crear interfaz para listar usuarios
- [ ] Formulario para crear nuevo usuario
- [ ] Editar usuarios existentes
- [ ] Activar/desactivar usuarios
- [ ] Cambiar contraseñas

### 2. **Módulo de Transacciones** (Mejorar)
- [ ] Interfaz para registrar depósitos
- [ ] Interfaz para registrar retiros
- [ ] Interfaz para transferencias entre cuentas
- [ ] Imprimir recibos de transacciones
- [ ] Validación de fondos suficientes

### 3. **Portal del Socio** (Nuevo)
- [ ] Vista de cuenta personal
- [ ] Historial de transacciones propias
- [ ] Estado de préstamos
- [ ] Descarga de estados de cuenta

### 4. **Sistema de Aprobación de Préstamos**
- [ ] Botón "Aprobar" solo visible para administrador
- [ ] Botón "Rechazar" solo visible para administrador
- [ ] Registro de quién aprobó/rechazó
- [ ] Notificaciones de estado

---

## 🎯 Resumen de Decisiones

✅ **3 Roles definidos**: Administrador, Cajero, Socio

✅ **Permisos granulares** por módulo y acción

✅ **Transacciones de ventanilla**: Depósito, Retiro, Transferencia

✅ **Middleware de autenticación** ya implementado

✅ **Validaciones de negocio** en backend

⚠️ **Pendiente**: Implementar UIs específicas para cada rol

⚠️ **Pendiente**: Módulo de usuarios para administrador

⚠️ **Pendiente**: Portal del socio

