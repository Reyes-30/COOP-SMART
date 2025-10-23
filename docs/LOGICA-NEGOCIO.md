# 📋 LÓGICA DE NEGOCIO - COOP-SMART

## 🏦 Estructura Organizacional

### 1. **👥 SOCIOS (Miembros de la Cooperativa)**

#### Características:
- **Son dueños/miembros** de la cooperativa
- Tienen **derechos y beneficios especiales**
- Participan en **asambleas y decisiones**
- Reciben **dividendos/utilidades** al final del año
- Tienen **mejores tasas de interés** en préstamos
- Pagan una **aportación inicial** para ser socio
- Pueden realizar **aportaciones mensuales**

#### Beneficios exclusivos de socios:
- ✅ Tasas de interés preferenciales en préstamos
- ✅ Mayor rentabilidad en cuentas de ahorro
- ✅ Derecho a voto en asambleas
- ✅ Dividendos al final del ejercicio fiscal
- ✅ Acceso a productos financieros exclusivos
- ✅ Sin comisiones o comisiones reducidas

#### Campo en Base de Datos:
```sql
tipo = 'socio'
```

---

### 2. **👤 CLIENTES (Usuarios Externos)**

#### Características:
- **NO son dueños** de la cooperativa
- Son personas **externas** que usan los servicios
- Pueden abrir **cuentas de ahorro**
- Pueden solicitar **préstamos**
- **NO tienen** derechos de voto
- **NO reciben** dividendos
- Tasas de interés **regulares** (menos favorables que socios)

#### Servicios disponibles para clientes:
- ✅ Cuentas de ahorro
- ✅ Préstamos (con tasas estándar)
- ✅ Transacciones (depósitos, retiros)
- ❌ NO participan en asambleas
- ❌ NO reciben dividendos
- ❌ NO tienen acceso a productos exclusivos

#### Campo en Base de Datos:
```sql
tipo = 'cliente'
```

---

## 🔄 Diferencias Operativas

| Concepto | SOCIOS | CLIENTES |
|----------|--------|----------|
| **Aportación inicial** | ✅ Sí (obligatoria) | ❌ No |
| **Cuentas de ahorro** | ✅ Sí | ✅ Sí |
| **Préstamos** | ✅ Sí (tasas preferenciales) | ✅ Sí (tasas estándar) |
| **Tasa de interés préstamos** | 8-12% anual | 15-20% anual |
| **Tasa de interés ahorros** | 5-7% anual | 2-4% anual |
| **Comisiones** | Reducidas o sin comisiones | Comisiones estándar |
| **Dividendos** | ✅ Sí | ❌ No |
| **Derecho a voto** | ✅ Sí | ❌ No |
| **Productos exclusivos** | ✅ Sí | ❌ No |

---

## 📊 Flujo de Registro

### Para SOCIOS:
1. Llenar formulario de inscripción
2. Pagar aportación inicial (ejemplo: L. 500.00)
3. Presentar documentación (identidad, RTN, foto)
4. Aprobación por junta directiva
5. Firma de contrato de socio
6. **Tipo:** `socio`
7. **Estado:** `activo`
8. Puede crear cuentas y solicitar préstamos

### Para CLIENTES:
1. Llenar formulario de registro
2. Presentar identificación básica
3. Verificación de datos
4. **Tipo:** `cliente`
5. **Estado:** `activo`
6. Puede crear cuentas y solicitar préstamos (con condiciones diferentes)

---

## 🎯 Conversión de Cliente a Socio

Un **cliente** puede convertirse en **socio** si:
1. Tiene buen historial crediticio
2. Paga la aportación inicial
3. Cumple requisitos de la cooperativa
4. Es aprobado por la junta directiva

**Proceso en el sistema:**
- Cambiar campo `tipo` de `'cliente'` a `'socio'`
- Registrar aportación inicial
- Actualizar tasas de interés en productos existentes

---

## 💡 Reglas de Negocio Importantes

### Cuentas:
- **Socios:** Pueden tener múltiples cuentas sin restricción
- **Clientes:** Límite de 2 cuentas de ahorro

### Préstamos:
- **Socios:** 
  - Monto máximo: Hasta L. 500,000
  - Tasa: 8-12% anual
  - Plazo: Hasta 5 años
  - Garantía: Puede ser solidaria (entre socios)
  
- **Clientes:**
  - Monto máximo: Hasta L. 100,000
  - Tasa: 15-20% anual
  - Plazo: Hasta 3 años
  - Garantía: Siempre hipotecaria o prendaria

### Transacciones:
- **Socios:** Sin límite de transacciones, sin comisiones
- **Clientes:** Máximo 10 transacciones gratis/mes, luego L. 5 por transacción

---

## 🔐 Niveles de Acceso (Usuarios del Sistema)

### Administrador:
- Gestión completa de socios y clientes
- Aprobación de préstamos
- Generación de reportes
- Configuración del sistema

### Cajero:
- Registro de transacciones
- Depósitos y retiros
- Consulta de cuentas
- NO puede aprobar préstamos mayores

### Socio (Usuario):
- Ver sus propias cuentas
- Ver sus préstamos
- Solicitar préstamos
- Ver historial

---

## 📝 Notas de Implementación

1. **Al crear un préstamo:** Verificar `tipo` del socio para aplicar tasa correcta
2. **Al calcular intereses:** Usar tasa según tipo (socio/cliente)
3. **En reportes:** Separar estadísticas de socios vs clientes
4. **En el dashboard:** Mostrar KPIs separados:
   - Total Socios
   - Total Clientes
   - Préstamos a Socios
   - Préstamos a Clientes

---

## 🎨 Diseño de UI

### En la lista de Socios/Clientes:
- **Badge azul:** 👥 SOCIO
- **Badge gris:** 👤 CLIENTE

### En formularios:
- Campo para seleccionar **Tipo:** Socio / Cliente
- Si es **socio:** Mostrar campos adicionales (aportación, fecha ingreso)
- Si es **cliente:** Campos simplificados

### En préstamos:
- Mostrar automáticamente la tasa según el tipo
- Calcular cuotas con tasa correcta
- Indicador visual del tipo de solicitante

---

## ✅ Implementación en el Sistema

Esta lógica ya está preparada en la base de datos con el campo `tipo` en la tabla `socios`.

**Próximo paso:** Crear la interfaz que maneje correctamente esta lógica.
