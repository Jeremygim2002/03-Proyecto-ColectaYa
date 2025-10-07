# 🚀 Guía de Testing con Postman - ColectaYa MVP

## 📋 Configuración Inicial

**Base URL**: `http://localhost:3000`

---

## 🔐 PASO 1: AUTENTICACIÓN

### 1.1 Registrar Usuario 1 (Owner)
```
POST http://localhost:3000/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "owner@test.com",
  "password": "123456"
}
```

**Respuesta Esperada (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "owner@test.com",
    "roles": ["USER"]
  }
}
```

**✅ GUARDAR**: Copia el `access_token` para usarlo en las siguientes peticiones

---

### 1.2 Registrar Usuario 2 (Miembro)
```
POST http://localhost:3000/auth/register
```

**Body (JSON):**
```json
{
  "email": "member@test.com",
  "password": "123456"
}
```

**✅ GUARDAR**: Copia el `access_token` del segundo usuario

---

### 1.3 Login (si necesitas volver a obtener el token)
```
POST http://localhost:3000/auth/login
```

**Body (JSON):**
```json
{
  "email": "owner@test.com",
  "password": "123456"
}
```

---

### 1.4 Ver Mi Perfil
```
GET http://localhost:3000/auth/profile
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 👤 PASO 2: USUARIOS

### 2.1 Obtener Mi Perfil
```
GET http://localhost:3000/users/me
```

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta:**
```json
{
  "id": "uuid",
  "email": "owner@test.com",
  "roles": ["USER"],
  "createdAt": "2025-10-02T..."
}
```

---

## 💰 PASO 3: COLECTAS (Collections)

### 3.1 Crear Colecta (con token de owner@test.com)
```
POST http://localhost:3000/collections
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Viaje de Graduación",
  "description": "Colecta para viaje a Europa",
  "goalAmount": 5000,
  "ruleType": "THRESHOLD",
  "ruleValue": 50,
  "isPrivate": false
}
```

**Opciones para `ruleType`:**
- `"GOAL_ONLY"` - Solo retirar cuando se alcanza el 100%
- `"THRESHOLD"` - Retirar cuando se alcanza el porcentaje en `ruleValue` (ej: 50%)
- `"ANYTIME"` - Retirar en cualquier momento

**Respuesta (201):**
```json
{
  "id": "uuid-de-la-colecta",
  "ownerId": "uuid-owner",
  "title": "Viaje de Graduación",
  "description": "Colecta para viaje a Europa",
  "isPrivate": false,
  "goalAmount": "5000.00",
  "ruleType": "THRESHOLD",
  "thresholdPct": "50.00",
  "status": "ACTIVE",
  "createdAt": "2025-10-02T..."
}
```

**✅ GUARDAR**: Copia el `id` de la colecta (lo usarás como `:collectionId`)

---

### 3.2 Listar Mis Colectas
```
GET http://localhost:3000/collections
```

**Headers:**
```
Authorization: Bearer TU_TOKEN
```

---

### 3.3 Ver Detalle de Colecta (con progreso)
```
GET http://localhost:3000/collections/:collectionId
```

**Ejemplo:**
```
GET http://localhost:3000/collections/abc-123-uuid
```

**Respuesta:**
```json
{
  "id": "uuid",
  "title": "Viaje de Graduación",
  "currentAmount": 1500.00,
  "progress": 30.0,
  "goalAmount": "5000.00",
  "owner": {
    "id": "uuid",
    "email": "owner@test.com"
  },
  "members": [...],
  "contributions": [...]
}
```

---

### 3.4 Actualizar Colecta (solo owner)
```
PATCH http://localhost:3000/collections/:collectionId
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Viaje a Europa 2025",
  "goalAmount": 6000
}
```

---

### 3.5 Eliminar Colecta (solo owner, sin contribuciones)
```
DELETE http://localhost:3000/collections/:collectionId
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
```

**Respuesta:** `204 No Content`

---

## 👥 PASO 4: MIEMBROS (Members)

### 4.1 Invitar Miembro (con token de owner)
```
POST http://localhost:3000/collections/:collectionId/members/invite
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "member@test.com"
}
```

**Respuesta:**
```json
{
  "id": "uuid-membership",
  "collectionId": "uuid-colecta",
  "userId": "uuid-member",
  "invitedAt": "2025-10-02T...",
  "acceptedAt": null,
  "user": {
    "id": "uuid",
    "email": "member@test.com"
  }
}
```

---

### 4.2 Aceptar Invitación (con token de member@test.com)
```
POST http://localhost:3000/collections/:collectionId/members/accept
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_MEMBER
```

**Sin Body**

**Respuesta:**
```json
{
  "id": "uuid-membership",
  "acceptedAt": "2025-10-02T..."
}
```

---

### 4.3 Listar Miembros
```
GET http://localhost:3000/collections/:collectionId/members
```

**Headers:**
```
Authorization: Bearer TU_TOKEN
```

---

### 4.4 Remover Miembro (solo owner)
```
DELETE http://localhost:3000/collections/:collectionId/members/:userId
```

**Ejemplo:**
```
DELETE http://localhost:3000/collections/abc-123/members/def-456
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
```

**Respuesta:** `204 No Content`

---

## 💸 PASO 5: CONTRIBUCIONES (Funding)

### 5.1 Contribuir a Colecta
```
POST http://localhost:3000/collections/:collectionId/contributions
```

**Headers:**
```
Authorization: Bearer TU_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 500
}
```

**Respuesta (90% de éxito simulado):**
```json
{
  "id": "uuid-contribucion",
  "collectionId": "uuid-colecta",
  "userId": "uuid-usuario",
  "amount": "500.00",
  "status": "PAID",
  "paymentRef": "PAY-1696279200000-xyz",
  "createdAt": "2025-10-02T...",
  "user": {
    "id": "uuid",
    "email": "owner@test.com"
  }
}
```

**⚠️ Nota**: 10% de las veces fallará con `status: "FAILED"` para simular pagos fallidos

---

### 5.2 Listar Contribuciones
```
GET http://localhost:3000/collections/:collectionId/contributions
```

**Headers:**
```
Authorization: Bearer TU_TOKEN
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "amount": "500.00",
    "status": "PAID",
    "createdAt": "2025-10-02T...",
    "user": {
      "email": "owner@test.com"
    }
  }
]
```

---

## 💰 PASO 6: RETIROS (Withdrawals)

### 6.1 Solicitar Retiro (solo owner)
```
POST http://localhost:3000/collections/:collectionId/withdrawals
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 1000
}
```

**⚠️ VALIDACIONES SEGÚN REGLA:**
- **GOAL_ONLY**: Solo si `progress >= 100%`
- **THRESHOLD**: Solo si `progress >= thresholdPct` (ej: 50%)
- **ANYTIME**: Siempre permitido

**Respuesta Exitosa:**
```json
{
  "id": "uuid-retiro",
  "collectionId": "uuid-colecta",
  "requestedBy": "uuid-owner",
  "amount": "1000.00",
  "status": "REQUESTED",
  "createdAt": "2025-10-02T..."
}
```

**Respuesta de Error (si no cumple regla):**
```json
{
  "statusCode": 400,
  "message": "Cannot withdraw until threshold is reached (50%)"
}
```

---

### 6.2 Listar Retiros (solo owner)
```
GET http://localhost:3000/collections/:collectionId/withdrawals
```

**Headers:**
```
Authorization: Bearer TOKEN_DEL_OWNER
```

---

## 🧪 FLUJO COMPLETO DE PRUEBA

### Secuencia Recomendada:

1. **Registrar 2 usuarios** (owner y member)
2. **Crear colecta** con owner
3. **Invitar miembro** desde owner
4. **Aceptar invitación** desde member
5. **Contribuir** desde ambos usuarios (varias veces hasta alcanzar threshold)
6. **Ver progreso** de la colecta
7. **Solicitar retiro** cuando se cumpla la regla
8. **Listar todo** para verificar datos

---

## 🔧 Variables de Postman (Opcional)

Crea estas variables en Postman para facilitar las pruebas:

```
{{baseUrl}} = http://localhost:3000
{{ownerToken}} = (token del owner)
{{memberToken}} = (token del member)
{{collectionId}} = (id de la colecta creada)
{{userId}} = (id del usuario a remover)
```

Luego usa: `{{baseUrl}}/collections/{{collectionId}}/contributions`

---

## ⚠️ Errores Comunes

### 401 Unauthorized
- Falta el header `Authorization: Bearer TOKEN`
- Token expirado (válido 24h)
- Token inválido

### 403 Forbidden
- Intentar actualizar/eliminar colecta sin ser owner
- Acceder a colecta privada sin ser miembro

### 404 Not Found
- ID de colecta/usuario incorrecto
- Recurso no existe

### 400 Bad Request
- Datos inválidos en el body
- Reglas de negocio no cumplidas (ej: retiro sin alcanzar threshold)

---

## ✅ Checklist de Testing

- [ ] Registro exitoso
- [ ] Login exitoso
- [ ] Ver mi perfil
- [ ] Crear colecta pública
- [ ] Crear colecta privada
- [ ] Listar mis colectas
- [ ] Ver detalle con progreso
- [ ] Actualizar colecta (owner)
- [ ] Actualizar colecta (no owner) ❌ debe fallar
- [ ] Invitar miembro
- [ ] Aceptar invitación
- [ ] Listar miembros
- [ ] Contribuir (éxito)
- [ ] Contribuir (fallo simulado - reintentar)
- [ ] Ver progreso actualizado
- [ ] Solicitar retiro sin alcanzar threshold ❌ debe fallar
- [ ] Contribuir hasta alcanzar threshold
- [ ] Solicitar retiro con threshold alcanzado ✅
- [ ] Remover miembro
- [ ] Eliminar colecta sin fondos
- [ ] Eliminar colecta con fondos ❌ debe fallar

---

**🎉 ¡Listo para probar!**
