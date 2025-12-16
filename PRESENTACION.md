# 📱 GUÍA DE PRESENTACIÓN - COOP-SMART

## 🚀 PASOS PARA LA PRESENTACIÓN

### 1️⃣ INICIAR SERVIDOR
1. Hacer doble clic en `INICIAR-SERVIDOR.bat`
2. Esperar a que aparezca "✅ Conexión a MySQL establecida correctamente"
3. **NO CERRAR** esta ventana

### 2️⃣ DEMOSTRACIÓN WEB
1. Hacer doble clic en `ABRIR-WEB.bat`
2. Se abrirá el navegador en la interfaz web
3. **Credenciales:**
   - Usuario: `admin`
   - Password: `admin123`

#### Funciones a demostrar en WEB:
- ✅ Ver lista de socios
- ✅ Gestión de cuentas
- ✅ Registro de transacciones
- ✅ Consulta de préstamos
- ✅ Reportes del sistema

### 3️⃣ DEMOSTRACIÓN MÓVIL
1. Hacer doble clic en `ABRIR-MOVIL.bat`
2. Se abrirá la app móvil
3. **Credenciales:**
   - Usuario: `josue`
   - Password: `123456`

#### Funciones a demostrar en MÓVIL:
- ✅ Login
- ✅ Ver saldo (L 50,000.00)
- ✅ Ver cuentas
- ✅ Hacer transferencia
- ✅ Ver historial de transacciones
- ✅ Consultar préstamos

### 4️⃣ DEMOSTRACIÓN DE SINCRONIZACIÓN

#### Hacer una transferencia desde el móvil:
1. En la app móvil, ir a "Transferir"
2. Ingresar datos:
   - Cuenta destino: `AH-010000` (Teresa Carmen Ruiz Pérez)
   - Monto: `1000`
   - Descripción: `Transferencia de prueba`
3. Confirmar transferencia
4. Ver mensaje de éxito

#### Verificar en la web:
1. En la interfaz web, ir a "Transacciones"
2. Buscar la transferencia recién realizada
3. **Mostrar que se refleja en tiempo real**

#### Verificar en el móvil:
1. Ir a "Historial" en la app móvil
2. Ver la transferencia registrada
3. Ver que el saldo se actualizó: `L 49,000.00`

---

## 📊 CUENTAS DISPONIBLES PARA TRANSFERENCIAS

| Número de Cuenta | Propietario | Tipo | Saldo |
|-----------------|-------------|------|-------|
| CA14162832446 | Josué David Reyes Yanes | Ahorro | L 50,000.00 |
| AH-010000 | Teresa Carmen Ruiz Pérez | Ahorro | L 63,000.00 |

---

## 🎯 PUNTOS CLAVE DE LA PRESENTACIÓN

1. **Sistema completo:** Web + Móvil
2. **Sincronización en tiempo real:** Las transacciones se reflejan inmediatamente
3. **Seguridad:** Autenticación JWT, roles de usuario
4. **PWA:** La app móvil funciona en cualquier dispositivo
5. **Responsive:** Funciona en desktop, tablet y móvil

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Si el servidor no inicia:
1. Verificar que MySQL esté corriendo (XAMPP)
2. Cerrar cualquier proceso de Node.js anterior
3. Reiniciar `INICIAR-SERVIDOR.bat`

### Si aparece error de conexión:
1. Verificar que el servidor esté corriendo
2. Verificar la URL: `http://localhost:3000`

---

## ✨ FLUJO DE DEMOSTRACIÓN RECOMENDADO

1. **Introducción (2 min)**
   - Mostrar el login web
   - Explicar roles de usuario

2. **Funcionalidades Web (5 min)**
   - Dashboard
   - Gestión de socios
   - Cuentas y transacciones

3. **App Móvil (5 min)**
   - Login
   - Vista de cuentas
   - Realizar transferencia

4. **Sincronización (3 min)**
   - Mostrar la transferencia en web
   - Mostrar actualización de saldo en móvil

5. **Cierre (2 min)**
   - Resaltar características clave
   - Preguntas y respuestas

---

## 📞 CONTACTO
Sistema COOP-SMART - Sistema de Gestión para Cooperativas
