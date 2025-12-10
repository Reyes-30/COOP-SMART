# 📋 PLAN DE ACCIÓN - COOP-SMART

## 🎯 Resumen de la Conversación

Has identificado correctamente **3 temas críticos** que necesitamos resolver:

1. ✅ **Sistema de Roles y Permisos** - DOCUMENTADO
2. ⚠️ **Sistema de Transacciones de Ventanilla** - PENDIENTE DE IMPLEMENTAR
3. ✅ **Módulo de Pagos** - SOLUCIONADO

---

## ✅ LO QUE YA ESTÁ LISTO

### 1. Sistema de Roles DEFINIDO
- **3 roles creados**: Administrador, Cajero, Socio
- **Middleware de autenticación** implementado (`verificarToken`, `verificarRol`)
- **Permisos definidos** en archivo `SISTEMA-ROLES-Y-PERMISOS.md`
- **Base de datos** ya tiene columna `rol` en tabla `usuarios`

### 2. Módulo de Pagos CORREGIDO
- ✅ Columna `numero_cuota` agregada a tabla `pagos`
- ✅ Seed ejecutado exitosamente con 69 pagos
- ✅ Endpoint `/api/pagos` implementado con asociaciones completas
- ✅ Frontend normaliza campos `monto` → `monto_pagado`

### 3. Datos de Prueba CARGADOS
- ✅ 25 socios con datos realistas de Honduras
- ✅ 39 cuentas (ahorro, corriente, plazo fijo)
- ✅ 20 préstamos con amortización calculada
- ✅ 69 pagos distribuidos en los préstamos
- ✅ 50 transacciones (depósitos, retiros, transferencias)

---

## ⚠️ LO QUE FALTA IMPLEMENTAR

### PRIORIDAD 1: Módulo de Transacciones de Ventanilla 💰

#### A. Interfaz para DEPÓSITOS
**Ubicación**: `frontend/transacciones.html` → Agregar formulario modal

**Campos necesarios**:
```html
- Buscar socio (autocomplete)
- Seleccionar cuenta del socio
- Monto a depositar
- Método de pago (efectivo, cheque, transferencia)
- Referencia (opcional - número de cheque, boleta)
- Descripción (opcional)
```

**Flujo**:
1. Cajero/Admin hace clic en "➕ Nuevo Depósito"
2. Modal se abre con formulario
3. Busca socio por nombre o identidad
4. Sistema carga las cuentas del socio
5. Selecciona cuenta destino
6. Ingresa monto
7. Submit → POST `/api/transacciones/deposito`
8. Backend:
   - Valida monto > 0
   - Obtiene saldo actual de la cuenta
   - Crea transacción tipo 'deposito'
   - Actualiza saldo de cuenta
   - Genera número de transacción
   - Retorna datos del recibo
9. Frontend muestra recibo con opción de imprimir

**Endpoint Backend** (CREAR):
```javascript
// backend/src/routes/transacciones.routes.js

router.post('/deposito',
  verificarToken,
  verificarRol('administrador', 'cajero'),
  async (req, res) => {
    const { id_cuenta, monto, metodo_pago, referencia, descripcion } = req.body;
    
    // Validaciones
    // Obtener cuenta y saldo actual
    // Crear transacción
    // Actualizar saldo
    // Retornar recibo
  }
);
```

---

#### B. Interfaz para RETIROS
**Similar a depósitos**, pero con validación de saldo suficiente.

**Validaciones adicionales**:
- `saldo_actual >= monto_a_retirar`
- Si no hay fondos → mostrar error claro

**Endpoint Backend** (CREAR):
```javascript
router.post('/retiro',
  verificarToken,
  verificarRol('administrador', 'cajero'),
  async (req, res) => {
    // Validar saldo suficiente
    // Si saldo < monto → error 400
    // Crear transacción tipo 'retiro'
    // Actualizar saldo
  }
);
```

---

#### C. Interfaz para TRANSFERENCIAS
**Transferencia entre 2 cuentas** dentro de la cooperativa.

**Campos**:
```html
- Cuenta origen (buscar socio → seleccionar cuenta)
- Cuenta destino (buscar socio → seleccionar cuenta)
- Monto
- Descripción
```

**Flujo**:
1. Ingresa cuenta origen
2. Verifica saldo disponible
3. Ingresa cuenta destino
4. Ingresa monto
5. Submit → POST `/api/transacciones/transferencia`
6. Backend **crea 2 transacciones**:
   - Transacción 1: tipo 'transferencia_salida' en cuenta origen
   - Transacción 2: tipo 'transferencia_entrada' en cuenta destino
7. Ambas comparten misma `referencia` para vincularlas
8. **Transacción atómica**: Si una falla, revierten ambas

**Endpoint Backend** (CREAR):
```javascript
router.post('/transferencia',
  verificarToken,
  verificarRol('administrador', 'cajero'),
  async (req, res) => {
    const { id_cuenta_origen, id_cuenta_destino, monto, descripcion } = req.body;
    
    // Iniciar transacción de base de datos
    const t = await sequelize.transaction();
    
    try {
      // Validar saldo en cuenta origen
      // Crear transacción_salida
      // Crear transacción_entrada
      // Actualizar ambos saldos
      // Commit
      await t.commit();
    } catch (error) {
      // Rollback si algo falla
      await t.rollback();
      throw error;
    }
  }
);
```

---

### PRIORIDAD 2: Control de UI según Rol 🔐

Actualmente **todos los usuarios ven los mismos botones**. Necesitamos:

#### A. Ocultar botones según rol
**Archivo**: `frontend/js/auth.js` (crear función global)

```javascript
// auth.js
function verificarPermisos() {
  const usuario = JSON.parse(localStorage.getItem('user'));
  const rol = usuario.rol;
  
  // Ocultar botones de eliminación si NO es admin
  if (rol !== 'administrador') {
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.style.display = 'none';
    });
  }
  
  // Ocultar botón de aprobar préstamos si NO es admin
  if (rol !== 'administrador') {
    document.querySelectorAll('.btn-aprobar').forEach(btn => {
      btn.style.display = 'none';
    });
  }
  
  // Cajeros no pueden ver logs
  if (rol === 'cajero') {
    // Ocultar enlace de logs en menú
  }
}
```

#### B. Aplicar en cada módulo
En cada archivo JS (`socios.js`, `cuentas.js`, etc.) llamar:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  verificarPermisos();
  // ... resto del código
});
```

---

### PRIORIDAD 3: Módulo de Usuarios (Solo Admin) 👥

**Crear nuevo módulo**: `frontend/usuarios.html`

**Funcionalidades**:
1. ✅ Listar todos los usuarios (tabla)
2. ➕ Crear nuevo usuario (administrador, cajero, socio)
3. ✏️ Editar usuario (nombre, email, rol)
4. 🔒 Activar/desactivar usuario
5. 🔑 Cambiar contraseña

**Endpoint Backend** (YA EXISTE parcialmente):
- GET `/api/auth/usuarios` - Listar (CREAR)
- POST `/api/auth/registro` - Crear (YA EXISTE)
- PUT `/api/auth/usuarios/:id` - Editar (CREAR)
- DELETE `/api/auth/usuarios/:id` - Eliminar (CREAR)

---

### PRIORIDAD 4: Sistema de Aprobación de Préstamos ✅❌

**Modificar**: `frontend/prestamos.html`

**Agregar botones**:
- ✅ Aprobar (solo visible para administrador)
- ❌ Rechazar (solo visible para administrador)

**Endpoints Backend** (CREAR):
```javascript
// backend/src/routes/prestamos.routes.js

router.put('/:id/aprobar',
  verificarToken,
  verificarRol('administrador'),
  async (req, res) => {
    // Actualizar estado a 'aprobado'
    // Registrar aprobado_por
    // Registrar fecha_aprobacion
  }
);

router.put('/:id/rechazar',
  verificarToken,
  verificarRol('administrador'),
  async (req, res) => {
    // Actualizar estado a 'rechazado'
    // Registrar motivo rechazo
  }
);
```

---

## 🚀 PLAN DE EJECUCIÓN RECOMENDADO

### Fase 1: Transacciones (CRÍTICO) - 2-3 días
1. ✅ Crear endpoint `/api/transacciones/deposito`
2. ✅ Crear endpoint `/api/transacciones/retiro`
3. ✅ Crear endpoint `/api/transacciones/transferencia`
4. ✅ Diseñar formularios modal en `transacciones.html`
5. ✅ Conectar frontend con backend
6. ✅ Probar flujos completos
7. ✅ Implementar impresión de recibos

### Fase 2: Control de Roles - 1 día
1. ✅ Crear función global `verificarPermisos()`
2. ✅ Aplicar en todos los módulos
3. ✅ Ocultar botones según rol
4. ✅ Probar con usuario cajero
5. ✅ Probar con usuario socio

### Fase 3: Módulo de Usuarios - 1-2 días
1. ✅ Crear HTML `usuarios.html`
2. ✅ Crear endpoints CRUD en backend
3. ✅ Implementar tabla de usuarios
4. ✅ Formularios crear/editar
5. ✅ Cambio de contraseña

### Fase 4: Aprobación de Préstamos - 1 día
1. ✅ Endpoints aprobar/rechazar
2. ✅ Botones en interfaz
3. ✅ Modal de confirmación
4. ✅ Registro de auditoría

---

## 📝 ARCHIVOS QUE NECESITAS MODIFICAR/CREAR

### CREAR:
```
backend/src/controllers/transacciones.controller.js  ← Lógica de depósito/retiro/transferencia
backend/src/controllers/usuarios.controller.js       ← CRUD de usuarios
frontend/usuarios.html                               ← Módulo de gestión de usuarios
frontend/js/usuarios.js                              ← Lógica del módulo usuarios
frontend/js/auth.js                                  ← Funciones globales de autenticación
```

### MODIFICAR:
```
backend/src/routes/transacciones.routes.js           ← Agregar rutas deposito/retiro/transferencia
backend/src/routes/prestamos.routes.js               ← Agregar rutas aprobar/rechazar
frontend/transacciones.html                          ← Agregar modales para transacciones
frontend/transacciones.js                            ← Agregar funciones deposito/retiro/transferencia
frontend/prestamos.html                              ← Agregar botones aprobar/rechazar
frontend/prestamos.js                                ← Agregar funciones aprobar/rechazar
frontend/socios.js                                   ← Aplicar verificarPermisos()
frontend/cuentas.js                                  ← Aplicar verificarPermisos()
...todos los módulos                                 ← Aplicar verificarPermisos()
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Transacciones
- [ ] Cajero puede hacer depósito en cuenta de socio
- [ ] Cajero puede hacer retiro (con validación de saldo)
- [ ] Cajero puede hacer transferencia entre cuentas
- [ ] Se genera número de transacción único
- [ ] Se actualiza saldo correctamente
- [ ] Se puede imprimir recibo
- [ ] Aparece en historial de transacciones
- [ ] Transferencia crea 2 registros vinculados

### Roles y Permisos
- [ ] Administrador ve todos los botones
- [ ] Cajero NO ve botón eliminar
- [ ] Cajero NO ve botón aprobar préstamos
- [ ] Cajero NO ve módulo de logs
- [ ] Socio solo ve su información (futuro)
- [ ] Socio NO puede hacer transacciones (futuro)

### Módulo de Usuarios
- [ ] Admin puede crear nuevo usuario
- [ ] Admin puede editar usuarios
- [ ] Admin puede cambiar roles
- [ ] Admin puede activar/desactivar usuarios
- [ ] Cajero NO puede acceder a este módulo
- [ ] Se valida unicidad de nombre_usuario y email

### Préstamos
- [ ] Solo admin ve botones aprobar/rechazar
- [ ] Al aprobar, cambia estado a 'aprobado'
- [ ] Al rechazar, cambia estado a 'rechazado'
- [ ] Se registra quién aprobó/rechazó
- [ ] Se registra fecha de aprobación/rechazo
- [ ] Aparece en logs del sistema

---

## 🎯 OBJETIVO FINAL

**Sistema completo con**:
1. ✅ 3 tipos de usuarios (Admin, Cajero, Socio)
2. ✅ Permisos granulares por rol
3. ✅ Transacciones de ventanilla (depósito, retiro, transferencia)
4. ✅ Aprobación de préstamos por administrador
5. ✅ Gestión de usuarios
6. ✅ Auditoría completa de operaciones

---

## 💬 PRÓXIMA CONVERSACIÓN

**Pregúntame**:
- "¿Empezamos con el módulo de transacciones?" → Te ayudo a crear los endpoints
- "¿Cómo implemento el control de roles en frontend?" → Te muestro código
- "¿Creamos el módulo de usuarios?" → Generamos los archivos
- "¿Necesito ayuda con [tema específico]?" → Lo resolvemos

**O simplemente dime**:
- "Empecemos con [Fase X]"
- "Muéstrame cómo hacer [funcionalidad específica]"

---

## 📚 DOCUMENTACIÓN GENERADA

1. ✅ `SISTEMA-ROLES-Y-PERMISOS.md` - Definición completa de roles
2. ✅ Este archivo - Plan de acción detallado
3. ✅ Script de migración `add-numero-cuota.js`
4. ✅ Seed actualizado con 69 pagos

---

**Estado actual**: Sistema tiene toda la base implementada. Falta conectar transacciones de ventanilla y control de UI según roles.

**Siguiente paso recomendado**: Implementar módulo de transacciones (depósito/retiro/transferencia) porque es la funcionalidad más crítica para operación diaria.

