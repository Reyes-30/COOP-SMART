# 🗄️ GUÍA RÁPIDA: Crear Base de Datos con phpMyAdmin

## 📋 PASO 1: Acceder a phpMyAdmin

1. Abre tu navegador
2. Ve a: **http://localhost/phpmyadmin**
3. Deberías ver la interfaz de phpMyAdmin

---

## 🔧 PASO 2: Importar el Script SQL (OPCIÓN RECOMENDADA)

### Método más rápido y seguro:

1. En phpMyAdmin, haz clic en la pestaña **"SQL"** (arriba)

2. Copia **TODO** el contenido del archivo `database_schema.sql`

3. Pégalo en el cuadro de texto grande

4. Haz clic en el botón **"Continuar"** o **"Go"** (abajo a la derecha)

5. ✅ Deberías ver un mensaje verde: **"X consultas ejecutadas correctamente"**

---

## 🎯 PASO 3: Verificar que se creó correctamente

1. En el panel izquierdo, deberías ver la base de datos **`coop_smart`**

2. Haz clic en `coop_smart` para expandirla

3. Deberías ver **6 tablas**:
   - ✅ usuarios
   - ✅ socios
   - ✅ cuentas
   - ✅ prestamos
   - ✅ pagos
   - ✅ transacciones

4. Haz clic en la tabla **`usuarios`** → pestaña **"Examinar"**
   - Debería estar vacía (el script no inserta el usuario admin aún)

---

## ⚙️ PASO 4: Configurar archivo .env del Backend

Ahora necesitas configurar la conexión en el backend:

1. Abre el archivo: `backend/.env`

2. Verifica/modifica estas líneas:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=coop_smart
DB_PORT=3306
```

**IMPORTANTE**: 
- Si instalaste XAMPP, el usuario por defecto es `root`
- La contraseña por defecto está **vacía** (deja `DB_PASSWORD=`)
- Si cambiaste la contraseña de MySQL, ponla en `DB_PASSWORD=tu_contraseña`

---

## 🚀 PASO 5: Ejecutar Script de Datos de Prueba

Ahora vamos a crear usuarios y datos de prueba:

### En PowerShell, ejecuta:

```powershell
cd c:\Users\JOSUE\Desktop\COOP-SMART\backend
node src/utils/seed.js
```

Esto creará:
- ✅ 3 usuarios (admin, cajero1, socio1)
- ✅ 3 socios de ejemplo
- ✅ 3 cuentas de ejemplo

### Credenciales de prueba:
- **Admin**: usuario `admin` / contraseña `admin123`
- **Cajero**: usuario `cajero1` / contraseña `admin123`
- **Socio**: usuario `socio1` / contraseña `admin123`

---

## ✅ PASO 6: Iniciar el Backend

```powershell
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión a MySQL exitosa
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Access denied for user 'root'@'localhost'"

**Solución**: La contraseña de MySQL está configurada

1. En phpMyAdmin, ve a **"Cuentas de usuario"**
2. Encuentra el usuario `root`
3. Haz clic en **"Editar privilegios"**
4. Cambia la contraseña o usa la que tienes
5. Actualiza `DB_PASSWORD` en `.env`

### ❌ Error: "Can't connect to MySQL server"

**Solución**: MySQL no está corriendo

1. Abre el **Panel de Control de XAMPP**
2. Asegúrate que el módulo **MySQL** esté en verde (started)
3. Si no, haz clic en **"Start"** junto a MySQL

### ❌ Error: "Database 'coop_smart' doesn't exist"

**Solución**: El script no se ejecutó correctamente

1. Vuelve a phpMyAdmin
2. Verifica que existe la base de datos `coop_smart` en el panel izquierdo
3. Si no existe, ejecuta manualmente:
   ```sql
   CREATE DATABASE coop_smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## 📊 VERIFICACIÓN FINAL

### Prueba con Postman o navegador:

**1. Verificar que el servidor responde:**
```
GET http://localhost:3000
```
Respuesta esperada: `{"message": "API de COOP-SMART funcionando"}`

**2. Probar login:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "nombre_usuario": "admin",
  "contrasena": "admin123"
}
```

Deberías recibir un **token JWT** ✅

---

## 🎉 ¡LISTO!

Tu base de datos está configurada y el backend funcionando.

**Siguiente paso**: Probar todos los endpoints con Postman o crear el frontend.

---

**Fecha**: 21 de Octubre de 2025  
**Estado**: Base de datos lista ✅
