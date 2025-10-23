# 📦 Guía de Instalación de Herramientas

## ✅ Herramientas que YA TIENES Instaladas

- ✅ **Node.js** v24.5.0
- ✅ **npm** v11.5.1
- ✅ **Git** v2.50.1

---

## ❌ Herramientas que NECESITAS Instalar

### 1. 🗄️ MySQL (Base de datos principal)

#### Opción A: XAMPP (Recomendado para desarrollo)

1. Descarga XAMPP desde: https://www.apachefriends.org/
2. Instala XAMPP (incluye MySQL, Apache y phpMyAdmin)
3. Abre el Panel de Control de XAMPP
4. Inicia el servicio **MySQL**
5. Haz clic en **Admin** junto a MySQL para abrir phpMyAdmin

**Configuración**:
- Usuario por defecto: `root`
- Contraseña por defecto: (vacía)
- Puerto: `3306`

#### Opción B: MySQL Standalone

1. Descarga desde: https://dev.mysql.com/downloads/mysql/
2. Ejecuta el instalador
3. Durante la instalación:
   - Tipo: "Developer Default"
   - Configuración: puerto `3306`
   - Crea una contraseña para el usuario `root` (¡anótala!)

#### Opción C: MySQL en Docker

```bash
docker run -d \
  --name mysql-coop-smart \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=coop_smart \
  -p 3306:3306 \
  mysql:8.0
```

### 2. 🍃 MongoDB (Opcional - Para logs)

#### Opción A: MongoDB Atlas (Cloud - Recomendado)

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un cluster gratuito (M0)
4. Obtén la cadena de conexión
5. Úsala en el `.env`:
   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/coop_smart_logs
   ```

#### Opción B: MongoDB Local

1. Descarga desde: https://www.mongodb.com/try/download/community
2. Instala MongoDB Community Server
3. Inicia el servicio MongoDB
4. La URI por defecto es: `mongodb://localhost:27017`

**Nota**: MongoDB es opcional. El sistema funciona sin él, pero no guardará logs de auditoría.

### 3. 📱 Flutter (Para la app móvil)

1. Descarga desde: https://flutter.dev/docs/get-started/install/windows
2. Extrae el archivo ZIP en `C:\src\flutter`
3. Agrega `C:\src\flutter\bin` a las variables de entorno PATH
4. Ejecuta en PowerShell:
   ```powershell
   flutter doctor
   ```
5. Sigue las instrucciones para instalar dependencias faltantes

---

## 🚀 Pasos Después de Instalar MySQL

### 1. Verificar instalación

```bash
mysql --version
```

### 2. Crear la base de datos

**Opción A: Con phpMyAdmin (XAMPP)**
- Abre http://localhost/phpmyadmin
- Crea una nueva base de datos llamada `coop_smart`
- Importa el archivo `docs/database_schema.sql`

**Opción B: Con línea de comandos**

```bash
# Iniciar sesión en MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE coop_smart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Salir
exit
```

Luego importa el schema:

```bash
mysql -u root -p coop_smart < docs/database_schema.sql
```

### 3. Configurar el backend

Edita `backend/.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coop_smart
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
```

### 4. Inicializar datos de prueba

```bash
cd backend
node src/utils/seed.js
```

### 5. Iniciar el servidor

```bash
npm run dev
```

Deberías ver:

```
╔════════════════════════════════════════╗
║     🏦 COOP-SMART API Server          ║
╠════════════════════════════════════════╣
║  Puerto: 3000                          ║
║  Entorno: development                  ║
║  URL: http://localhost:3000            ║
╚════════════════════════════════════════╝
```

---

## 🧪 Probar que Todo Funciona

### 1. Verificar API

Abre tu navegador en: http://localhost:3000

Deberías ver:

```json
{
  "message": "🏦 Bienvenido a COOP-SMART API",
  "version": "1.0.0",
  "status": "online"
}
```

### 2. Probar login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"nombre_usuario\":\"admin\",\"contrasena\":\"admin123\"}"
```

O usa una herramienta como:
- **Thunder Client** (extensión de VS Code)
- **Postman**
- **Insomnia**

---

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

**Solución**: Contraseña incorrecta en `.env`. Verifica tus credenciales de MySQL.

### Error: "Cannot find module"

**Solución**: Instala las dependencias:
```bash
cd backend
npm install
```

### Error: "Port 3000 is already in use"

**Solución**: Cambia el puerto en `backend/.env`:
```env
PORT=3001
```

### MySQL no inicia en XAMPP

**Solución**: 
1. Verifica que el puerto 3306 no esté ocupado
2. Revisa los logs en XAMPP
3. Intenta cambiar el puerto de MySQL

---

## 📚 Recursos Adicionales

- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Node.js](https://nodejs.org/docs/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de Sequelize](https://sequelize.org/docs/)

---

## ✅ Checklist de Instalación

- [ ] MySQL instalado y funcionando
- [ ] Base de datos `coop_smart` creada
- [ ] Dependencias del backend instaladas (`npm install`)
- [ ] Archivo `.env` configurado correctamente
- [ ] Datos de prueba creados (`seed.js`)
- [ ] Servidor backend funcionando (`npm run dev`)
- [ ] Login funcional (probado con curl o Postman)
- [ ] MongoDB instalado (opcional)
- [ ] Flutter instalado (para móvil - opcional)

---

¡Una vez completados estos pasos, estarás listo para desarrollar con COOP-SMART! 🚀
