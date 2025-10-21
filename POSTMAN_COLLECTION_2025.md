# 🚀 COLECTAYA - COLECCIÓN POSTMAN ACTUALIZADA 2025

## 📋 Configuración Inicial

### Variables de Entorno
Crear estas variables en Postman:
```
baseUrl = http://localhost:3000
accessToken = (se actualizará automáticamente después del login)
userId = (tu user ID)
collectionId = (ID de colección de prueba)
```

---

## 🔐 AUTENTICACIÓN (Supabase)

> **NOTA**: La autenticación ahora usa Supabase con 3 métodos:
> - Magic Link (correo)
> - Google OAuth
> - Facebook OAuth

### 1. Login con Magic Link
**POST** `{{baseUrl}}/auth/magic-link`

**Body**:
```json
{
  "email": "tu-email@test.com"
}
```

**Response 200**:
```json
{
  "message": "Magic link sent to your email"
}
```

**Pasos siguientes**:
1. Revisar tu correo
2. Hacer clic en el enlace mágico
3. Serás redirigido con el token en la URL

---

### 2. Login con Google OAuth
**GET** `{{baseUrl}}/auth/google`

**Respuesta**: Redirección a Google OAuth

**Callback**: `{{baseUrl}}/auth/callback`

---

### 3. Login con Facebook OAuth
**GET** `{{baseUrl}}/auth/facebook`

**Respuesta**: Redirección a Facebook OAuth

**Callback**: `{{baseUrl}}/auth/callback`

---

### 4. Obtener Usuario Actual
**GET** `{{baseUrl}}/auth/me`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "id": "uuid-del-usuario",
  "email": "tu-email@test.com",
  "name": "Tu Nombre",
  "avatar": "https://...",
  "roles": ["USER"]
}
```

---

### 5. Logout
**POST** `{{baseUrl}}/auth/logout`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "message": "Successfully logged out"
}
```

---

## 📦 COLECCIONES

### 6. Listar Colecciones Públicas
**GET** `{{baseUrl}}/collections/public?page=1&limit=12`

**Sin autenticación requerida**

**Response 200**:
```json
{
  "collections": [
    {
      "id": "uuid",
      "title": "Viaje a Europa",
      "description": "Recaudar fondos para viaje familiar",
      "goalAmount": 5000,
      "currentAmount": 1250.50,
      "progress": 25.01,
      "status": "ACTIVE",
      "isPrivate": false,
      "ruleType": "GOAL_ONLY",
      "deadlineAt": "2025-12-31T23:59:59Z",
      "owner": {
        "id": "uuid",
        "name": "Juan Pérez",
        "avatar": "https://..."
      },
      "_count": {
        "members": 5,
        "contributions": 12
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 12,
  "hasNextPage": true
}
```

---

### 7. Mis Colecciones
**GET** `{{baseUrl}}/collections`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "title": "Mi Colecta Personal",
    "currentAmount": 750.00,
    "goalAmount": 2000,
    "status": "ACTIVE",
    "createdAt": "2025-10-15T10:00:00Z"
  }
]
```

---

### 8. Crear Colección
**POST** `{{baseUrl}}/collections`

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body** (Pago Único - 100%):
```json
{
  "title": "Viaje a Europa 2025",
  "description": "Recaudar fondos para un viaje familiar",
  "goalAmount": 5000,
  "isPrivate": false,
  "ruleType": "GOAL_ONLY",
  "deadlineAt": "2025-12-31T23:59:59Z"
}
```

**Body** (Libre - Retiro en cualquier momento):
```json
{
  "title": "Ahorros Mensuales",
  "description": "Colecta para ahorros del grupo",
  "goalAmount": 10000,
  "isPrivate": false,
  "ruleType": "ANYTIME",
  "deadlineAt": "2026-06-30T23:59:59Z"
}
```

**Response 201**:
```json
{
  "id": "uuid-nueva-coleccion",
  "title": "Viaje a Europa 2025",
  "description": "Recaudar fondos para un viaje familiar",
  "goalAmount": 5000,
  "currentAmount": 0,
  "status": "ACTIVE",
  "ruleType": "GOAL_ONLY",
  "paymentFrequency": "ONE_TIME",
  "deadlineAt": "2025-12-31T23:59:59Z",
  "createdAt": "2025-10-15T10:30:00Z"
}
```

> **⚠️ IMPORTANTE**: Guarda el `id` en la variable `{{collectionId}}`

---

### 9. Ver Detalle de Colección
**GET** `{{baseUrl}}/collections/{{collectionId}}`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "id": "uuid",
  "title": "Viaje a Europa 2025",
  "description": "...",
  "goalAmount": 5000,
  "currentAmount": 1250.50,
  "progress": 25.01,
  "status": "ACTIVE",
  "ruleType": "GOAL_ONLY",
  "paymentFrequency": "ONE_TIME",
  "deadlineAt": "2025-12-31T23:59:59Z",
  "owner": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@test.com"
  },
  "members": [
    {
      "id": "uuid",
      "user": {
        "name": "María García",
        "avatar": "https://..."
      },
      "joinedAt": "2025-10-15T11:00:00Z"
    }
  ],
  "contributions": [
    {
      "id": "uuid",
      "amount": 100.50,
      "createdAt": "2025-10-15T12:00:00Z",
      "user": {
        "name": "María García"
      }
    }
  ]
}
```

---

### 10. Actualizar Colección (Solo Owner)
**PATCH** `{{baseUrl}}/collections/{{collectionId}}`

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Viaje Europa 2025 - Actualizado",
  "description": "Nueva descripción",
  "goalAmount": 6000
}
```

**Response 200**:
```json
{
  "id": "uuid",
  "title": "Viaje Europa 2025 - Actualizado",
  "goalAmount": 6000,
  "updatedAt": "2025-10-15T13:00:00Z"
}
```

---

### 11. Eliminar Colección (Solo Owner)
**DELETE** `{{baseUrl}}/collections/{{collectionId}}`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 204**: Sin contenido

---

## 👥 MIEMBROS

### 12. Unirse a Colección Pública
**POST** `{{baseUrl}}/collections/{{collectionId}}/members/join`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 201**:
```json
{
  "message": "Successfully joined the collection",
  "member": {
    "id": "uuid",
    "userId": "uuid",
    "collectionId": "uuid",
    "joinedAt": "2025-10-15T14:00:00Z"
  }
}
```

---

### 13. Salirse de Colección
**POST** `{{baseUrl}}/collections/{{collectionId}}/members/leave`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "message": "Left collection successfully"
}
```

---

### 14. Listar Miembros
**GET** `{{baseUrl}}/collections/{{collectionId}}/members`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "acceptedAt": "2025-10-15T10:00:00Z",
    "user": {
      "id": "uuid",
      "name": "Juan Pérez",
      "email": "juan@test.com",
      "avatar": "https://..."
    }
  }
]
```

---

### 15. Remover Miembro (Solo Owner)
**DELETE** `{{baseUrl}}/collections/{{collectionId}}/members/{{userId}}`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 204**: Sin contenido

---

## 💌 INVITACIONES

### 16. Mis Invitaciones
**GET** `{{baseUrl}}/invitations`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "createdAt": "2025-10-15T10:00:00Z",
    "collection": {
      "id": "uuid",
      "title": "Viaje Europa"
    },
    "inviter": {
      "name": "María García"
    }
  }
]
```

---

### 17. Crear Invitación
**POST** `{{baseUrl}}/invitations`

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body**:
```json
{
  "collectionId": "{{collectionId}}",
  "invitedEmail": "amigo@test.com"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "status": "PENDING",
  "createdAt": "2025-10-15T15:00:00Z",
  "collection": {
    "id": "uuid",
    "title": "Viaje Europa"
  }
}
```

---

### 18. Aceptar Invitación
**PUT** `{{baseUrl}}/invitations/{{invitationId}}/accept`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "message": "Invitation accepted",
  "member": {
    "id": "uuid",
    "userId": "uuid",
    "collectionId": "uuid",
    "acceptedAt": "2025-10-15T15:30:00Z"
  }
}
```

---

### 19. Rechazar Invitación
**PUT** `{{baseUrl}}/invitations/{{invitationId}}/reject`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
{
  "message": "Invitation rejected",
  "status": "REJECTED"
}
```

---

## 💰 CONTRIBUCIONES

### 20. Contribuir
**POST** `{{baseUrl}}/collections/{{collectionId}}/contributions`

**Headers**:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body**:
```json
{
  "amount": 100.50
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "amount": 100.50,
  "status": "PAID",
  "createdAt": "2025-10-15T16:00:00Z",
  "collection": {
    "id": "uuid",
    "title": "Viaje Europa"
  }
}
```

---

### 21. Listar Contribuciones de Colección
**GET** `{{baseUrl}}/collections/{{collectionId}}/contributions`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "amount": 100.50,
    "status": "PAID",
    "createdAt": "2025-10-15T16:00:00Z",
    "user": {
      "name": "Juan Pérez"
    }
  }
]
```

---

### 22. Mis Contribuciones Globales
**GET** `{{baseUrl}}/contributions`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "amount": 100.50,
    "createdAt": "2025-10-15T16:00:00Z",
    "collection": {
      "id": "uuid",
      "title": "Viaje Europa"
    }
  }
]
```

---

## 🏦 RETIROS

> **NOTA**: Ahora hay 2 tipos de retiro según `ruleType`:
> - **GOAL_ONLY**: Solo se puede retirar cuando se alcanza el 100% de la meta
> - **ANYTIME**: Se puede retirar en cualquier momento (retiro libre)

### 23. Procesar Retiro (Solo Owner)
**POST** `{{baseUrl}}/collections/{{collectionId}}/withdrawals`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200** (GOAL_ONLY - Meta alcanzada):
```json
{
  "message": "Withdrawal processed successfully",
  "action": "TRANSFERRED",
  "amount": 5250.75,
  "withdrawal": {
    "id": "uuid",
    "amount": 5250.75,
    "status": "COMPLETED",
    "createdAt": "2025-10-15T17:00:00Z"
  }
}
```

**Response 400** (GOAL_ONLY - Meta NO alcanzada):
```json
{
  "message": "Cannot withdraw: goal not reached yet",
  "currentAmount": 2500.00,
  "goalAmount": 5000.00,
  "progress": 50.00
}
```

**Response 200** (ANYTIME):
```json
{
  "message": "Withdrawal processed successfully",
  "action": "TRANSFERRED",
  "amount": 1234.56,
  "withdrawal": {
    "id": "uuid",
    "amount": 1234.56,
    "status": "COMPLETED",
    "createdAt": "2025-10-15T17:00:00Z"
  }
}
```

---

### 24. Listar Retiros
**GET** `{{baseUrl}}/collections/{{collectionId}}/withdrawals`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Response 200**:
```json
[
  {
    "id": "uuid",
    "amount": 5000,
    "status": "COMPLETED",
    "action": "TRANSFERRED",
    "createdAt": "2025-10-15T17:00:00Z",
    "requester": {
      "id": "uuid",
      "name": "Juan Pérez"
    }
  }
]
```

---

## 🔄 FLUJO DE PRUEBAS COMPLETO

### Escenario 1: Colecta con Meta (GOAL_ONLY)
```
1. Login con Google/Facebook/Magic Link
2. Crear colección con ruleType="GOAL_ONLY", goalAmount=1000
3. Invitar amigos
4. Hacer contribuciones hasta alcanzar $1000
5. Intentar retiro → ✅ Éxito (meta alcanzada)
```

### Escenario 2: Colecta Libre (ANYTIME)
```
1. Login
2. Crear colección con ruleType="ANYTIME", goalAmount=5000
3. Hacer algunas contribuciones ($500)
4. Intentar retiro → ✅ Éxito (se puede retirar en cualquier momento)
5. Seguir recibiendo contribuciones
6. Otro retiro → ✅ Éxito
```

### Escenario 3: Colecta Privada con Invitaciones
```
1. Login
2. Crear colección privada (isPrivate=true)
3. Crear invitación para "amigo@test.com"
4. Login con cuenta del amigo
5. Ver invitaciones pendientes
6. Aceptar invitación
7. Contribuir a la colecta
```

---

## ⚠️ CÓDIGOS DE ERROR COMUNES

| Código | Significado | Solución |
|--------|-------------|----------|
| 401 | Token inválido o expirado | Hacer login nuevamente |
| 403 | Sin permisos (no eres owner) | Usar cuenta del owner |
| 404 | Recurso no encontrado | Verificar IDs |
| 400 | Datos inválidos en el body | Revisar formato JSON |
| 409 | Conflicto (ya eres miembro, etc.) | Verificar estado actual |

---

## 📝 NOTAS IMPORTANTES

1. **Autenticación**: Ya no hay registro manual, todo es via Supabase (Magic Link, Google, Facebook)
2. **Tipos de retiro**: 
   - `GOAL_ONLY`: Solo retira cuando currentAmount >= goalAmount
   - `ANYTIME`: Retira en cualquier momento
3. **Fecha límite**: Ambos tipos de pago (ONE_TIME y RECURRING) ahora requieren `deadlineAt`
4. **Backend**: Debe estar corriendo en `http://localhost:3000`
5. **Frontend**: Corre en `http://localhost:5173`

---

## 🎯 COLECCIÓN COMPLETA PARA IMPORTAR EN POSTMAN

```json
{
  "info": {
    "name": "ColectaYa API 2025",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "accessToken",
      "value": ""
    },
    {
      "key": "collectionId",
      "value": ""
    }
  ]
}
```

**Para usar**:
1. Copia el JSON de arriba
2. Importa en Postman
3. Agrega los requests manualmente siguiendo esta guía
4. Los tokens se guardarán automáticamente en las variables

---

¡Listo para probar! 🚀
