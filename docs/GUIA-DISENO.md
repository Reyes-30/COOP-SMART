# 🎨 GUÍA DE DISEÑO UI/UX - COOP-SMART

## 📋 ÍNDICE
1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Componentes](#componentes)
4. [Pantallas a Diseñar](#pantallas-a-diseñar)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Responsive Design](#responsive-design)

---

## 🎨 PALETA DE COLORES

### Colores Principales
```css
/* Primario - Azul Corporativo */
--primary-500: #1E40AF;      /* Azul principal */
--primary-600: #1E3A8A;      /* Azul hover */
--primary-700: #1E3A70;      /* Azul oscuro */

/* Secundario - Verde Financiero */
--secondary-500: #059669;    /* Verde éxito */
--secondary-600: #047857;    /* Verde hover */

/* Acento - Naranja */
--accent-500: #F59E0B;       /* Naranja alerta */
--accent-600: #D97706;       /* Naranja hover */
```

### Colores de Estado
```css
/* Estado de operaciones */
--success: #10B981;          /* Verde - Exitoso */
--warning: #F59E0B;          /* Amarillo - Advertencia */
--error: #EF4444;            /* Rojo - Error */
--info: #3B82F6;             /* Azul - Información */
```

### Colores Neutros
```css
/* Grises */
--gray-50: #F9FAFB;          /* Fondo claro */
--gray-100: #F3F4F6;         /* Fondo cards */
--gray-200: #E5E7EB;         /* Bordes */
--gray-300: #D1D5DB;         /* Bordes hover */
--gray-400: #9CA3AF;         /* Texto secundario */
--gray-500: #6B7280;         /* Texto deshabilitado */
--gray-600: #4B5563;         /* Texto normal */
--gray-700: #374151;         /* Texto títulos */
--gray-800: #1F2937;         /* Texto principal */
--gray-900: #111827;         /* Texto encabezados */

/* Blanco y Negro */
--white: #FFFFFF;
--black: #000000;
```

### Uso de Colores
- **Primario:** Botones principales, encabezados, enlaces
- **Secundario:** Indicadores de saldo positivo, transacciones exitosas
- **Acento:** Llamadas a la acción, notificaciones importantes
- **Error:** Alertas de préstamos vencidos, saldo insuficiente
- **Warning:** Préstamos próximos a vencer, límites de crédito

---

## ✍️ TIPOGRAFÍA

### Familia de Fuentes
```css
/* Fuente Principal */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Fuente Monoespaciada (números, códigos) */
font-family: 'Roboto Mono', 'Courier New', monospace;
```

### Escala Tipográfica
```css
/* Encabezados */
--text-5xl: 3rem;      /* 48px - Títulos principales */
--text-4xl: 2.25rem;   /* 36px - Títulos sección */
--text-3xl: 1.875rem;  /* 30px - Títulos cards */
--text-2xl: 1.5rem;    /* 24px - Subtítulos */
--text-xl: 1.25rem;    /* 20px - Títulos pequeños */

/* Cuerpo */
--text-lg: 1.125rem;   /* 18px - Texto destacado */
--text-base: 1rem;     /* 16px - Texto normal */
--text-sm: 0.875rem;   /* 14px - Texto secundario */
--text-xs: 0.75rem;    /* 12px - Texto pequeño */
```

### Pesos de Fuente
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 🧩 COMPONENTES PRINCIPALES

### 1. Botones

#### Variantes:
```
┌─────────────────────────────────────────┐
│ Primario (azul)  - Acciones principales │
│ Secundario (gris) - Acciones secundarias│
│ Éxito (verde)    - Aprobar, confirmar   │
│ Peligro (rojo)   - Eliminar, rechazar   │
│ Outline         - Cancelar, volver      │
│ Ghost           - Acciones terciarias   │
└─────────────────────────────────────────┘
```

#### Tamaños:
- **sm:** Padding 8px 12px, texto 14px
- **md:** Padding 10px 16px, texto 16px (default)
- **lg:** Padding 12px 24px, texto 18px

### 2. Formularios

#### Inputs:
```
┌─────────────────────────────┐
│ Label                       │
│ ┌─────────────────────────┐ │
│ │ Placeholder text...     │ │
│ └─────────────────────────┘ │
│ Texto de ayuda              │
└─────────────────────────────┘
```

- Border radius: 8px
- Height: 40px (md), 36px (sm), 44px (lg)
- Border: 1px solid gray-300
- Focus: Border azul + sombra

#### Validación:
- ✅ **Éxito:** Border verde
- ⚠️ **Advertencia:** Border amarillo
- ❌ **Error:** Border rojo + mensaje

### 3. Cards
```
┌────────────────────────────────┐
│ 📊 Título del Card            │
│ ────────────────────────────  │
│                                │
│ Contenido...                   │
│                                │
│ ┌──────────┐ ┌──────────┐    │
│ │ Acción 1 │ │ Acción 2 │    │
│ └──────────┘ └──────────┘    │
└────────────────────────────────┘
```

- Border radius: 12px
- Padding: 24px
- Box shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Sombra elevada

### 4. Tablas
```
┌──────────┬──────────┬──────────┬──────────┐
│ Nombre   │ Identidad│ Estado   │ Acciones │
├──────────┼──────────┼──────────┼──────────┤
│ Juan P.  │ 0801-... │ 🟢 Activo│ [Ver]   │
│ María G. │ 0501-... │ 🟢 Activo│ [Ver]   │
│ Carlos M.│ 1101-... │ 🔴 Inact.│ [Ver]   │
└──────────┴──────────┴──────────┴──────────┘
```

- Header: Fondo gray-50, texto semibold
- Filas: Hover con fondo gray-50
- Bordes: gray-200
- Padding: 12px 16px

### 5. Navegación

#### Sidebar (Desktop):
```
┌──────────────────┐
│ 🏦 COOP-SMART   │
├──────────────────┤
│ 🏠 Dashboard     │
│ 👥 Socios        │
│ 💰 Cuentas       │
│ 💳 Préstamos     │
│ 💵 Pagos         │
│ 📊 Reportes      │
│ 📝 Logs          │
├──────────────────┤
│ 👤 Admin         │
│ ⚙️ Configuración│
│ 🚪 Cerrar Sesión │
└──────────────────┘
```

- Width: 280px
- Background: gray-900
- Texto: gray-100
- Hover: gray-800
- Active: primary-600

#### Navbar (Mobile):
```
┌────────────────────────────────┐
│ ☰  COOP-SMART         👤 🔔  │
└────────────────────────────────┘
```

### 6. Dashboard Cards (KPIs)
```
┌─────────────────────────┐
│ 💰 Saldo Total         │
│                         │
│ L 1,234,567.89         │
│                         │
│ +12.5% vs mes anterior │
└─────────────────────────┘
```

- Ícono grande (color del estado)
- Valor principal (grande, bold)
- Tendencia (con ícono ↑↓)

---

## 📱 PANTALLAS A DISEÑAR

### 🔐 **1. AUTENTICACIÓN**

#### 1.1 Login
```
┌─────────────────────────────────────┐
│                                     │
│         🏦 COOP-SMART              │
│   Sistema de Gestión Cooperativa   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Usuario                       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Contraseña           👁        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☐ Recordarme                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     INICIAR SESIÓN            │ │
│  └───────────────────────────────┘ │
│                                     │
│  ¿Olvidaste tu contraseña?         │
│                                     │
└─────────────────────────────────────┘
```

**Elementos:**
- Logo centrado
- 2 inputs (usuario, contraseña)
- Checkbox "Recordarme"
- Botón primario grande
- Link "Olvidaste contraseña"
- Fondo: Gradiente azul suave

#### 1.2 Cambiar Contraseña
- Input contraseña actual
- Input nueva contraseña
- Input confirmar contraseña
- Indicador de fortaleza
- Botón guardar

---

### 🏠 **2. DASHBOARD**

#### 2.1 Vista General
```
┌────────────────────────────────────────────────────────┐
│ Sidebar │ Dashboard - Octubre 2025        👤 Admin    │
├────────────────────────────────────────────────────────┤
│         │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   🏠    │ │💰 Socios │ │💵 Cuentas│ │💳Préstamos│    │
│   👥    │ │   324    │ │1,234,567│ │ 450,000  │    │
│   💰    │ └──────────┘ └──────────┘ └──────────┘     │
│   💳    │                                              │
│   💵    │ ┌────────────────────────────────────────┐  │
│   📊    │ │ 📈 Gráfica de Transacciones          │  │
│   📝    │ │                                        │  │
│         │ │     [Gráfico de barras/líneas]       │  │
│         │ └────────────────────────────────────────┘  │
│         │                                              │
│   ⚙️    │ ┌────────────────────────────────────────┐  │
│   🚪    │ │ 📋 Transacciones Recientes            │  │
└────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **KPI Cards (4):**
   - Total Socios
   - Saldo en Cuentas
   - Préstamos Activos
   - Transacciones del Mes

2. **Gráfico Principal:**
   - Transacciones por día/semana/mes
   - Filtros de período

3. **Lista Transacciones Recientes:**
   - Últimas 10 transacciones
   - Ver todas →

4. **Préstamos por Vencer:**
   - Alertas de vencimientos próximos

---

### 👥 **3. MÓDULO SOCIOS**

#### 3.1 Lista de Socios
```
┌────────────────────────────────────────────────────────┐
│ Socios                                    [+ Nuevo]    │
├────────────────────────────────────────────────────────┤
│ 🔍 Buscar... [Tipo▼] [Estado▼] [Exportar▼]           │
├────────────────────────────────────────────────────────┤
│ Foto  Nombre         Identidad    Tipo    Estado  Acc.│
├────────────────────────────────────────────────────────┤
│ [👤] Juan Pérez      0801-1990... Socio   🟢Act. [⋮] │
│ [👤] María García    0501-1985... Socio   🟢Act. [⋮] │
│ [👤] Carlos López    1101-1992... Cliente 🔴Inac.[⋮] │
├────────────────────────────────────────────────────────┤
│ ← 1 2 3 ... 10 →                   Total: 324 socios  │
└────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Búsqueda en tiempo real
- Filtros (tipo, estado, departamento)
- Paginación
- Acciones: Ver, Editar, Eliminar
- Exportar CSV/Excel

#### 3.2 Crear/Editar Socio
```
┌────────────────────────────────────────────────────────┐
│ ← Nuevo Socio                                          │
├────────────────────────────────────────────────────────┤
│ [Información Personal] [Contacto] [Laboral] [Cuentas] │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 📸 Foto (opcional)                                     │
│ ┌──────────┐                                           │
│ │   [+]    │                                           │
│ └──────────┘                                           │
│                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ Nombre *            │ │ Apellido *          │       │
│ └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│ ┌───────────────────────────────────────────┐          │
│ │ Número de Identidad * (0000-0000-00000)  │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ Fecha Nacimiento *  │ │ Género * [▼]        │       │
│ └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│           [Cancelar]  [Guardar]                        │
└────────────────────────────────────────────────────────┘
```

**Validaciones:**
- Campos requeridos marcados con *
- Formato de identidad hondureña
- Edad mínima (18 años)
- Email válido
- Teléfono formato (0000-0000)

#### 3.3 Detalle de Socio
```
┌────────────────────────────────────────────────────────┐
│ ← Juan Pérez García                    [Editar] [⋮]   │
├────────────────────────────────────────────────────────┤
│ [👤 Foto]  Juan Pérez García                          │
│            0801-1990-12345                             │
│            🟢 Socio Activo                             │
│                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │📞 Teléfono   │ │📧 Email      │ │📍 Ubicación  │   │
│ │2222-5555     │ │juan@mail.com │ │Tegucigalpa   │   │
│ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│ [Cuentas] [Préstamos] [Transacciones] [Historial]    │
├────────────────────────────────────────────────────────┤
│ 💰 Cuentas (2)                          [+ Nueva]     │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 💳 Cuenta Ahorro #ACC-2025-001    L 50,000.00   │  │
│ │    Abierta: 15/01/2025            🟢 Activa     │  │
│ └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

### 💰 **4. MÓDULO CUENTAS**

#### 4.1 Lista de Cuentas
```
┌────────────────────────────────────────────────────────┐
│ Cuentas                                  [+ Nueva]     │
├────────────────────────────────────────────────────────┤
│ 🔍 Buscar... [Tipo▼] [Estado▼] [Moneda▼]             │
├────────────────────────────────────────────────────────┤
│ # Cuenta      Socio          Tipo    Saldo     Estado │
├────────────────────────────────────────────────────────┤
│ ACC-2025-001  Juan Pérez     Ahorro  L 50,000  🟢Act.│
│ ACC-2025-002  María García   Corr.   $ 2,500   🟢Act.│
│ ACC-2025-003  Carlos López   Plazo   L 100,000 🔒Bloq│
└────────────────────────────────────────────────────────┘
```

#### 4.2 Operaciones de Cuenta
```
┌────────────────────────────────────────────────────────┐
│ Cuenta #ACC-2025-001 - Juan Pérez                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│        Saldo Actual: L 50,000.00                       │
│                                                         │
│ ┌──────────────────┐ ┌──────────────────┐             │
│ │  💵 DEPOSITAR    │ │  💸 RETIRAR      │             │
│ └──────────────────┘ └──────────────────┘             │
│                                                         │
│ ┌───────────────────────────────────────────┐          │
│ │ Monto (L)                                 │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ ┌───────────────────────────────────────────┐          │
│ │ Descripción (opcional)                    │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│           [Cancelar]  [Confirmar]                      │
└────────────────────────────────────────────────────────┘
```

---

### 💳 **5. MÓDULO PRÉSTAMOS**

#### 5.1 Lista de Préstamos
```
┌────────────────────────────────────────────────────────┐
│ Préstamos                             [+ Solicitar]    │
├────────────────────────────────────────────────────────┤
│ [Todos] [Solicitados] [Activos] [Vencidos] [Pagados] │
├────────────────────────────────────────────────────────┤
│ # Préstamo   Socio        Monto      Cuota    Estado  │
├────────────────────────────────────────────────────────┤
│ PRE-2025-001 Juan Pérez   L 100,000  L 5,500  🟢Activo│
│ PRE-2025-002 María García L 50,000   L 2,800  🟡Revisión│
│ PRE-2025-003 Carlos López L 200,000  L 11,000 🔴Vencido│
└────────────────────────────────────────────────────────┘
```

#### 5.2 Solicitud de Préstamo
```
┌────────────────────────────────────────────────────────┐
│ Nueva Solicitud de Préstamo                            │
├────────────────────────────────────────────────────────┤
│ [Información] [Garantía] [Documentos] [Revisión]      │
├────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐          │
│ │ Socio * [Buscar...                     ▼] │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ Monto Solicitado *  │ │ Tipo Préstamo * [▼] │       │
│ │ L                   │ │                     │       │
│ └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ Plazo (meses) *     │ │ Tasa Interés (%) *  │       │
│ └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│ 📊 Calculadora:                                        │
│    Cuota Mensual: L 5,500.00                           │
│    Total a Pagar: L 132,000.00                         │
│                                                         │
│           [Cancelar]  [Continuar]                      │
└────────────────────────────────────────────────────────┘
```

---

### 💵 **6. MÓDULO PAGOS**

#### 6.1 Registrar Pago
```
┌────────────────────────────────────────────────────────┐
│ Registrar Pago de Cuota                                │
├────────────────────────────────────────────────────────┤
│ Préstamo: PRE-2025-001 - Juan Pérez                   │
│ Saldo Pendiente: L 95,000.00                           │
│ Próximo Vencimiento: 25/11/2025                        │
│                                                         │
│ ┌───────────────────────────────────────────┐          │
│ │ Monto del Pago *           L 5,500.00     │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ Método Pago * [▼]   │ │ # Referencia        │       │
│ │ Efectivo            │ │                     │       │
│ └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│ 💡 Desglose:                                           │
│    Capital:   L 4,500.00                               │
│    Interés:   L 1,000.00                               │
│    Mora:      L 0.00                                   │
│    ─────────────────────                               │
│    Total:     L 5,500.00                               │
│                                                         │
│           [Cancelar]  [Registrar Pago]                 │
└────────────────────────────────────────────────────────┘
```

---

### 📊 **7. MÓDULO REPORTES**

#### 7.1 Dashboard de Reportes
```
┌────────────────────────────────────────────────────────┐
│ Reportes                                               │
├────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐                 │
│ │📊 Fecha Inicio │ │📅 Fecha Fin    │ [Generar]       │
│ │ 01/10/2025     │ │ 31/10/2025     │                 │
│ └────────────────┘ └────────────────┘                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 📈 Reportes Disponibles:                               │
│                                                         │
│ ┌──────────────────────────────────────┐               │
│ │ 💰 Balance General                   │  [PDF] [Excel]│
│ │    Ingresos, Egresos, Saldo          │               │
│ └──────────────────────────────────────┘               │
│                                                         │
│ ┌──────────────────────────────────────┐               │
│ │ 📊 Estado de Cuentas                 │  [PDF] [Excel]│
│ │    Saldos por tipo de cuenta         │               │
│ └──────────────────────────────────────┘               │
│                                                         │
│ ┌──────────────────────────────────────┐               │
│ │ 💳 Cartera de Préstamos              │  [PDF] [Excel]│
│ │    Activos, Vencidos, Recuperación   │               │
│ └──────────────────────────────────────┘               │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJOS DE USUARIO

### Flujo 1: Login → Dashboard
```
[Login] → [Autenticar] → [Dashboard] → [Ver KPIs]
                            ↓
                    [Sidebar Navigation]
```

### Flujo 2: Crear Nuevo Socio
```
[Socios] → [+ Nuevo] → [Formulario Paso 1: Personal]
                            ↓
                    [Paso 2: Contacto]
                            ↓
                    [Paso 3: Laboral]
                            ↓
                    [Revisar y Guardar] → [Ver Detalle Socio]
```

### Flujo 3: Solicitar Préstamo
```
[Préstamos] → [+ Solicitar] → [Seleccionar Socio]
                                    ↓
                            [Ingresar Datos]
                                    ↓
                            [Calcular Cuota]
                                    ↓
                            [Adjuntar Garantía]
                                    ↓
                            [Revisar] → [Enviar] → [Estado: En Revisión]
```

### Flujo 4: Realizar Depósito
```
[Cuentas] → [Seleccionar Cuenta] → [Depositar]
                                        ↓
                                [Ingresar Monto]
                                        ↓
                                [Confirmar] → [Recibo] → [Imprimir]
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
/* Mobile First */
--mobile: 0-639px       /* Móviles */
--tablet: 640-1023px    /* Tablets */
--desktop: 1024-1279px  /* Escritorio */
--wide: 1280px+         /* Pantallas grandes */
```

### Adaptaciones Mobile

#### Navegación:
- Sidebar → Hamburger Menu
- Top navbar con logo y perfil
- Bottom tab bar (Dashboard, Socios, Cuentas, Más)

#### Tablas:
- Convertir a cards apilados
- Mostrar solo columnas esenciales
- Scroll horizontal si es necesario

#### Formularios:
- Inputs full width
- Botones full width en mobile
- Campos uno por fila

#### Dashboard:
- KPI Cards: 2 por fila en mobile
- Gráficos: Full width
- Scroll vertical

---

## 🎯 SIGUIENTES PASOS

### 1. Crear cuenta en Figma (GRATIS)
   - https://www.figma.com/signup

### 2. Crear nuevo proyecto
   - Nombre: "COOP-SMART UI/UX"

### 3. Configurar Design System
   - Crear paleta de colores
   - Definir estilos de texto
   - Crear componentes base

### 4. Diseñar pantallas (orden recomendado):
   1. Login
   2. Dashboard
   3. Lista de Socios
   4. Detalle de Socio
   5. Operaciones de Cuenta
   6. Lista de Préstamos
   7. Resto de pantallas

### 5. Crear prototipos interactivos
   - Enlazar pantallas
   - Simular flujos
   - Agregar transiciones

---

## 📚 RECURSOS

### Inspiración:
- **Dribbble:** Banking dashboards
- **Behance:** Financial UI
- **Material Design:** Components

### Íconos:
- **Heroicons** (https://heroicons.com)
- **Lucide** (https://lucide.dev)
- **Font Awesome**

### Fuentes:
- **Inter:** https://fonts.google.com/specimen/Inter
- **Roboto Mono:** https://fonts.google.com/specimen/Roboto+Mono

---

**Fecha:** 22 de Octubre de 2025  
**Versión:** 1.0  
**Estado:** Guía completa lista para diseño
