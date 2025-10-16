# 📋 TABLA FINAL DE ENDPOINTS - COLECTAYA BACKEND

## Endpoints después de implementar faltantes y eliminar redundantes

| Módulo | Descripción | Método | URL | Auth Requerido? | Body | Respuesta Exitosa | Respuesta Error |
|--------|-------------|--------|-----|-----------------|------|-------------------|-----------------|
| **Auth** | Registrar nuevo usuario | POST | `/auth/register` | No | `{ "email": "user@test.com", "password": "123456" }` | 201: `{ "user": { "id": "uuid", "email": "user@test.com", "roles": ["USER"] }, "tokens": { "accessToken": "jwt...", "refreshToken": "jwt..." } }` | 400: `{ "message": "Email already exists" }` |
| **Auth** | Iniciar sesión | POST | `/auth/login` | No | `{ "email": "user@test.com", "password": "123456" }` | 200: `{ "user": { "id": "uuid", "email": "user@test.com", "roles": ["USER"] }, "tokens": { "accessToken": "jwt...", "refreshToken": "jwt..." } }` | 401: `{ "message": "Invalid credentials" }` |
| **Auth** | Cerrar sesión | POST | `/auth/logout` | Sí | - | 200: `{ "message": "Logged out successfully" }` | 401: `{ "message": "Unauthorized" }` |
| **Auth** | Renovar token | POST | `/auth/refresh` | Sí | - | 200: `{ "accessToken": "jwt...", "refreshToken": "jwt...", "expiresIn": 86400 }` | 401: `{ "message": "Invalid refresh token" }` |
| **Users** | Obtener mi perfil | GET | `/users/me` | Sí | - | 200: `{ "id": "uuid", "email": "user@test.com", "name": "John Doe", "avatar": "https://...", "roles": ["USER"] }` | 401: `{ "message": "Unauthorized" }` |
| **Collections** | Lista colecciones públicas | GET | `/collections/public` | No | Query: `?page=1&limit=12&search=viaje&status=ACTIVE` | 200: `{ "collections": [...], "total": 25, "page": 1, "limit": 12, "hasNextPage": true }` | 500: `{ "message": "Internal server error" }` |
| **Collections** | Lista mis colecciones | GET | `/collections` | Sí | - | 200: `[{ "id": "uuid", "title": "Viaje Europa", "currentAmount": 250.50, "goalAmount": 5000, "status": "ACTIVE", "owner": {...} }]` | 401: `{ "message": "Unauthorized" }` |
| **Collections** | Crear nueva colecta | POST | `/collections` | Sí | `{ "title": "Viaje Europa", "description": "...", "goalAmount": 5000, "isPrivate": false, "deadlineAt": "2025-12-31T23:59:59Z" }` | 201: `{ "id": "uuid", "title": "Viaje Europa", "status": "ACTIVE", "createdAt": "2025-10-14T...", ... }` | 400: `{ "message": "Validation failed", "errors": [...] }` |
| **Collections** | Ver detalle de colecta | GET | `/collections/{id}` | Sí | - | 200: `{ "id": "uuid", "title": "...", "currentAmount": 1250.50, "progress": 25.01, "members": [...], "contributions": [...] }` | 404: `{ "message": "Collection not found" }` |
| **Collections** | Actualizar colecta (owner) | PATCH | `/collections/{id}` | Sí (Owner) | `{ "title": "Viaje Europa 2025", "description": "Nueva descripción", "goalAmount": 6000 }` | 200: `{ "id": "uuid", "title": "Viaje Europa 2025", "updatedAt": "2025-10-14T...", ... }` | 403: `{ "message": "Only owner can update collection" }` |
| **Collections** | Eliminar colecta (owner) | DELETE | `/collections/{id}` | Sí (Owner) | - | 204: Sin contenido | 403: `{ "message": "Only owner can delete collection" }` |
| **Collections** | Unirse a colección pública | POST | `/collections/{id}/members/join` | Sí | - | 201: `{ "message": "Successfully joined the collection", "member": { "id": "uuid", "userId": "uuid", "collectionId": "uuid", "joinedAt": "2025-10-14T..." } }` | 400: `{ "message": "You are already a member of this collection" }` |
| **Collections** | 🆕 Salirse de la colecta | POST | `/collections/{id}/members/leave` | Sí | - | 200: `{ "message": "Left collection successfully" }` | 404: `{ "message": "You are not a member of this collection" }` |
| **Members** | Listar miembros de colecta | GET | `/collections/{collectionId}/members` | Sí | - | 200: `[{ "id": "uuid", "userId": "uuid", "acceptedAt": "2025-10-14T...", "user": { "id": "uuid", "email": "user@test.com", "name": "John" } }]` | 403: `{ "message": "No access to this collection" }` |
| **Members** | Remover miembro (owner) | DELETE | `/collections/{collectionId}/members/{userId}` | Sí (Owner) | - | 204: Sin contenido | 403: `{ "message": "Only owner can remove members" }` |
| **Invitations** | Obtener mis invitaciones | GET | `/invitations` | Sí | - | 200: `[{ "id": "uuid", "status": "PENDING", "createdAt": "2025-10-14T...", "collection": {...}, "inviter": {...} }]` | 401: `{ "message": "Unauthorized" }` |
| **Invitations** | Crear invitación | POST | `/invitations` | Sí | `{ "collectionId": "uuid", "invitedEmail": "user@test.com" }` | 201: `{ "id": "uuid", "status": "PENDING", "createdAt": "2025-10-14T...", "collection": {...} }` | 400: `{ "message": "User already invited or is member" }` |
| **Invitations** | Aceptar invitación | PUT | `/invitations/{id}/accept` | Sí | - | 200: `{ "message": "Invitation accepted", "member": { "id": "uuid", "userId": "uuid", "collectionId": "uuid", "acceptedAt": "2025-10-14T..." } }` | 404: `{ "message": "Invitation not found" }` |
| **Invitations** | Rechazar invitación | PUT | `/invitations/{id}/reject` | Sí | - | 200: `{ "message": "Invitation rejected", "status": "REJECTED" }` | 404: `{ "message": "Invitation not found" }` |
| **Contributions** | Contribuir a colección | POST | `/collections/{collectionId}/contributions` | Sí | `{ "amount": 100.50 }` | 201: `{ "id": "uuid", "amount": 100.50, "status": "PAID", "createdAt": "2025-10-14T...", "collection": {...} }` | 400: `{ "message": "Amount must be greater than 0.01" }` |
| **Contributions** | Lista contribuciones de colección | GET | `/collections/{collectionId}/contributions` | Sí | - | 200: `[{ "id": "uuid", "amount": 100.50, "status": "PAID", "createdAt": "2025-10-14T...", "user": {...} }]` | 403: `{ "message": "No access to this collection" }` |
| **Contributions** | Mis contribuciones globales | GET | `/contributions` | Sí | - | 200: `[{ "id": "uuid", "amount": 100.50, "createdAt": "2025-10-14T...", "collection": { "id": "uuid", "title": "Viaje Europa" } }]` | 401: `{ "message": "Unauthorized" }` |
| **Withdrawals** | 🔄 Retiro inteligente | POST | `/collections/{collectionId}/withdrawals` | Sí (Owner) | - | 200: `{ "message": "Processed successfully", "action": "TRANSFERRED", "amount": 5250.75 }` | 403: `{ "message": "Collection not found or you are not the owner" }` |
| **Withdrawals** | Listar retiros | GET | `/collections/{collectionId}/withdrawals` | Sí | - | 200: `[{ "id": "uuid", "amount": 5000, "status": "COMPLETED", "createdAt": "2025-10-14T...", "requester": {...} }]` | 403: `{ "message": "Only owner can view withdrawals" }` |

## 🔍 Cambios Realizados

### ✅ Endpoints Implementados
1. **POST `/collections/{id}/members/leave`** - Permite a un miembro salirse de una colección
2. **POST `/collections/{collectionId}/withdrawals`** - Retiro inteligente que transfiere si meta alcanzada o reembolsa si no
3. **GET `/collections/{collectionId}/withdrawals`** - Lista el historial de retiros de una colección

### ❌ Endpoints Eliminados (Redundantes)
1. **POST `/collections/{collectionId}/members/invite`** - Reemplazado por `POST /invitations`
2. **PATCH `/collections/{collectionId}/withdrawals/{withdrawalId}/approve`** - Funcionalidad de aprobación manual removida
3. **PATCH `/collections/{collectionId}/withdrawals/{withdrawalId}/reject`** - Funcionalidad de rechazo manual removida
4. **DELETE `/invitations/{id}`** - Cancelar invitación no está en la lista final

### 🔄 Reorganización de Módulos

**ANTES (Inconsistente):**
- `POST /collections/{id}/withdraw` - En Collections
- `GET /collections/{id}/withdrawals` - En Collections  
- `POST /collections/{collectionId}/withdrawals` - En Withdrawals
- `GET /collections/{collectionId}/withdrawals` - En Withdrawals (duplicado!)

**DESPUÉS (Organizado):**
- `POST /collections/{collectionId}/withdrawals` - En Withdrawals (retiro inteligente)
- `GET /collections/{collectionId}/withdrawals` - En Withdrawals (listar retiros)

### 🔄 Funcionalidad del Retiro Inteligente

El endpoint `POST /collections/{collectionId}/withdrawals` implementa la lógica:

- **Si `currentAmount >= goalAmount`**: 
  - Acción: `TRANSFERRED`
  - Los fondos se transfieren al owner
  
- **Si `currentAmount < goalAmount`**:
  - Acción: `REFUNDED` 
  - Los fondos se reembolsan a los contribuidores

## 📊 Resumen Final

- **Total de endpoints**: 23
- **Endpoints con autenticación**: 19
- **Endpoints públicos**: 4
- **Módulos**: 6 (Auth, Users, Collections, Members, Invitations, Contributions, Withdrawals)

✅ **Todos los endpoints de retiros están ahora correctamente organizados en el módulo Withdrawals**