# 🚀 GUÍA COMPLETA PARA PROBAR ENDPOINTS EN POSTMAN

## 📋 Configuración Inicial

### 1. Configurar Postman
- **Base URL**: `http://localhost:3000`
- **Backend debe estar corriendo**: `npm run start:dev` en la carpeta backend

### 2. Variables de Entorno en Postman
Crear una colección con estas variables:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: (se llenará automáticamente)
- `refreshToken`: (se llenará automáticamente)
- `userId`: (se llenará automáticamente)
- `collectionId`: (se llenará automáticamente)
- `invitationId`: (se llenará automáticamente)

---

## 🔐 MÓDULO AUTH (Autenticación)

### 1️⃣ Registrar Usuario
**Método**: `POST`  
**URL**: `{{baseUrl}}/auth/register`  
**Auth**: No requerido  

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@test.com",
  "password": "MiPassword123!"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "data": {
    "user": {
      "id": "uuid-aqui",
      "email": "juan.perez@test.com",
      "name": "Juan Pérez",
      "roles": ["USER"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

**⚠️ IMPORTANTE**: Guardar el `accessToken` en la variable de entorno de Postman.

---

### 2️⃣ Iniciar Sesión
**Método**: `POST`  
**URL**: `{{baseUrl}}/auth/login`  
**Auth**: No requerido  

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "email": "juan.perez@test.com",
  "password": "MiPassword123!"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "user": {
      "id": "uuid-aqui",
      "email": "juan.perez@test.com",
      "roles": ["USER"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 3️⃣ Cerrar Sesión
**Método**: `POST`  
**URL**: `{{baseUrl}}/auth/logout`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 4️⃣ Renovar Token
**Método**: `POST`  
**URL**: `{{baseUrl}}/auth/refresh`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "accessToken": "nuevo-token-aqui...",
    "refreshToken": "nuevo-refresh-token...",
    "expiresIn": 86400
  }
}
```

---

## 👤 MÓDULO USERS (Usuarios)

### 5️⃣ Obtener Mi Perfil
**Método**: `GET`  
**URL**: `{{baseUrl}}/users/me`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "id": "uuid-aqui",
    "email": "juan.perez@test.com",
    "name": "Juan Pérez",
    "avatar": null,
    "roles": ["USER"],
    "createdAt": "2025-10-14T10:30:00.000Z"
  }
}
```

---

## 📦 MÓDULO COLLECTIONS (Colecciones)

### 6️⃣ Listar Colecciones Públicas
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections/public`  
**Auth**: No requerido  

**Query Parameters** (opcional):
- `page`: 1
- `limit`: 12
- `search`: viaje
- `status`: ACTIVE

**URL Completa**: `{{baseUrl}}/collections/public?page=1&limit=12&search=viaje&status=ACTIVE`

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "collections": [
      {
        "id": "uuid-collection",
        "title": "Viaje a Europa",
        "description": "Recaudar fondos para viaje",
        "currentAmount": 250.50,
        "goalAmount": 5000,
        "status": "ACTIVE",
        "isPrivate": false,
        "owner": {
          "name": "Juan Pérez"
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 12,
    "hasNextPage": true
  }
}
```

---

### 7️⃣ Listar Mis Colecciones
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-collection",
      "title": "Viaje Europa",
      "currentAmount": 250.50,
      "goalAmount": 5000,
      "status": "ACTIVE",
      "owner": {
        "id": "uuid-user",
        "name": "Juan Pérez"
      }
    }
  ]
}
```

---

### 8️⃣ Crear Nueva Colección
**Método**: `POST`  
**URL**: `{{baseUrl}}/collections`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "title": "Viaje a Europa 2025",
  "description": "Queremos recaudar fondos para un viaje familiar a Europa",
  "goalAmount": 5000,
  "isPrivate": false,
  "deadlineAt": "2025-12-31T23:59:59Z",
  "ruleType": "THRESHOLD"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "data": {
    "id": "uuid-nueva-collection",
    "title": "Viaje a Europa 2025",
    "description": "Queremos recaudar fondos para un viaje familiar a Europa",
    "goalAmount": 5000,
    "currentAmount": 0,
    "status": "ACTIVE",
    "createdAt": "2025-10-14T10:30:00.000Z"
  }
}
```

**⚠️ IMPORTANTE**: Guardar el `id` de la colección en la variable `collectionId`.

---

### 9️⃣ Ver Detalle de Colección
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "id": "uuid-collection",
    "title": "Viaje a Europa 2025",
    "currentAmount": 1250.50,
    "goalAmount": 5000,
    "progress": 25.01,
    "members": [
      {
        "id": "uuid-member",
        "user": {
          "name": "Juan Pérez"
        }
      }
    ],
    "contributions": [
      {
        "id": "uuid-contribution",
        "amount": 100.50,
        "user": {
          "name": "María García"
        }
      }
    ]
  }
}
```

---

### 🔟 Actualizar Colección (Solo Owner)
**Método**: `PATCH`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "title": "Viaje Europa 2025 - Actualizado",
  "description": "Nueva descripción actualizada",
  "goalAmount": 6000
}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "id": "uuid-collection",
    "title": "Viaje Europa 2025 - Actualizado",
    "description": "Nueva descripción actualizada",
    "goalAmount": 6000,
    "updatedAt": "2025-10-14T11:00:00.000Z"
  }
}
```

---

### 1️⃣1️⃣ Eliminar Colección (Solo Owner)
**Método**: `DELETE`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (204)**: Sin contenido

---

### 1️⃣2️⃣ Unirse a Colección Pública
**Método**: `POST`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/members/join`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (201)**:
```json
{
  "data": {
    "message": "Successfully joined the collection",
    "member": {
      "id": "uuid-member",
      "userId": "uuid-user",
      "collectionId": "uuid-collection",
      "joinedAt": "2025-10-14T11:00:00.000Z"
    }
  }
}
```

---

### 1️⃣3️⃣ Salirse de Colección
**Método**: `POST`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/members/leave`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "message": "Left collection successfully"
  }
}
```

---

## 👥 MÓDULO MEMBERS (Miembros)

### 1️⃣4️⃣ Listar Miembros de Colección
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/members`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-member",
      "userId": "uuid-user",
      "acceptedAt": "2025-10-14T10:30:00.000Z",
      "user": {
        "id": "uuid-user",
        "email": "juan.perez@test.com",
        "name": "Juan Pérez"
      }
    }
  ]
}
```

---

### 1️⃣5️⃣ Remover Miembro (Solo Owner)
**Método**: `DELETE`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/members/{{userId}}`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (204)**: Sin contenido

---

## 💌 MÓDULO INVITATIONS (Invitaciones)

### 1️⃣6️⃣ Obtener Mis Invitaciones
**Método**: `GET`  
**URL**: `{{baseUrl}}/invitations`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-invitation",
      "status": "PENDING",
      "createdAt": "2025-10-14T10:30:00.000Z",
      "collection": {
        "id": "uuid-collection",
        "title": "Viaje Europa"
      },
      "inviter": {
        "name": "María García"
      }
    }
  ]
}
```

---

### 1️⃣7️⃣ Crear Invitación
**Método**: `POST`  
**URL**: `{{baseUrl}}/invitations`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "collectionId": "{{collectionId}}",
  "invitedEmail": "maria.garcia@test.com"
}
```

**Respuesta Exitosa (201)**:
```json
{
  "data": {
    "id": "uuid-invitation",
    "status": "PENDING",
    "createdAt": "2025-10-14T11:00:00.000Z",
    "collection": {
      "id": "uuid-collection",
      "title": "Viaje Europa"
    }
  }
}
```

**⚠️ IMPORTANTE**: Guardar el `id` de la invitación en la variable `invitationId`.

---

### 1️⃣8️⃣ Aceptar Invitación
**Método**: `PUT`  
**URL**: `{{baseUrl}}/invitations/{{invitationId}}/accept`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "message": "Invitation accepted",
    "member": {
      "id": "uuid-member",
      "userId": "uuid-user",
      "collectionId": "uuid-collection",
      "acceptedAt": "2025-10-14T11:00:00.000Z"
    }
  }
}
```

---

### 1️⃣9️⃣ Rechazar Invitación
**Método**: `PUT`  
**URL**: `{{baseUrl}}/invitations/{{invitationId}}/reject`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:
```json
{
  "data": {
    "message": "Invitation rejected",
    "status": "REJECTED"
  }
}
```

---

## 💰 MÓDULO CONTRIBUTIONS (Contribuciones)

### 2️⃣0️⃣ Contribuir a Colección
**Método**: `POST`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/contributions`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "amount": 100.50
}
```

**Respuesta Exitosa (201)**:
```json
{
  "data": {
    "id": "uuid-contribution",
    "amount": 100.50,
    "status": "PAID",
    "createdAt": "2025-10-14T11:00:00.000Z",
    "collection": {
      "id": "uuid-collection",
      "title": "Viaje Europa"
    }
  }
}
```

---

### 2️⃣1️⃣ Listar Contribuciones de Colección
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/contributions`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-contribution",
      "amount": 100.50,
      "status": "PAID",
      "createdAt": "2025-10-14T11:00:00.000Z",
      "user": {
        "id": "uuid-user",
        "name": "Juan Pérez"
      }
    }
  ]
}
```

---

### 2️⃣2️⃣ Mis Contribuciones Globales
**Método**: `GET`  
**URL**: `{{baseUrl}}/contributions`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-contribution",
      "amount": 100.50,
      "createdAt": "2025-10-14T11:00:00.000Z",
      "collection": {
        "id": "uuid-collection",
        "title": "Viaje Europa"
      }
    }
  ]
}
```

---

## 🏦 MÓDULO WITHDRAWALS (Retiros)

### 2️⃣3️⃣ Retiro Inteligente (Solo Owner)
**Método**: `POST`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/withdrawals`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Body**: Vacío

**Respuesta Exitosa (200)**:

**Si se alcanzó la meta**:
```json
{
  "data": {
    "message": "Processed successfully",
    "action": "TRANSFERRED",
    "amount": 5250.75
  }
}
```

**Si NO se alcanzó la meta**:
```json
{
  "data": {
    "message": "Processed successfully", 
    "action": "REFUNDED",
    "amount": 2500.30
  }
}
```

---

### 2️⃣4️⃣ Listar Retiros
**Método**: `GET`  
**URL**: `{{baseUrl}}/collections/{{collectionId}}/withdrawals`  
**Auth**: Bearer Token `{{accessToken}}`  

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Respuesta Exitosa (200)**:
```json
{
  "data": [
    {
      "id": "uuid-withdrawal",
      "amount": 5000,
      "status": "COMPLETED", 
      "action": "TRANSFERRED",
      "createdAt": "2025-10-14T11:00:00.000Z",
      "requester": {
        "id": "uuid-user",
        "name": "Juan Pérez"
      }
    }
  ]
}
```

---

## 🔄 FLUJO DE PRUEBAS RECOMENDADO

### Secuencia Básica:
1. **Registrar usuario** → Obtener token
2. **Ver mi perfil** → Confirmar datos
3. **Crear colección** → Obtener ID
4. **Ver colecciones públicas** → Verificar aparece
5. **Invitar usuarios** → Crear invitaciones
6. **Contribuir dinero** → Hacer aportes
7. **Ver detalle colección** → Verificar progreso
8. **Retiro inteligente** → Procesar fondos

### Secuencia Completa:
1. Auth: Register → Login → Me
2. Collections: Create → List → Detail → Update
3. Invitations: Create → List → Accept
4. Members: Join → List
5. Contributions: Create → List
6. Withdrawals: Process → List

---

## ⚠️ ERRORES COMUNES

### 401 Unauthorized
- **Problema**: Token no válido o expirado
- **Solución**: Hacer login nuevamente y actualizar el token

### 403 Forbidden
- **Problema**: No tienes permisos (ej: solo owner puede eliminar)
- **Solución**: Usar la cuenta correcta del owner

### 404 Not Found
- **Problema**: Recurso no existe (colección, invitación, etc.)
- **Solución**: Verificar que el ID sea correcto

### 400 Bad Request
- **Problema**: Datos incorretos en el body
- **Solución**: Revisar el formato JSON y campos requeridos

---

## 📝 NOTAS IMPORTANTES

1. **Todos los endpoints devuelven respuestas envueltas** en un objeto `data` por el interceptor
2. **Guardar tokens automáticamente** en las variables de Postman para facilitar las pruebas
3. **El backend debe estar corriendo** en `http://localhost:3000`
4. **Base de datos debe estar configurada** y conectada
5. **CORS está habilitado** para localhost:5173 (frontend)

¡Listo! Con esta guía puedes probar todos los 23 endpoints del sistema ColectaYa. 🚀