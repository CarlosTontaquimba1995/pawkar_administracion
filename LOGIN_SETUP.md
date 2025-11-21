# Sistema de Autenticación - Pawkar Admin

## 🎯 Implementación Completada

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Características Implementadas

1. **Página de iniciar-sesion** (`/iniciar-sesion`)
   - Formulario con usuario y contraseña
   - Validación de credenciales contra la API
   - Manejo de errores con mensajes claros
   - Diseño moderno y responsivo

2. **Gestión de Sesión**
   - Token JWT almacenado en localStorage
   - Datos de usuario (id, username, email, roles) guardados
   - Persistencia de sesión entre recargas

3. **Rutas Protegidas**
   - Todas las rutas principales requieren autenticación
   - Redirección automática a `/iniciar-sesion` si no hay sesión
   - Redirección a `/panel` después del iniciar-sesion exitoso

4. **Funcionalidad de Logout**
   - Botón "Cerrar Sesión" en el sidebar
   - Limpia token y datos de usuario
   - Redirige a la página de iniciar-sesion

### 🔐 API de Autenticación

**Endpoint:** `POST http://localhost:8080/api/auth/signin`

**Request:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "message": "Usuario autenticado exitosamente",
  "data": {
    "accessToken": "eyJhbGci...",
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["ROLE_ADMIN"],
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer"
  }
}
```

**Response de Error:**
```json
{
  "success": false,
  "message": "Nombre de usuario o contraseña inválidos",
  "status": 400
}
```

### 📁 Archivos Creados/Modificados

#### Nuevos Archivos:
- `src/api/authService.ts` - Servicio para llamadas a la API de autenticación
- `src/pages/Login/index.tsx` - Página de inicio de sesión
- `src/components/ProtectedRoute.tsx` - Componente para proteger rutas

#### Archivos Modificados:
- `src/contexts/AuthContext.tsx` - Mejorado para manejar datos de usuario completos
- `src/routes/index.tsx` - Configurado con rutas públicas y protegidas
- `src/App.tsx` - Limpiado (eliminado DevTokenSetter)
- `src/layouts/MainLayout/Sidebar.tsx` - Agregado manejo de logout
- `src/pages/Players/index.tsx` - Usa token real del contexto
- `src/api/teamService.ts` - Agregados logs para debugging

### 🚀 Cómo Usar

1. **Iniciar el servidor backend** (debe estar corriendo en `http://localhost:8080`)

2. **Iniciar la aplicación:**
   ```bash
   npm run dev
   ```

3. **⚠️ IMPORTANTE - Primera vez o si ya tenías la app corriendo:**
   
   Si la aplicación va directamente a `/panel` en lugar de mostrar el iniciar-sesion, necesitas limpiar el localStorage:
   
   **Solución rápida:**
   - Abre la consola del navegador (F12)
   - Ejecuta este código:
     ```javascript
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     location.reload();
     ```
   
   Ver instrucciones detalladas en: `CLEAR_STORAGE_INSTRUCTIONS.md`

4. **Acceder a la aplicación:**
   - Abre el navegador en `http://localhost:3001` (o el puerto que indique Vite)
   - Serás redirigido automáticamente a `/iniciar-sesion`

4. **Iniciar sesión:**
   - Usuario: `testuser`
   - Contraseña: `password123` (o las credenciales que tengas configuradas)

5. **Navegar por el sistema:**
   - Después del iniciar-sesion exitoso, serás redirigido al panel
   - Puedes acceder a todos los módulos (Equipos, Jugadores, Eventos)
   - El token se guarda automáticamente y persiste entre recargas

6. **Cerrar sesión:**
   - Haz clic en "Cerrar Sesión" en el sidebar
   - Serás redirigido a la página de iniciar-sesion
   - El token y datos de usuario se eliminan

### 🔍 Validación de Acceso a Jugadores

El módulo de jugadores tiene una validación adicional:
- Verifica que existan equipos registrados antes de permitir el acceso
- Si no hay equipos, muestra un mensaje y redirige a `/equipos`
- La API consultada es: `GET http://localhost:8080/api/equipos/existen`

### 🐛 Debugging

Los logs en la consola del navegador te mostrarán:
- 🔐 Intentos de iniciar-sesion
- ✅ Login exitoso con datos de usuario
- 🚀 Navegación entre rutas
- 🔍 Verificación de equipos
- 👋 Cierre de sesión
- 🚫 Accesos denegados

### 📝 Notas Importantes

1. **Seguridad:** El token se almacena en localStorage. En producción, considera usar httpOnly cookies para mayor seguridad.

2. **Expiración del Token:** El token tiene una expiración. Si expira, el usuario deberá iniciar sesión nuevamente.

3. **Refresh Token:** La API devuelve un refreshToken pero no está implementado su uso automático. Considera implementarlo para renovar tokens expirados.

4. **CORS:** Asegúrate de que el backend tenga CORS configurado correctamente para permitir peticiones desde el frontend.

### 🎨 Personalización

Para cambiar las credenciales de prueba mostradas en la página de iniciar-sesion, edita:
```tsx
// src/pages/Login/index.tsx
<Typography variant="caption" color="text.secondary" display="block">
  Usuario: testuser
</Typography>
<Typography variant="caption" color="text.secondary">
  Contraseña: password123
</Typography>
```

### ✨ Próximos Pasos Sugeridos

1. Implementar refresh token automático
2. Agregar "Recordarme" en el iniciar-sesion
3. Implementar recuperación de contraseña
4. Agregar página de perfil de usuario
5. Implementar roles y permisos más granulares
