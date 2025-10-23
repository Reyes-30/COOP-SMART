# 🎨 DISEÑO DETALLADO: LOGIN SCREEN

## 📐 ESPECIFICACIONES

### Canvas
- **Tamaño:** 1440 x 1024px (Desktop)
- **Fondo:** Gradiente lineal
  - Color inicio (top): `#1E40AF` (azul primario)
  - Color fin (bottom): `#3B82F6` (azul claro)
  - Ángulo: 135° (diagonal)

---

## 🎨 ESTRUCTURA VISUAL

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    (Fondo Gradiente Azul)                  │
│                                                            │
│                                                            │
│              ┌─────────────────────────────┐               │
│              │                             │               │
│              │  ┌───────────────────────┐  │               │
│              │  │     🏦                │  │               │
│              │  │   COOP-SMART          │  │               │
│              │  │                       │  │               │
│              │  │ Sistema de Gestión    │  │               │
│              │  │   para Cooperativas   │  │               │
│              │  └───────────────────────┘  │               │
│              │                             │               │
│              │  ┌───────────────────────┐  │               │
│              │  │ 👤 Usuario            │  │               │
│              │  │ [________________]    │  │               │
│              │  └───────────────────────┘  │               │
│              │                             │               │
│              │  ┌───────────────────────┐  │               │
│              │  │ 🔒 Contraseña         │  │               │
│              │  │ [________________] 👁  │  │               │
│              │  └───────────────────────┘  │               │
│              │                             │               │
│              │  ☐ Recordarme              │               │
│              │                             │               │
│              │  ┌───────────────────────┐  │               │
│              │  │   INICIAR SESIÓN      │  │               │
│              │  └───────────────────────┘  │               │
│              │                             │               │
│              │  ¿Olvidaste tu contraseña? │               │
│              │                             │               │
│              └─────────────────────────────┘               │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES DETALLADOS

### 1. CARD PRINCIPAL (Contenedor Blanco)

**Posición:** Centrado vertical y horizontal

**Dimensiones:**
- Ancho: `480px`
- Alto: `auto` (ajustable al contenido)
- Padding: `48px 40px`

**Estilos:**
- Background: `#FFFFFF` (blanco puro)
- Border radius: `16px`
- Box shadow: `0 20px 60px rgba(0, 0, 0, 0.2)`

---

### 2. LOGO Y TÍTULO

**🏦 Ícono:**
- Tamaño: `64px x 64px`
- Color: `#1E40AF` (azul primario)
- Centrado horizontalmente
- Margin bottom: `16px`

**Texto "COOP-SMART":**
- Font: `Inter`
- Weight: `Bold (700)`
- Size: `32px`
- Color: `#111827` (gray-900)
- Letter spacing: `-0.5px`
- Text align: `center`

**Subtítulo "Sistema de Gestión...":**
- Font: `Inter`
- Weight: `Regular (400)`
- Size: `14px`
- Color: `#6B7280` (gray-500)
- Text align: `center`
- Margin bottom: `40px`

---

### 3. INPUT USUARIO

**Label "Usuario":**
- Font: `Inter`
- Weight: `Medium (500)`
- Size: `14px`
- Color: `#374151` (gray-700)
- Margin bottom: `8px`

**Input Field:**
- Width: `100%` (400px)
- Height: `44px`
- Padding: `12px 16px 12px 44px` (espacio para ícono)
- Border: `1px solid #D1D5DB` (gray-300)
- Border radius: `8px`
- Font size: `16px`
- Color: `#111827`
- Placeholder: `"Ingresa tu usuario"`
- Placeholder color: `#9CA3AF` (gray-400)

**Ícono 👤:**
- Posición: Absoluta, 12px desde la izquierda
- Tamaño: `20px x 20px`
- Color: `#6B7280` (gray-500)

**Estado Focus:**
- Border: `2px solid #1E40AF` (azul primario)
- Box shadow: `0 0 0 3px rgba(30, 64, 175, 0.1)`
- Outline: `none`

**Margin bottom:** `24px`

---

### 4. INPUT CONTRASEÑA

**Label "Contraseña":**
- Font: `Inter`
- Weight: `Medium (500)`
- Size: `14px`
- Color: `#374151` (gray-700)
- Margin bottom: `8px`

**Input Field:**
- Width: `100%` (400px)
- Height: `44px`
- Padding: `12px 44px 12px 44px` (espacio para ambos íconos)
- Border: `1px solid #D1D5DB` (gray-300)
- Border radius: `8px`
- Font size: `16px`
- Color: `#111827`
- Placeholder: `"Ingresa tu contraseña"`
- Type: `password`

**Ícono 🔒 (izquierda):**
- Posición: Absoluta, 12px desde la izquierda
- Tamaño: `20px x 20px`
- Color: `#6B7280` (gray-500)

**Ícono 👁 (derecha - Toggle):**
- Posición: Absoluta, 12px desde la derecha
- Tamaño: `20px x 20px`
- Color: `#6B7280` (gray-500)
- Cursor: `pointer`
- Hover: Color cambia a `#374151`

**Estado Focus:**
- Border: `2px solid #1E40AF`
- Box shadow: `0 0 0 3px rgba(30, 64, 175, 0.1)`

**Margin bottom:** `20px`

---

### 5. CHECKBOX "RECORDARME"

**Contenedor:**
- Display: `flex`
- Align items: `center`
- Margin bottom: `24px`

**Checkbox:**
- Width: `18px`
- Height: `18px`
- Border: `2px solid #D1D5DB`
- Border radius: `4px`
- Margin right: `8px`

**Checkbox (Checked):**
- Background: `#1E40AF`
- Border color: `#1E40AF`
- Checkmark: Blanco

**Label:**
- Font: `Inter`
- Weight: `Regular (400)`
- Size: `14px`
- Color: `#4B5563` (gray-600)

---

### 6. BOTÓN "INICIAR SESIÓN"

**Dimensiones:**
- Width: `100%` (400px)
- Height: `48px`
- Margin bottom: `20px`

**Estilos (Estado Normal):**
- Background: `#1E40AF` (azul primario)
- Color texto: `#FFFFFF` (blanco)
- Font: `Inter`
- Weight: `Semibold (600)`
- Size: `16px`
- Border: `none`
- Border radius: `8px`
- Cursor: `pointer`
- Transition: `all 0.2s ease`

**Estado Hover:**
- Background: `#1E3A8A` (azul más oscuro)
- Transform: `translateY(-1px)`
- Box shadow: `0 4px 12px rgba(30, 64, 175, 0.3)`

**Estado Active (Click):**
- Transform: `translateY(0)`
- Box shadow: `0 2px 6px rgba(30, 64, 175, 0.2)`

**Estado Disabled:**
- Background: `#9CA3AF` (gray-400)
- Cursor: `not-allowed`
- Opacity: `0.6`

---

### 7. LINK "¿OLVIDASTE CONTRASEÑA?"

**Estilos:**
- Font: `Inter`
- Weight: `Regular (400)`
- Size: `14px`
- Color: `#1E40AF` (azul primario)
- Text align: `center`
- Text decoration: `none`
- Transition: `color 0.2s ease`

**Estado Hover:**
- Color: `#1E3A8A` (azul oscuro)
- Text decoration: `underline`

---

## 🎨 PALETA DE COLORES USADA

```css
/* Colores Principales */
--primary-bg: #1E40AF;         /* Fondo gradiente inicio */
--primary-bg-end: #3B82F6;     /* Fondo gradiente fin */
--primary-button: #1E40AF;     /* Botón principal */
--primary-button-hover: #1E3A8A;

/* Grises */
--white: #FFFFFF;              /* Card background */
--gray-900: #111827;           /* Títulos */
--gray-700: #374151;           /* Labels */
--gray-600: #4B5563;           /* Texto secundario */
--gray-500: #6B7280;           /* Íconos */
--gray-400: #9CA3AF;           /* Placeholders */
--gray-300: #D1D5DB;           /* Bordes */

/* Estados */
--focus-ring: rgba(30, 64, 175, 0.1);
```

---

## 📱 VERSIÓN RESPONSIVE (Mobile)

### Breakpoint: `< 640px`

**Ajustes:**
- Card width: `calc(100% - 32px)` (margen 16px cada lado)
- Padding: `32px 24px`
- Logo size: `48px`
- Title size: `24px`
- Input height: `42px`
- Button height: `44px`

**Fondo Mobile:**
- Gradiente: Mismo, pero más suave
- Opacidad: `0.95`

---

## ✨ ANIMACIONES Y TRANSICIONES

### 1. Entrada del Card
```css
Animation: fadeInUp
Duration: 0.6s
Easing: ease-out
Transform: translateY(20px) → translateY(0)
Opacity: 0 → 1
```

### 2. Focus en Inputs
```css
Transition: border-color 0.2s, box-shadow 0.2s
```

### 3. Hover en Botón
```css
Transition: all 0.2s ease
```

---

## 🎯 PASOS PARA CREAR EN FIGMA

### 1. Crear Frame
- Presiona `F` para crear Frame
- Nombre: "Login Desktop"
- Tamaño: 1440 x 1024

### 2. Aplicar Gradiente al Fondo
- Selecciona el frame
- Fill → Gradiente Linear
- Color 1: `#1E40AF` (posición 0%)
- Color 2: `#3B82F6` (posición 100%)
- Ángulo: `135°`

### 3. Crear Card Blanco
- Presiona `R` para rectángulo
- Tamaño: 480 x auto
- Fill: `#FFFFFF`
- Border radius: `16px`
- Effect → Drop Shadow:
  - X: `0`, Y: `20`
  - Blur: `60`
  - Color: `#000000` opacity `20%`
- Centra con Align: `Center Horizontal` y `Center Vertical`
- Auto Layout: Padding `48px` (top/bottom), `40px` (left/right)

### 4. Agregar Logo (Emoji)
- Presiona `T` para texto
- Escribe: `🏦`
- Tamaño: `64px`
- Center align

### 5. Agregar Título
- Texto: "COOP-SMART"
- Font: Inter Bold
- Size: `32px`
- Color: `#111827`

### 6. Agregar Subtítulo
- Texto: "Sistema de Gestión para Cooperativas"
- Font: Inter Regular
- Size: `14px`
- Color: `#6B7280`

### 7. Crear Input Usuario
- Frame con Auto Layout vertical
- Label: "Usuario" (Inter Medium, 14px, `#374151`)
- Espacio: `8px`
- Input field:
  - Rectángulo: 400 x 44px
  - Border: `1px`, `#D1D5DB`
  - Border radius: `8px`
  - Placeholder: "Ingresa tu usuario" (Inter Regular, 16px, `#9CA3AF`)
  - Ícono 👤 (20px) posicionado a la izquierda

### 8. Crear Input Contraseña
- Mismo proceso que Usuario
- Label: "Contraseña"
- Ícono 🔒 izquierda
- Ícono 👁 derecha

### 9. Crear Checkbox
- Frame horizontal
- Checkbox: 18 x 18px, border `2px`, radius `4px`
- Label: "Recordarme"

### 10. Crear Botón
- Rectángulo: 400 x 48px
- Fill: `#1E40AF`
- Border radius: `8px`
- Texto: "INICIAR SESIÓN" (Inter Semibold, 16px, Blanco)

### 11. Agregar Link
- Texto: "¿Olvidaste tu contraseña?"
- Inter Regular, 14px, `#1E40AF`
- Center align

### 12. Aplicar Auto Layout al Card
- Selecciona todos los elementos
- Cmd/Ctrl + Option/Alt + A
- Spacing: `24px` entre elementos
- Padding: Ya configurado antes

---

## 🎨 RESULTADO ESPERADO

![Login Preview]
- Card blanco centrado en gradiente azul
- Diseño limpio y profesional
- Íconos intuitivos
- Espaciado consistente
- Colores corporativos
- Fácil de usar

---

## ⏭️ SIGUIENTE MÓDULO

Una vez termines el Login, continuaremos con:
- **Módulo 2:** Dashboard (KPI Cards + Sidebar)

**Tiempo estimado para Login:** 30-45 minutos

---

¿Listo para empezar? ¡Abre Figma y vamos paso a paso! 🚀
