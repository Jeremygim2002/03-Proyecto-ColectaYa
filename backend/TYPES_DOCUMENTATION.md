# 📋 **Documentación Completa: Types Frontend ↔ Backend ↔ Endpoints**

**Fecha**: 12 de octubre de 2025  
**Proyecto**: ColectaYa  
**Objetivo**: Mapear cada Type con su Endpoint y método HTTP correspondiente

---

## 🌐 **TYPES FRONTEND**

### **📁 `frontend/src/types/`**

#### **1. `user.ts` - Usuario**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `User` | Estructura básica del usuario | `GET` | `/auth/me`, `/users/me` |
| `AuthTokens` | Tokens de autenticación | `POST` | `/auth/login`, `/auth/register` |
| `AuthResponse` | Respuesta de login/register | `POST` | `/auth/login`, `/auth/register` |
| `LoginData` | Datos para iniciar sesión | `POST` | `/auth/login` |
| `RegisterData` | Datos para registro | `POST` | `/auth/register` |

```typescript
// ✅ SEGURO: User sin datos sensibles
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: string[];
  createdAt: string;
  // ❌ NUNCA incluir: password, refreshToken, bankData
}

// ✅ SEGURO: Solo para autenticación
export interface AuthResponse {
  user: User; // User ya filtrado
  accessToken: string;
  refreshToken?: string; // Solo en respuesta, nunca en User
  expiresIn: number;
}

// ⚠️ SOLO INTERNO - Nunca exponer
interface FullUserInternal {
  // ...User fields
  password: string; // NUNCA en responses
  refreshTokens: string[]; // NUNCA en responses
  bankAccount?: string; // NUNCA en responses
}
```

---

#### **2. `collection.ts` - Colectas**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `Collection` | Estructura básica de colecta | `GET`, `POST`, `PATCH` | `/collections`, `/collections/{id}` |
| `CollectionWithStats` | Colecta con estadísticas | `GET` | `/collections/public`, `/collections/{id}` |
| `CreateCollectionData` | Datos para crear colecta | `POST` | `/collections` |
| `UpdateCollectionData` | Datos para actualizar colecta | `PATCH` | `/collections/{id}` |
| `CollectionListResponse` | Lista paginada de colectas | `GET` | `/collections`, `/collections/public` |
| `CollectionFilters` | Filtros para búsqueda | `GET` | `/collections/public` |

```typescript
export interface Collection {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  goalAmount: number; // Siempre en soles (PEN)
  currency: 'PEN'; // 🏦 Fijo: Solo soles peruanos
  ruleType: "GOAL_ONLY" | "THRESHOLD" | "ANYTIME";
  ruleValue?: number;
  status: 'ACTIVE' | 'COMPLETED';
  isPrivate: boolean;
  deadlineAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: string;
  amount: number; // Siempre en soles (PEN)
  currency: 'PEN'; // 🏦 Fijo: Solo soles peruanos
  message?: string;
  status: 'PAID' | 'FAILED';
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  collection: {
    id: string;
    title: string;
  };
}

export interface Withdrawal {
  id: string;
  amount: number; // Siempre en soles (PEN)
  currency: 'PEN'; // 🏦 Fijo: Solo soles peruanos
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  requestedBy: {
    id: string;
    email: string;
    name?: string;
  };
  collection: {
    id: string;
    title: string;
  };
}
```

---

#### **3. `member.ts` - Miembros**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `Member` | Estructura de miembro | `GET` | `/collections/{id}/members` |
| `InviteMemberData` | Datos para invitar | `POST` | `/collections/{id}/members/invite` |
| `MemberListResponse` | Lista de miembros | `GET` | `/collections/{id}/members` |

```typescript
export interface Member {
  id: string;
  collectionId: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  invitedAt: string;
  acceptedAt?: string; // 🔄 CONSISTENCIA: Cambiar a optional
  addedBy: string;
}

export interface InviteMemberData {
  email: string;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
}
```

---

#### **4. `contribution.ts` - Contribuciones**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `Contribution` | Estructura de contribución | `GET` | `/collections/{id}/contributions` |
| `CreateContributionData` | Datos para contribuir | `POST` | `/contributions` |
| `ContributionListResponse` | Lista de contribuciones | `GET` | `/collections/{id}/contributions` |

```typescript
export interface Contribution {
  id: string;
  amount: number;
  message?: string;
  status: 'PAID' | 'FAILED';
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  collection: {
    id: string;
    title: string;
  };
}

export interface CreateContributionData {
  collectionId: string;
  amount: number;
  message?: string;
}

export interface ContributionListResponse {
  contributions: Contribution[];
  total: number;
  page: number;
  limit: number;
}
```

---

#### **5. `withdrawal.ts` - Retiros**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `Withdrawal` | Estructura de retiro | `GET` | `/collections/{id}/withdrawals` |
| `CreateWithdrawalData` | Datos para solicitar retiro | `POST` | `/withdrawals` |
| `WithdrawalListResponse` | Lista de retiros | `GET` | `/collections/{id}/withdrawals` |

```typescript
export interface Withdrawal {
  id: string;
  amount: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  requestedBy: {
    id: string;
    email: string;
    name?: string;
  };
  collection: {
    id: string;
    title: string;
  };
}

export interface CreateWithdrawalData {
  collectionId: string;
  amount: number;
  reason?: string;
}
```

---

## 🏗️ **TYPES BACKEND**

### **📁 `backend/src/types/`**

#### **1. `user.types.ts` - Usuario**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `User` | Usuario sin datos sensibles | `GET` | `/auth/me`, `/users/me` |
| `UserWithStats` | Usuario con estadísticas | `GET` | `/users/{id}/profile` |
| `PublicUserProfile` | Perfil público | `GET` | `/users/{id}/public` |
| `BasicUser` | Usuario básico para relaciones | `GET` | Incluido en otras respuestas |
| `AuthResponse` | Respuesta de autenticación | `POST` | `/auth/login`, `/auth/register` |
| `UserProfileResponse` | Perfil completo | `GET` | `/users/me/profile` |

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
}

export interface UserWithStats {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles: Role[];
  createdAt: Date;
  collectionsCount: number;
  contributionsCount: number;
  totalContributed: number;
  collectionsOwned: number;
}

export interface BasicUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}
```

---

#### **2. `collection.types.ts` - Colectas**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `CollectionWithStats` | Colecta con estadísticas | `GET` | `/collections/public`, `/collections/{id}` |
| `CollectionWithDetails` | Colecta con detalles completos | `GET` | `/collections/{id}` |
| `PublicCollectionsResponse` | Lista pública con paginación | `GET` | `/collections/public` |
| `BasicCollection` | Colecta básica para listas | `GET` | `/collections` |
| `CollectionResponse` | Respuesta crear/actualizar | `POST`, `PATCH` | `/collections`, `/collections/{id}` |
| `UserCollectionsDashboard` | Dashboard del usuario | `GET` | `/users/me/collections` |

```typescript
export interface CollectionWithStats {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPrivate: boolean;
  goalAmount: number;
  ruleType: RuleType;
  ruleValue?: number;
  status: CollectionStatus;
  deadlineAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  owner: BasicUser;
  currentAmount: number;
  contributorsCount: number;
  progress: number;
}

export interface PublicCollectionsResponse {
  collections: CollectionWithStats[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface CollectionWithDetails extends CollectionWithStats {
  members: Array<{
    id: string;
    user: BasicUser;
    role: string;
    acceptedAt?: Date;
    joinedAt: Date;
  }>;
  contributions: Array<{
    id: string;
    amount: number;
    message?: string;
    user: BasicUser;
    createdAt: Date;
  }>;
}
```

---

#### **3. `contribution.types.ts` - Contribuciones**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `ContributionWithUser` | Contribución con usuario | `GET` | `/collections/{id}/contributions` |
| `BasicContribution` | Contribución básica | `GET` | Incluida en otras respuestas |
| `ContributionStats` | Estadísticas | `GET` | `/users/me/contributions/stats` |
| `UserContributionsResponse` | Contribuciones del usuario | `GET` | `/users/me/contributions` |

```typescript
export interface ContributionWithUser {
  id: string;
  amount: number;
  message?: string;
  status: ContributionStatus;
  createdAt: Date;
  user: BasicUser;
  collection: {
    id: string;
    title: string;
  };
}

export interface UserContributionsResponse {
  contributions: ContributionWithUser[];
  stats: ContributionStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
```

---

#### **4. `withdrawal.types.ts` - Retiros**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `WithdrawalWithUser` | Retiro con usuario | `GET` | `/collections/{id}/withdrawals` |
| `BasicWithdrawal` | Retiro básico | `GET` | Incluido en otras respuestas |
| `WithdrawalStats` | Estadísticas de retiros | `GET` | `/collections/{id}/withdrawals/stats` |
| `CollectionWithdrawalsResponse` | Retiros de colecta | `GET` | `/collections/{id}/withdrawals` |

```typescript
export interface WithdrawalWithUser {
  id: string;
  amount: number;
  reason?: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt?: Date;
  requestedBy: BasicUser;
  collection: {
    id: string;
    title: string;
    currentAmount: number;
  };
}

export interface CollectionWithdrawalsResponse {
  withdrawals: WithdrawalWithUser[];
  stats: WithdrawalStats;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
```

---

#### **5. `common.types.ts` - Types Comunes**

| Type | Propósito | Usado en Método HTTP | Endpoint |
|------|-----------|---------------------|----------|
| `PaginatedResponse<T>` | Respuesta paginada genérica | `GET` | Todos los endpoints con paginación |
| `ApiResponse<T>` | Respuesta API estándar | Todos | Wrapper interno del backend |
| `ErrorResponse` | Respuesta de error | Todos | Cuando hay errores |
| `SuccessResponse` | Respuesta de éxito | `POST`, `PUT`, `DELETE` | Operaciones exitosas |

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface SuccessResponse {
  success: true;
  message: string;
}
```

---

## 🔗 **MAPEO COMPLETO: Endpoint → Types**

### **📋 AUTH Endpoints**

| Endpoint | Método | Frontend Type (Entrada) | Backend Type (Salida) |
|----------|--------|------------------------|----------------------|
| `/auth/login` | `POST` | `LoginData` | `AuthResponse` |
| `/auth/register` | `POST` | `RegisterData` | `AuthResponse` |
| `/auth/me` | `GET` | - | `User` |

### **📋 COLLECTIONS Endpoints**

| Endpoint | Método | Frontend Type (Entrada) | Backend Type (Salida) |
|----------|--------|------------------------|----------------------|
| `/collections` | `GET` | `CollectionFilters` | `PaginatedResponse<CollectionWithStats>` |
| `/collections` | `POST` | `CreateCollectionData` | `CollectionResponse` |
| `/collections/{id}` | `GET` | - | `CollectionWithDetails` |
| `/collections/{id}` | `PATCH` | `UpdateCollectionData` | `CollectionResponse` |
| `/collections/{id}` | `DELETE` | - | `SuccessResponse` |
| `/collections/public` | `GET` | `CollectionFilters` | `PublicCollectionsResponse` |

### **📋 MEMBERS Endpoints**

| Endpoint | Método | Frontend Type (Entrada) | Backend Type (Salida) |
|----------|--------|------------------------|----------------------|
| `/collections/{id}/members` | `GET` | - | `MemberListResponse` |
| `/collections/{id}/members/invite` | `POST` | `InviteMemberData` | `Member` |
| `/collections/{id}/members/accept` | `POST` | - | `Member` |
| `/collections/{id}/members/{userId}` | `DELETE` | - | `SuccessResponse` |

### **📋 CONTRIBUTIONS Endpoints**

| Endpoint | Método | Frontend Type (Entrada) | Backend Type (Salida) |
|----------|--------|------------------------|----------------------|
| `/contributions` | `POST` | `CreateContributionData` | `ContributionWithUser` |
| `/collections/{id}/contributions` | `GET` | - | `ContributionListResponse` |
| `/users/me/contributions` | `GET` | - | `UserContributionsResponse` |

### **📋 WITHDRAWALS Endpoints**

| Endpoint | Método | Frontend Type (Entrada) | Backend Type (Salida) |
|----------|--------|------------------------|----------------------|
| `/withdrawals` | `POST` | `CreateWithdrawalData` | `WithdrawalWithUser` |
| `/collections/{id}/withdrawals` | `GET` | - | `CollectionWithdrawalsResponse` |
| `/withdrawals/{id}/approve` | `PATCH` | - | `WithdrawalWithUser` |
| `/withdrawals/{id}/reject` | `PATCH` | - | `WithdrawalWithUser` |

**📝 Decisión de Métodos HTTP:**
- `POST /withdrawals` - Crear nuevo retiro ✅
- `PATCH /withdrawals/{id}/approve` - Cambiar estado existente ✅ 
- `PATCH /withdrawals/{id}/reject` - Cambiar estado existente ✅

---

## 🎯 **REGLAS DE CONSISTENCIA Y SEGURIDAD**

### **✅ Nombres Deben Coincidir:**
- Frontend: `User` ↔ Backend: `User` ✅
- Frontend: `Collection` ↔ Backend: `CollectionWithStats` ✅ (diferentes propósitos)
- Frontend: `AuthResponse` ↔ Backend: `AuthResponse` ✅

### **✅ Campos Opcionales - REGLA: Usar `?` (NO `| null`):**
- ✅ Correcto: `name?: string`, `avatar?: string`, `acceptedAt?: string`
- ❌ Incorrecto: `name: string | null`, `acceptedAt: string | null`
- 🔄 **Mapeo**: Backend `Date` → Frontend `string` (JSON serialization)

### **✅ Métodos HTTP Semánticos:**
- `POST` - Crear nuevos recursos ✅
- `PATCH` - Modificar recursos existentes (cambiar estado) ✅
- `GET` - Obtener recursos ✅
- `DELETE` - Eliminar recursos ✅

### **🔒 SEGURIDAD - NUNCA Exponer:**
```typescript
// ❌ PROHIBIDO en responses públicos:
interface NEVER_EXPOSE {
  password: string;        // Solo para auth interno
  refreshTokens: string[]; // Solo en AuthResponse
  bankAccount?: string;    // Datos bancarios sensibles
  internalNotes?: string;  // Notas administrativas
}
```

### **🏦 CURRENCY - Solo Soles Peruanos:**
- Todos los `amount` están en **PEN** (Soles)
- Campo `currency: 'PEN'` fijo en Collections, Contributions, Withdrawals
- Frontend debe mostrar símbolo "S/" en UI

### **✅ Response Types Idénticos:**
- Estructura de respuesta debe ser exactamente igual
- Campos calculados (`currentAmount`, `progress`) deben coincidir
- Paginación debe seguir el mismo patrón

---

## 🚀 **BENEFICIOS DE ESTA ESTRUCTURA**

1. **🔒 Type Safety**: Errores detectados en tiempo de compilación
2. **📖 Documentación**: Cada endpoint tiene su contrato claro
3. **🔄 Consistencia**: Frontend y Backend "hablan el mismo idioma"
4. **🛠️ Mantenibilidad**: Cambios en un lugar se reflejan en ambos
5. **⚡ Productividad**: Autocompletado perfecto en ambos lados

---

*Documentación generada el 12 de octubre de 2025 - ColectaYa Project* ✨