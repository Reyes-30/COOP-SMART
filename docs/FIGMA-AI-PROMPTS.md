# 🤖 PROMPTS DE IA PARA FIGMA - COOP-SMART

## 📋 INSTRUCCIONES

### Plugins Recomendados:
1. **Musho** (más rápido)
2. **Galileo AI** (más profesional)
3. **Autodesigner** (alternativa)

### Cómo usar:
1. Instala el plugin en Figma
2. Copia y pega los prompts de abajo
3. Ajusta colores y textos según GUIA-DISENO.md
4. Exporta componentes

---

## 🎨 PROMPTS POR PANTALLA

### 1. LOGIN SCREEN

```
Create a modern banking login page with:
- Centered layout on light blue gradient background
- Large cooperative bank logo at top (COOP-SMART)
- Two input fields: username and password
- Primary blue button "Iniciar Sesión"
- "Remember me" checkbox
- "Forgot password?" link at bottom
- Clean, professional, minimal design
- Blue color scheme (#1E40AF primary)
- Mobile responsive
```

**Ajustes después:**
- Cambiar logo por "🏦 COOP-SMART"
- Verificar colores (azul #1E40AF)

---

### 2. DASHBOARD

```
Create a banking admin dashboard with:
- Left sidebar navigation with 8 menu items (Dashboard, Socios, Cuentas, Préstamos, Pagos, Reportes, Logs, Settings)
- Top navbar with breadcrumb, notifications bell, user avatar
- Main content area with:
  * 4 KPI cards in a row showing: Total Members (324), Total Balance (L 1,234,567), Active Loans (15), Monthly Transactions (1,450)
  * Line chart showing transactions over time
  * Table of recent transactions with 5 rows
- Blue and green color scheme
- Modern, clean design
- Professional financial UI
```

**Ajustes después:**
- Iconos: 🏠 Dashboard, 👥 Socios, 💰 Cuentas, 💳 Préstamos, etc.
- Números reales de ejemplo

---

### 3. LISTA DE SOCIOS (Members List)

```
Create a banking members management page with:
- Header with title "Socios" and "+ Nuevo Socio" button (blue)
- Search bar with filters (Type, Status dropdown)
- Data table with columns: Photo, Name, ID Number, Type, Status, Actions
- 10 rows of member data with profile pictures
- Green badge for "Activo" status, red for "Inactivo"
- Pagination at bottom (1, 2, 3... 10)
- Action menu (3 dots) on each row
- Export button (CSV/Excel)
- Clean, professional design
```

**Ajustes después:**
- Reemplazar fotos con avatares genéricos
- Agregar identidades hondureñas (0801-1990-12345)

---

### 4. FORMULARIO NUEVO SOCIO (New Member Form)

```
Create a multi-step form for new bank member registration with:
- Header: "Nuevo Socio" with back arrow
- Tabs: Información Personal, Contacto, Laboral, Cuentas
- Tab 1 (Personal) fields:
  * Profile photo upload circle
  * First Name and Last Name (side by side)
  * ID Number (formatted input)
  * Birth Date (date picker)
  * Gender (dropdown: M, F, Other)
- Bottom buttons: "Cancelar" (outline) and "Continuar" (blue primary)
- Clean, organized layout
- Label above each field
- Required fields marked with *
```

**Ajustes después:**
- Agregar validaciones visuales
- Placeholder "0000-0000-00000" en identidad

---

### 5. DETALLE DE SOCIO (Member Detail)

```
Create a bank member profile detail page with:
- Header with profile photo, name, ID number, "Activo" status badge
- Three info cards showing: Phone, Email, Location
- Tab navigation: Cuentas, Préstamos, Transacciones, Historial
- Active tab "Cuentas" showing:
  * List of 2 account cards
  * Each card shows: account number, type, balance, status
  * Green "Activa" badge
- "+ Nueva Cuenta" button
- Edit button (top right)
- Modern card-based layout
```

**Ajustes después:**
- Números de cuenta: ACC-2025-001
- Saldos: L 50,000.00 (formato lempiras)

---

### 6. LISTA DE CUENTAS (Accounts List)

```
Create a banking accounts list page with:
- Header: "Cuentas" with "+ Nueva Cuenta" button
- Search and filters: Type, Status, Currency
- Table with columns: Account Number, Member Name, Type, Balance, Currency, Status
- 8-10 rows of account data
- Balance in green bold numbers
- Status badges (active=green, blocked=red, inactive=gray)
- Actions menu on each row
- Sort arrows on column headers
- Pagination
```

**Ajustes después:**
- Monedas: HNL (Lempiras), USD (Dólares)
- Tipos: Ahorro, Corriente, Plazo Fijo

---

### 7. MODAL OPERACIÓN (Deposit/Withdrawal Modal)

```
Create a banking transaction modal dialog with:
- Title: "Operación en Cuenta"
- Account number and current balance prominently displayed
- Two action buttons side by side: "💵 Depositar" (green) and "💸 Retirar" (orange)
- Input field for amount with currency symbol (L)
- Description text area (optional)
- Preview of new balance
- Bottom buttons: "Cancelar" and "Confirmar Operación" (blue)
- Clean, centered modal
- Overlay background
```

**Ajustes después:**
- Validación: retiro no puede exceder saldo
- Formato moneda con comas

---

### 8. LISTA DE PRÉSTAMOS (Loans List)

```
Create a loans management page with:
- Header: "Préstamos" with "+ Solicitar Préstamo" button
- Tab filters: Todos, Solicitados, En Revisión, Aprobados, Activos, Vencidos, Pagados
- Table columns: Loan Number, Member, Amount, Monthly Payment, Status, Actions
- Status badges with colors:
  * Solicitado (blue), En Revisión (yellow), Aprobado (green)
  * Activo (green), Vencido (red), Pagado (gray)
- Progress bar showing payment completion
- Sort and filter options
```

**Ajustes después:**
- Números: PRE-2025-001
- Montos: L 100,000.00

---

### 9. SOLICITUD DE PRÉSTAMO (Loan Application)

```
Create a loan application form with:
- Title: "Nueva Solicitud de Préstamo"
- Step indicator: 1/4 steps
- Fields:
  * Member selection (searchable dropdown)
  * Loan amount (large input with L symbol)
  * Loan type (dropdown: Personal, Vehicular, Hipotecario)
  * Term in months
  * Interest rate (%)
- Auto-calculator showing:
  * Monthly payment
  * Total to pay
  * Interest total
- Next/Previous buttons
- Modern, wizard-style layout
```

**Ajustes después:**
- Calculadora automática de cuota mensual
- Validar monto mínimo

---

### 10. REGISTRO DE PAGO (Payment Registration)

```
Create a loan payment registration form with:
- Loan information header (number, member, balance)
- Large payment amount input
- Payment method dropdown (Efectivo, Cheque, Transferencia, Tarjeta)
- Reference number field
- Payment breakdown card showing:
  * Capital amount
  * Interest amount
  * Late fee (if any)
  * Total
- Date picker (defaults to today)
- "Registrar Pago" button (green)
- Receipt preview option
```

**Ajustes después:**
- Cálculo automático de capital/interés
- Imprimir recibo

---

### 11. DASHBOARD DE REPORTES (Reports Dashboard)

```
Create a reports and analytics dashboard with:
- Date range picker (from/to)
- "Generar Reporte" button
- Grid of 6 report cards:
  1. Balance General (income/expenses icon)
  2. Estado de Cuentas (accounts icon)
  3. Cartera de Préstamos (loans icon)
  4. Transacciones (transactions icon)
  5. Morosidad (late payments icon)
  6. Crecimiento (growth chart icon)
- Each card has: title, description, [PDF] [Excel] buttons
- Modern, organized grid layout
```

**Ajustes después:**
- Iconos apropiados para cada reporte
- Añadir filtros avanzados

---

### 12. NAVEGACIÓN MOBILE (Bottom Tab Bar)

```
Create a mobile bottom navigation bar with:
- 5 tabs with icons and labels:
  1. Dashboard (home icon)
  2. Socios (people icon)
  3. Cuentas (wallet icon)
  4. Préstamos (credit card icon)
  5. Más (menu icon)
- Active state with blue color and indicator
- Inactive state in gray
- Clean, modern design
- 60-70px height
```

---

## 🎨 CONFIGURACIÓN DE COLORES (APLICAR A TODOS)

Después de generar con IA, reemplaza estos colores:

```
Primary Blue: #1E40AF
Primary Hover: #1E3A8A
Secondary Green: #059669
Success: #10B981
Warning: #F59E0B
Error: #EF4444
Gray Background: #F9FAFB
```

---

## ⚡ WORKFLOW RÁPIDO

### Opción A: Con Musho (5-10 min por pantalla)
1. Abre Figma
2. Plugins → Musho
3. Pega prompt
4. Genera
5. Ajusta colores y textos
6. Listo ✅

### Opción B: Con Galileo AI (más detallado)
1. Galileo AI plugin
2. Pega prompt + especifica "blue banking theme"
3. Genera
4. Refina con ediciones manuales
5. Listo ✅

### Tiempo Total Estimado:
- **Con IA:** 2-3 horas (vs 11 horas manual)
- **12 pantallas x 15 min** = 3 horas

---

## 🎯 PRIORIDAD DE PANTALLAS

### Alta (hacer primero):
1. Login
2. Dashboard
3. Lista Socios
4. Lista Cuentas

### Media:
5. Formulario Socio
6. Detalle Socio
7. Modal Operación
8. Lista Préstamos

### Baja (opcional):
9. Solicitud Préstamo
10. Registro Pago
11. Reportes
12. Mobile Nav

---

## 💡 TIPS IMPORTANTES

1. **Genera primero en INGLÉS** - La IA funciona mejor
2. **Ajusta después** - Cambia textos a español manualmente
3. **Usa Auto Layout** - La IA ya lo aplica, aprovéchalo
4. **Crea variantes** - Para estados (hover, active, disabled)
5. **Exporta componentes** - Guárdalos en librería compartida

---

**Próxima acción:** Instalar plugin Musho o Galileo AI en Figma y empezar con Login
