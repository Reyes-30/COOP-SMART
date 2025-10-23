# 🚀 INICIO RÁPIDO - COOP-SMART

## ⚡ 3 Pasos para Ejecutar el Backend

### 1️⃣ Instalar MySQL

**Opción más fácil: XAMPP**
- Descarga: https://www.apachefriends.org/
- Instala y abre XAMPP Control Panel
- Inicia el servicio **MySQL**

### 2️⃣ Crear Base de Datos

**Con phpMyAdmin (XAMPP):**
1. Abre: http://localhost/phpmyadmin
2. Crea base de datos: `coop_smart`
3. Importa: `docs/database_schema.sql`

**O con línea de comandos:**
```bash
mysql -u root -p
CREATE DATABASE coop_smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

mysql -u root -p coop_smart < docs/database_schema.sql
```

### 3️⃣ Iniciar Backend

```bash
# Navegar al backend
cd backend

# Verificar que .env esté configurado (ya lo está)
# Solo verifica DB_PASSWORD si pusiste contraseña a MySQL

# Crear datos de prueba
node src/utils/seed.js

# Iniciar servidor
npm run dev
```

**¡Listo!** El servidor estará en: http://localhost:3000

---

## ✅ Verificar que Funciona

### 1. Abrir en navegador:
```
http://localhost:3000
```

Deberías ver:
```json
{
  "message": "🏦 Bienvenido a COOP-SMART API",
  "version": "1.0.0",
  "status": "online"
}
```

### 2. Probar login (con curl):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"nombre_usuario\":\"admin\",\"contrasena\":\"admin123\"}"
```

### 3. O usar Thunder Client / Postman:
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "nombre_usuario": "admin",
  "contrasena": "admin123"
}
```

---

## 🎯 Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| cajero1 | admin123 | Cajero |
| socio1 | admin123 | Socio |

---

## 🐛 Problemas Comunes

### Error: "Access denied for user 'root'"
➡️ **Solución**: Edita `backend/.env` y configura tu contraseña de MySQL:
```env
DB_PASSWORD=tu_contraseña
```

### Error: "Port 3000 already in use"
➡️ **Solución**: Cambia el puerto en `backend/.env`:
```env
PORT=3001
```

### Error: "Cannot find module"
➡️ **Solución**: Instala dependencias:
```bash
cd backend
npm install
```

---

## 📚 Documentación Completa

- **Resumen completo**: `docs/RESUMEN.md`
- **Instalación detallada**: `docs/INSTALACION.md`
- **API Endpoints**: `docs/API.md`
- **Base de datos**: `docs/DATABASE.md`
- **README Backend**: `backend/README.md`

---

## 🎉 ¿Y Ahora Qué?

Una vez el backend esté funcionando:

1. **Explorar la API** con Postman/Thunder Client
2. **Revisar el código** para entender la estructura
3. **Crear el Frontend** con Vue/Nuxt (siguiente fase)
4. **Implementar módulos faltantes** (Préstamos completos, Reportes)

---

## 💡 Comandos Útiles

```bash
# Iniciar backend en desarrollo
npm run dev

# Reiniciar datos de prueba
node src/utils/seed.js

# Ver logs en tiempo real
# (los verás en la consola donde ejecutas npm run dev)

# Detener servidor
# Presiona Ctrl+C en la terminal
```

---

## 📊 Estado del Proyecto

✅ Backend: **100% Funcional**  
⏳ Frontend: **Por desarrollar**  
⏳ Móvil: **Por desarrollar**  

**Progreso Global: 45%**

---

¡Estás listo para comenzar! 🚀

Para más información, consulta `docs/RESUMEN.md`
