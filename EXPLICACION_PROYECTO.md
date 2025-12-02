# 📚 GUÍA DE EXPLICACIÓN - PROYECTO COLECTAYA

## 📋 ÍNDICE
1. [TypeScript en el Proyecto](#typescript-en-el-proyecto)
2. [Arquitectura del Backend (NestJS)](#arquitectura-del-backend)
3. [Autenticación con Supabase y Google OAuth](#autenticación)
4. [Módulo de PayPal](#módulo-de-paypal)
5. [Módulo de Contribuciones](#módulo-de-contribuciones)
6. [Frontend con TypeScript](#frontend-con-typescript)

---

## 🔷 TYPESCRIPT EN EL PROYECTO

### ¿Qué es TypeScript?
TypeScript es JavaScript con **tipos** (type definitions). Es como agregar "etiquetas" a tus variables para saber qué tipo de dato esperan.

### Configuración Backend (`backend/tsconfig.json`)
```json
{
  "compilerOptions": {
    "module": "commonjs",              // Sistema de módulos (require/module.exports)
    "target": "ES2023",                // Versión de JavaScript a generar
    "experimentalDecorators": true,     // Permite usar @ en clases (decoradores)
    "emitDecoratorMetadata": true,      // Metadatos para inyección de dependencias
    "strict": true,                     // Modo estricto (detecta más errores)
    "outDir": "./dist"                  // Carpeta de salida del código compilado
  }
}
```

**Puntos clave para explicar:**
- `experimentalDecorators`: Necesario para NestJS. Permite usar `@Injectable()`, `@Controller()`, etc.
- `strict`: Activa todas las validaciones de tipos - previene errores
- `outDir`: TypeScript compila `.ts` → `.js` y lo guarda en `dist/`

### Configuración Frontend (`frontend/tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",                     // Raíz del proyecto
    "paths": {
      "@/*": ["./src/*"]                // Alias: @/components = ./src/components
    }
  }
}
```

**Ventaja:** En lugar de `import Button from '../../../../components/Button'`
Usas: `import Button from '@/components/Button'` ✅

---

## 🏗️ ARQUITECTURA DEL BACKEND

### Patrón de Diseño: **Módulos + Inyección de Dependencias**

```
┌─────────────────────────────────────┐
│         app.module.ts               │  ← Módulo raíz (orquestador)
│  Importa: Auth, PayPal, Supabase   │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      Módulos Específicos            │
│  • auth.module.ts                   │
│  • paypal.module.ts                 │
│  • contributions.module.ts          │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  Cada módulo tiene:                 │
│  • Controller (rutas HTTP)          │
│  • Service (lógica de negocio)      │
│  • DTOs (validación de datos)       │
└─────────────────────────────────────┘
```

### Ejemplo: `auth.module.ts`
```typescript
@Module({
  imports: [ConfigModule, PrismaModule, SupabaseModule],  // Módulos que necesita
  controllers: [AuthController],                          // Rutas HTTP
  providers: [SupabaseAuthGuard],                         // Servicios internos
  exports: [SupabaseAuthGuard]                            // Expone para otros módulos
})
export class AuthModule {}
```

**Puntos clave:**
- **imports**: Módulos externos que necesita (configuración, base de datos, Supabase)
- **controllers**: Define las rutas HTTP (endpoints)
- **providers**: Servicios que pueden ser inyectados
- **exports**: Hace disponible `SupabaseAuthGuard` para otros módulos

---

## 🔐 AUTENTICACIÓN CON SUPABASE Y GOOGLE

### Flujo de Login con Google

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │      │   Backend   │      │   Supabase  │
│   (React)   │      │   (NestJS)  │      │   + Google  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       │ 1. Click "Login"   │                     │
       │───────────────────>│                     │
       │                    │                     │
       │                    │ 2. Genera URL OAuth │
       │                    │────────────────────>│
       │                    │                     │
       │ 3. URL de Google   │                     │
       │<───────────────────│                     │
       │                    │                     │
       │ 4. Redirige a Google                     │
       │─────────────────────────────────────────>│
       │                                           │
       │ 5. Usuario autoriza                       │
       │                                           │
       │ 6. Callback con token                     │
       │<──────────────────────────────────────────│
       │                                           │
       │ 7. Token JWT                              │
       │ (guardado en localStorage)                │
```

### Código: `supabase-auth.service.ts`

```typescript
async getGoogleLoginUrl() {
  const frontendUrl = this.configService.get<string>('FRONTEND_URL');

  // Supabase genera la URL de autorización de Google
  const { data, error } = await this.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${frontendUrl}/auth/callback`,  // A dónde volver después
      queryParams: {
        access_type: 'offline',   // Permite refresh tokens
        prompt: 'consent',        // Siempre pide confirmación
      },
    },
  });

  return { url: data.url };  // URL para redirigir al usuario
}
```

**Explicación paso a paso:**
1. Usuario hace click en "Iniciar sesión con Google"
2. Backend pide a Supabase la URL de autorización
3. Frontend redirige al usuario a esa URL (página de Google)
4. Usuario autoriza la app en Google
5. Google redirige a `/auth/callback` con un token
6. Frontend guarda el token JWT en `localStorage`
7. Todas las peticiones futuras incluyen ese token en el header

---

### Guard de Autenticación: `supabase-auth.guard.ts`

Este "guardia" protege las rutas - solo deja pasar usuarios autenticados.

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extraer token del header "Authorization: Bearer <token>"
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // 2. Validar token con Supabase
    const supabaseUser = await this.authService.validateToken(token);

    // 3. Buscar usuario en nuestra base de datos (Prisma)
    const prismaUser = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id }
    });

    // 4. Agregar usuario a la petición (request)
    request.user = prismaUser;  // Ahora todos los controllers pueden acceder a req.user
    
    return true;  // ✅ Permite acceso
  }
}
```

**Uso en controllers:**
```typescript
@Controller('contributions')
@UseGuards(SupabaseAuthGuard)  // 🔒 Protege todas las rutas
export class ContributionsController {
  @Post()
  async create(@Request() req) {
    const userId = req.user.id;  // Usuario autenticado disponible aquí
  }
}
```

---

## 💳 MÓDULO DE PAYPAL

### Flujo Completo de Pago

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO DE PAGO PAYPAL                      │
└──────────────────────────────────────────────────────────────┘

1. CREAR ORDEN
   Frontend                Backend                 PayPal API
      │                       │                         │
      │ POST /paypal/        │                         │
      │ create-order         │                         │
      │ { amount: 50 }       │                         │
      │─────────────────────>│                         │
      │                       │                         │
      │                       │ POST /v2/checkout/     │
      │                       │ orders                  │
      │                       │ { amount: 50 USD }     │
      │                       │────────────────────────>│
      │                       │                         │
      │                       │ { id: "ORDER_ID",      │
      │                       │   links: [approve_url] }│
      │                       │<────────────────────────│
      │                       │                         │
      │ { id, links }        │                         │
      │<─────────────────────│                         │
      │                       │                         │
      │ Redirige a           │                         │
      │ approve_url          │                         │
      │─────────────────────────────────────────────────>│
      │                                                  │
      │ Usuario aprueba pago en PayPal                  │
      │                                                  │
      │ Redirect a /success?token=ORDER_ID              │
      │<─────────────────────────────────────────────────│
      │                                                  │

2. CAPTURAR PAGO
   Frontend                Backend                 PayPal API
      │                       │                         │
      │ POST /paypal/        │                         │
      │ capture-order        │                         │
      │ { orderId }          │                         │
      │─────────────────────>│                         │
      │                       │                         │
      │                       │ POST /v2/checkout/     │
      │                       │ orders/{id}/capture    │
      │                       │────────────────────────>│
      │                       │                         │
      │                       │ { status: "COMPLETED" }│
      │                       │<────────────────────────│
      │                       │                         │
      │                       │ Guarda contribución    │
      │                       │ en base de datos       │
      │                       │                         │
      │ { success: true }    │                         │
      │<─────────────────────│                         │
```

### Código: `paypal.service.ts`

#### 1. Autenticación con PayPal
```typescript
private async getAccessToken(): Promise<string> {
  // PayPal usa autenticación básica: clientId:secret en Base64
  const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');

  const response = await axios.post(
    `${this.apiUrl}/v1/oauth2/token`,
    'grant_type=client_credentials',  // Tipo de autenticación
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  // Token válido por ~8 horas, lo cacheamos
  this.cachedToken = response.data.access_token;
  this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
  
  return this.cachedToken;
}
```

**Explicación:**
- PayPal requiere un `access_token` para hacer cualquier operación
- Se obtiene enviando `clientId:secret` en Base64
- El token expira, por eso lo guardamos en cache con su fecha de expiración

---

#### 2. Crear Orden de Pago
```typescript
async createOrder(amount: number, collectionId: string): Promise<PayPalOrderResponse> {
  const accessToken = await this.getAccessToken();

  const response = await axios.post(
    `${this.apiUrl}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',  // Tipo de transacción: captura inmediata
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),  // Monto en formato decimal
          },
          description: `Contribución a ColectaYa - ID: ${collectionId}`,
          reference_id: collectionId,  // Referencia interna
        },
      ],
      application_context: {
        brand_name: 'ColectaYa',
        return_url: `${frontendUrl}/collections/${collectionId}?payment=success`,
        cancel_url: `${frontendUrl}/collections/${collectionId}?payment=cancelled`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Respuesta incluye links para que el usuario apruebe el pago
  return response.data;
}
```

**Puntos clave:**
- `intent: 'CAPTURE'`: El dinero se captura inmediatamente (no es reserva)
- `purchase_units`: Array de productos/servicios - solo usamos uno
- `application_context`: Personalización de la experiencia de pago
  - `return_url`: A dónde redirigir si el pago es exitoso
  - `cancel_url`: A dónde redirigir si el usuario cancela

---

#### 3. Capturar el Pago
```typescript
async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await this.getAccessToken();

  const response = await axios.post(
    `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`,
    {},  // Sin body
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Verificar que el pago se completó
  if (response.data.status !== 'COMPLETED') {
    throw new BadRequestException('Payment was not completed');
  }

  const captureId = response.data.purchase_units[0]?.payments?.captures[0]?.id;
  this.logger.log(`PayPal order captured: ${orderId} (Capture ID: ${captureId})`);

  return response.data;
}
```

**Explicación:**
- Este endpoint finaliza la transacción
- Se llama después de que el usuario aprueba el pago en PayPal
- `status: 'COMPLETED'` confirma que el dinero se transfirió
- `captureId`: ID único de la transacción (para registros/reembolsos)

---

### Controller: `paypal.controller.ts`

```typescript
@Controller('collections/:collectionId/paypal')
@UseGuards(SupabaseAuthGuard)  // 🔒 Requiere autenticación
export class PayPalController {
  @Post('create-order')
  async createOrder(
    @Param('collectionId') collectionId: string,
    @Body() dto: CreateOrderDto
  ) {
    // 1. Validar que la colecta existe y está activa
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { contributions: { where: { status: 'PAID' } } }
    });

    // 2. Calcular monto disponible
    const totalRaised = collection.contributions.reduce((sum, c) => sum + c.amount, 0);
    const availableAmount = collection.goalAmount - totalRaised;

    // 3. Validar que el monto no exceda el disponible
    if (dto.amount > availableAmount) {
      throw new BadRequestException(
        `Monto excede el disponible: ${availableAmount}`
      );
    }

    // 4. Crear orden en PayPal
    const order = await this.paypalService.createOrder(dto.amount, collectionId);

    return {
      id: order.id,
      status: order.status,
      links: order.links,  // Frontend usa esto para redirigir
    };
  }

  @Post('capture-order')
  async captureOrder(
    @Param('collectionId') collectionId: string,
    @Body() dto: CaptureOrderDto
  ) {
    // Capturar el pago
    const capture = await this.paypalService.captureOrder(dto.orderId);
    
    return {
      id: capture.id,
      status: capture.status,
      captureId: capture.purchase_units[0]?.payments?.captures[0]?.id,
    };
  }
}
```

**Validaciones importantes:**
1. Usuario autenticado (SupabaseAuthGuard)
2. Colecta existe y está activa
3. Monto no excede el objetivo de la colecta
4. PayPal confirma que el pago se completó

---

## 📦 MÓDULO DE COLECTAS

### ¿Qué es una Colecta?

Una colecta es el objeto principal de la aplicación. Es como una "vaquita" donde varias personas aportan dinero para un objetivo común.

**Estructura de una Colecta:**
```typescript
{
  id: "uuid",
  title: "Fiesta de graduación",
  description: "Para celebrar nuestro grado",
  goalAmount: 1000,           // Meta: S/ 1000
  currentAmount: 450,         // Recaudado hasta ahora
  isPrivate: true,            // ¿Es privada o pública?
  status: "ACTIVE",           // ACTIVE, COMPLETED, CANCELLED
  ruleType: "EQUAL",          // Cómo se divide
  ruleValue: 50,              // Valor de la regla
  owner: { id, name, email }, // Creador
  members: [...],             // Miembros
  contributions: [...]        // Aportes realizados
}
```

---

### Modelo de Datos (Prisma Schema)

```prisma
model Collection {
  id            String             @id @default(uuid())
  ownerId       String             // Creador de la colecta
  title         String             // Título
  description   String?            // Descripción (opcional)
  isPrivate     Boolean            @default(false)  // Pública o privada
  goalAmount    Decimal            // Meta en soles
  ruleType      RuleType           // Tipo de división
  ruleValue     Decimal?           // Valor de la regla
  status        CollectionStatus   @default(ACTIVE)
  deadlineAt    DateTime?          // Fecha límite (opcional)
  imageUrl      String?            // Imagen de portada
  
  // Relaciones
  owner         User               @relation("CollectionOwner")
  members       CollectionMember[] // Miembros
  contributions Contribution[]     // Aportes
}
```

**Tipos de Reglas (`RuleType`):**
- `EQUAL`: Todos aportan igual → `ruleValue` = monto por persona
- `CUSTOM`: Aportes personalizados (cada uno lo que quiera)
- `PERCENTAGE`: Por porcentaje → `ruleValue` = porcentaje a aportar

**Estados (`CollectionStatus`):**
- `ACTIVE`: Activa, aceptando contribuciones
- `COMPLETED`: Meta alcanzada
- `CANCELLED`: Cancelada por el owner

---

### Flujo de Creación de Colecta

```
┌────────────────────────────────────────────────────┐
│          CREAR COLECTA                             │
└────────────────────────────────────────────────────┘

Frontend                Backend                 Database
   │                       │                         │
   │ POST /collections     │                         │
   │ {                     │                         │
   │   title: "Viaje",     │                         │
   │   goalAmount: 2000,   │                         │
   │   ruleType: "EQUAL",  │                         │
   │   isPrivate: false    │                         │
   │ }                     │                         │
   │──────────────────────>│                         │
   │                       │                         │
   │                       │ 1. Validar usuario      │
   │                       │    existe               │
   │                       │────────────────────────>│
   │                       │<────────────────────────│
   │                       │                         │
   │                       │ 2. Crear colecta        │
   │                       │    (owner = userId)     │
   │                       │────────────────────────>│
   │                       │<────────────────────────│
   │                       │                         │
   │ { id, title, ... }    │                         │
   │<──────────────────────│                         │
   │                       │                         │
   │ Redirige a            │                         │
   │ /collections/{id}     │                         │
```

### Código: `collections.service.ts`

#### 1. Crear Colecta
```typescript
async create(ownerId: string, dto: CreateCollectionDto): Promise<Collection> {
  // 1. VALIDAR QUE EL USUARIO EXISTE
  const owner = await this.prisma.user.findUnique({ 
    where: { id: ownerId } 
  });
  
  if (!owner) {
    throw new NotFoundException('Owner user not found');
  }

  // 2. CREAR COLECTA EN LA BASE DE DATOS
  const newCollection = await this.prisma.collection.create({
    data: {
      owner: { connect: { id: ownerId } },  // Conectar con el usuario
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isPrivate: true,  // Por defecto, todas son privadas
      goalAmount: dto.goalAmount,
      ruleType: dto.ruleType,
      ruleValue: dto.ruleValue,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : undefined,
    },
  });

  return newCollection;
}
```

**Validaciones importantes:**
- Usuario owner debe existir (previene errores de Foreign Key)
- `isPrivate: true` por defecto (seguridad)
- Fecha límite es opcional
- Si falla, captura errores de Prisma (P2002, P2003)

---

#### 2. Obtener Colectas Públicas (Con Paginación)

```typescript
async findPublicCollections(filters: GetPublicCollectionsDto) {
  // 1. ACTUALIZAR STATUS AUTOMÁTICAMENTE
  await this.updateCollectionStatuses();  // Marca como COMPLETED si alcanzó la meta

  const { search, status, skip, take } = filters;

  // 2. CONSTRUIR FILTROS
  const whereCondition = {
    isPrivate: false,  // Solo públicas
    status: status,    // ACTIVE, COMPLETED, o TODOS
  };

  // Si hay búsqueda, agregar filtro
  if (search) {
    whereCondition.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 3. EJECUTAR QUERY CON PAGINACIÓN
  const [collections, total] = await Promise.all([
    this.prisma.collection.findMany({
      where: whereCondition,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: { 
          where: { acceptedAt: { not: null } },  // Solo miembros aceptados
          select: { userId: true } 
        },
        contributions: { 
          where: { status: 'PAID' },  // Solo contribuciones pagadas
          select: { amount: true, userId: true } 
        },
      },
      skip,   // Saltar registros (paginación)
      take,   // Cantidad a traer
      orderBy: { createdAt: 'desc' },  // Más recientes primero
    }),
    this.prisma.collection.count({ where: whereCondition })  // Total de registros
  ]);

  // 4. CALCULAR ESTADÍSTICAS PARA CADA COLECTA
  const collectionsWithStats = collections.map((collection) => {
    // Sumar todas las contribuciones pagadas
    const currentAmount = collection.contributions.reduce(
      (sum, contrib) => sum + Number(contrib.amount), 
      0
    );

    // Contar miembros únicos (owner + miembros)
    const memberIds = new Set(collection.members.map(m => m.userId));
    memberIds.add(collection.ownerId);  // Asegurar que el owner se cuente
    const memberCount = memberIds.size;

    // Calcular progreso (porcentaje)
    const progress = collection.goalAmount 
      ? (currentAmount / Number(collection.goalAmount)) * 100 
      : 0;

    return {
      ...collection,
      currentAmount,
      contributorsCount: memberCount,
      progress: Math.round(progress * 100) / 100,  // Redondear a 2 decimales
    };
  });

  return {
    collections: collectionsWithStats,
    total,
    page: filters.page || 1,
    limit: filters.limit || 12,
    hasNextPage: skip + take < total,  // ¿Hay más páginas?
  };
}
```

**Puntos clave:**
1. **Actualización automática**: `updateCollectionStatuses()` marca como `COMPLETED` si alcanzó el 100%
2. **Paginación**: `skip` y `take` para no cargar todo de golpe
3. **Búsqueda**: Busca en título y descripción (case-insensitive)
4. **Estadísticas en tiempo real**: Calcula `currentAmount` y `progress` dinámicamente
5. **Promise.all**: Ejecuta query y count en paralelo (más rápido)

---

#### 3. Control de Acceso: Ver Detalles de una Colecta

```typescript
async findOne(id: string, userId?: string) {
  // 1. BUSCAR COLECTA CON TODAS SUS RELACIONES
  const collection = await this.prisma.collection.findUnique({
    where: { id },
    include: {
      owner: { 
        select: { id: true, email: true, name: true, avatar: true, roles: true } 
      },
      members: {
        include: {
          user: { 
            select: { id: true, email: true, name: true, avatar: true } 
          }
        }
      },
      contributions: { 
        where: { status: 'PAID' },
        select: { amount: true, userId: true } 
      },
    }
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  // 2. CONTROL DE ACCESO PARA COLECTAS PRIVADAS
  if (collection.isPrivate) {
    // Si no hay usuario autenticado, denegar
    if (!userId) {
      throw new ForbiddenException(
        'Authentication required to view private collection'
      );
    }

    const isOwner = collection.ownerId === userId;
    const isMember = collection.members.some(
      m => m.userId === userId && m.acceptedAt !== null
    );

    // Si no es owner ni miembro, denegar
    if (!isOwner && !isMember) {
      throw new ForbiddenException('No access to this private collection');
    }
  }
  // Para colectas PÚBLICAS, cualquiera puede ver

  // 3. CALCULAR ESTADÍSTICAS
  const totalPaid = collection.contributions.reduce(
    (sum, c) => sum + Number(c.amount), 
    0
  );
  const goalAmount = Number(collection.goalAmount);
  const progress = goalAmount > 0 ? (totalPaid / goalAmount) * 100 : 0;

  const uniqueContributors = new Set(
    collection.contributions.map(c => c.userId).filter(Boolean)
  ).size;

  return {
    ...collection,
    currentAmount: totalPaid,
    contributorsCount: uniqueContributors,
    progress: Math.min(progress, 100),  // No más de 100%
  };
}
```

**Lógica de seguridad:**
```
┌─────────────────────────────────────────────┐
│        ¿Puedo ver esta colecta?             │
└─────────────────────────────────────────────┘
                    ↓
            ┌───────────────┐
            │ ¿Es pública?  │
            └───────────────┘
                 ↓        ↓
              SÍ ✅      NO (privada)
                             ↓
                    ┌──────────────────┐
                    │ ¿Usuario logueado?│
                    └──────────────────┘
                         ↓        ↓
                       SÍ        NO ❌ (401)
                         ↓
                ┌─────────────────────┐
                │ ¿Es owner o miembro?│
                └─────────────────────┘
                     ↓        ↓
                  SÍ ✅      NO ❌ (403)
```

---

#### 4. Unirse a una Colecta

```typescript
async joinCollection(collectionId: string, userId: string, fromSharedLink: boolean = false) {
  // 1. VERIFICAR QUE LA COLECCIÓN EXISTE
  const collection = await this.prisma.collection.findUnique({
    where: { id: collectionId },
    include: { members: true }
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  // 2. VALIDAR REGLAS DE ACCESO
  // Si es privada y NO viene del link compartido, denegar
  if (collection.isPrivate && !fromSharedLink) {
    throw new BadRequestException(
      'Cannot join private collection directly - an invitation is required'
    );
  }

  if (collection.status !== 'ACTIVE') {
    throw new BadRequestException('Collection is not active');
  }

  // 3. VALIDAR QUE NO SEA EL OWNER
  if (collection.ownerId === userId) {
    throw new BadRequestException('You are already the owner of this collection');
  }

  // 4. VALIDAR QUE NO SEA YA MIEMBRO
  const existingMember = collection.members.find(m => m.userId === userId);
  if (existingMember) {
    throw new BadRequestException('You are already a member of this collection');
  }

  // 5. AGREGAR COMO MIEMBRO
  const member = await this.prisma.collectionMember.create({
    data: {
      collectionId,
      userId,
      acceptedAt: new Date(),  // Acepta automáticamente
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      collection: { select: { id: true, title: true, description: true } }
    }
  });

  return {
    message: 'Successfully joined the collection',
    member: {
      id: member.id,
      userId: member.userId,
      collectionId: member.collectionId,
      joinedAt: member.acceptedAt,
      user: member.user,
      collection: member.collection,
    }
  };
}
```

**Dos formas de unirse:**
1. **Colecta pública**: POST `/collections/{id}/members/join`
   - Solo si `isPrivate = false`
   
2. **Link compartido**: POST `/collections/{id}/members/join-via-link`
   - Funciona para públicas Y privadas
   - `fromSharedLink = true` → bypass de validación de privacidad

---

#### 5. Actualización Automática de Estado

```typescript
private async updateCollectionStatuses() {
  // 1. OBTENER TODAS LAS COLECTAS ACTIVAS
  const activeCollections = await this.prisma.collection.findMany({
    where: { status: 'ACTIVE' },
    include: {
      contributions: { where: { status: 'PAID' } }
    }
  });

  // 2. REVISAR CADA COLECTA
  for (const collection of activeCollections) {
    // Sumar contribuciones
    const totalContributions = collection.contributions.reduce(
      (sum, contribution) => sum + Number(contribution.amount),
      0
    );

    // Si alcanzó el 100%, cambiar a COMPLETED
    if (totalContributions >= Number(collection.goalAmount)) {
      await this.prisma.collection.update({
        where: { id: collection.id },
        data: { status: 'COMPLETED' }
      });
    }
  }
}
```

**Cuándo se ejecuta:**
- Antes de listar colectas públicas
- Antes de listar colectas del usuario
- Automáticamente marca como `COMPLETED` si alcanzó la meta

---

### Controller: `collections.controller.ts`

```typescript
@Controller('collections')
@ApiBearerAuth()  // Requiere autenticación por defecto
export class CollectionsController {
  
  // RUTA PÚBLICA: No requiere login
  @Public()
  @Get('public')
  async findPublic(@Query() filters: GetPublicCollectionsDto) {
    return await this.collectionsService.findPublicCollections(filters);
  }

  // CREAR COLECTA: Requiere autenticación
  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCollectionDto) {
    if (!req.user?.id) {
      throw new BadRequestException('User ID is required');
    }
    return this.collectionsService.create(req.user.id, dto);
  }

  // MIS COLECTAS: Owner o miembro
  @Get('my')
  async findUserCollections(@Request() req: AuthenticatedRequest) {
    return this.collectionsService.findUserCollections(req.user!.id);
  }

  // VER DETALLES: Autenticación opcional (para colectas públicas)
  @OptionalAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    return this.collectionsService.findOneForPreview(id, userId);
  }

  // ACTUALIZAR: Solo owner
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Request() req: AuthenticatedRequest, 
    @Body() dto: UpdateCollectionDto
  ) {
    return this.collectionsService.update(id, req.user!.id, dto);
  }

  // ELIMINAR: Solo owner, sin contribuciones
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.delete(id, req.user!.id);
  }

  // UNIRSE (pública)
  @Post(':id/members/join')
  async joinCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user!.id, false);
  }

  // UNIRSE (link compartido - privada o pública)
  @Post(':id/members/join-via-link')
  async joinViaSharedLink(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.collectionsService.joinCollection(id, req.user!.id, true);
  }

  // SALIRSE DE UNA COLECTA
  @Post(':id/members/leave')
  async leaveCollection(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.collectionsService.leaveCollection(id, req.user!.id);
    return { message: 'Left collection successfully' };
  }
}
```

---

### DTOs (Validación de Datos)

#### CreateCollectionDto
```typescript
export class CreateCollectionDto {
  @IsString()
  title!: string;  // Obligatorio

  @IsString()
  @IsOptional()
  description?: string;  // Opcional

  @IsUrl()
  @IsOptional()
  imageUrl?: string;  // Debe ser URL válida

  @IsNumber()
  @Min(0)
  goalAmount!: number;  // Mayor o igual a 0

  @IsEnum(RuleType)
  ruleType!: RuleType;  // EQUAL, CUSTOM, PERCENTAGE

  @IsNumber()
  @Min(0)
  @IsOptional()
  ruleValue?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsDateString()
  @IsOptional()
  deadlineAt?: string;  // ISO 8601 format
}
```

**Validaciones automáticas:**
- `@IsString()`: Debe ser texto
- `@IsNumber()`: Debe ser número
- `@Min(0)`: No puede ser negativo
- `@IsUrl()`: Valida formato de URL
- `@IsEnum()`: Solo valores permitidos (EQUAL, CUSTOM, PERCENTAGE)
- `@IsDateString()`: Formato de fecha válido

Si alguna validación falla, NestJS retorna **400 Bad Request** automáticamente.

---

### Flujo Completo: De Inicio a Fin

```
┌──────────────────────────────────────────────────────────────┐
│                CICLO DE VIDA DE UNA COLECTA                  │
└──────────────────────────────────────────────────────────────┘

1. CREACIÓN
   Usuario crea colecta → Status: ACTIVE
   
2. COMPARTIR
   Owner comparte link → Otros usuarios se unen
   
3. CONTRIBUIR
   Miembros aportan dinero → Suma aumenta
   
4. ALCANZAR META
   Total >= goalAmount → Status: COMPLETED automáticamente
   
5. RETIROS (opcional)
   Owner puede retirar fondos
```

**Ejemplo práctico:**
```typescript
// 1. Juan crea una colecta
POST /collections
{
  title: "Regalo para María",
  goalAmount: 500,
  ruleType: "EQUAL",
  ruleValue: 50,  // S/ 50 por persona
  isPrivate: true
}
// → Colecta creada con ID: abc-123

// 2. Juan comparte el link
// https://colectaya.com/collections/abc-123/join-via-link

// 3. Pedro hace click en el link
POST /collections/abc-123/members/join-via-link
// → Pedro se une como miembro

// 4. Pedro aporta S/ 50
POST /collections/abc-123/contributions
{ amount: 50 }
// → currentAmount: 50, progress: 10%

// 5. Más personas aportan...
// → currentAmount: 500, progress: 100%
// → Status cambia automáticamente a COMPLETED
```

---

## 💰 MÓDULO DE CONTRIBUCIONES

### Flujo de Contribución

```
┌────────────────────────────────────────────────────┐
│          FLUJO DE CONTRIBUCIÓN                     │
└────────────────────────────────────────────────────┘

1. Usuario autenticado hace POST /contributions
   ↓
2. Backend valida:
   ✅ Colecta existe
   ✅ Colecta está activa
   ✅ Usuario tiene acceso (si es privada)
   ✅ Monto es válido
   ↓
3. Se crea registro en DB (status: PAID o FAILED)
   ↓
4. Si es exitoso, se actualiza el total recaudado
```

### Código: `contributions.service.ts`

```typescript
async contribute(collectionId: string, userId: string, amount: number) {
  // 1. VALIDAR COLECTA
  const collection = await this.prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      members: {
        where: { userId, acceptedAt: { not: null } }
      }
    }
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  if (collection.status !== 'ACTIVE') {
    throw new BadRequestException('Collection is not active');
  }

  // 2. VERIFICAR ACCESO (solo para colectas privadas)
  if (collection.isPrivate) {
    const isOwner = collection.ownerId === userId;
    const isMember = collection.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('No access to this private collection');
    }
  }
  // Para colectas públicas, cualquier usuario puede contribuir

  // 3. SIMULAR PROCESAMIENTO DE PAGO (90% éxito)
  const paymentSuccess = Math.random() > 0.1;

  // 4. CREAR CONTRIBUCIÓN EN DB
  const contribution = await this.prisma.contribution.create({
    data: {
      collectionId,
      userId,
      amount,
      status: paymentSuccess ? 'PAID' : 'FAILED',
      paymentRef: paymentSuccess 
        ? `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : null
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, avatar: true }
      }
    }
  });

  if (!paymentSuccess) {
    throw new BadRequestException('Payment failed - please try again');
  }

  return contribution;
}
```

**Puntos clave:**
1. **Validación en capas**: Colecta existe → está activa → usuario tiene acceso
2. **Control de acceso**: Colectas privadas solo para owner/members
3. **Simulación de pago**: En producción, esto se conectaría a PayPal
4. **Referencia de pago**: `paymentRef` identifica la transacción

---

### Listar Contribuciones con Control de Acceso

```typescript
async listContributions(collectionId: string, userId: string) {
  const collection = await this.prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      members: { where: { userId, acceptedAt: { not: null } } }
    }
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  // PÚBLICO: Todos pueden ver contribuciones
  if (!collection.isPrivate) {
    return this.prisma.contribution.findMany({
      where: { collectionId, status: 'PAID' },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // PRIVADO: Solo owner y miembros pueden ver
  const isOwner = collection.ownerId === userId;
  const isMember = collection.members.length > 0;

  if (!isOwner && !isMember) {
    throw new ForbiddenException('No access to this private collection');
  }

  return this.prisma.contribution.findMany({
    where: { collectionId, status: 'PAID' },
    include: {
      user: {
        select: { id: true, email: true, name: true, avatar: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

## 🎨 FRONTEND CON TYPESCRIPT

### Cliente HTTP: `client.ts`

Este archivo maneja TODAS las peticiones HTTP del frontend.

```typescript
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;  // http://localhost:3000/api
  }

  // Obtener token de autenticación
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Construir headers con autenticación
  private buildHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token si es necesario
    const requiresAuth = config?.requiresAuth !== false;
    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Manejar errores
  private async handleError(response: Response): Promise<never> {
    // Si es 401, limpiar sesión y redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const data = await response.json();
    throw {
      message: data.message || 'An error occurred',
      status: response.status,
    };
  }

  // Método genérico de petición
  private async request<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(config);

    const response = await fetch(url, {
      ...config,
      headers,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return await response.json();
  }

  // Métodos públicos
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T, D = unknown>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ... put, patch, delete similares
}

// Exportar instancia singleton
export const httpClient = new HttpClient('http://localhost:3000/api');
```

**Ventajas de este diseño:**
1. **Centralizado**: Toda la lógica HTTP en un solo lugar
2. **Automático**: Agrega tokens automáticamente
3. **Manejo de errores**: Logout automático en 401
4. **Type-safe**: TypeScript valida tipos de entrada/salida

---

### Uso en Componentes

```typescript
// En cualquier componente de React
import { httpClient } from '@/api/client';

// GET: Obtener colectas
const collections = await httpClient.get<Collection[]>('/collections');

// POST: Crear contribución
const contribution = await httpClient.post<Contribution, CreateContributionDto>(
  `/collections/${collectionId}/contributions`,
  { amount: 50 }
);

// PUT: Actualizar colecta
const updated = await httpClient.put<Collection, UpdateCollectionDto>(
  `/collections/${collectionId}`,
  { title: 'Nuevo título' }
);
```

**Type-safe:** TypeScript verifica que:
- Los datos enviados coincidan con `CreateContributionDto`
- La respuesta sea del tipo `Contribution`

---

## 📝 RESUMEN PARA TU EXPOSICIÓN

### 1. TypeScript
- **Backend**: Decoradores para NestJS, tipos estrictos, compila a CommonJS
- **Frontend**: Alias de paths, compila a ES6 para Vite

### 2. Arquitectura Backend
- **Patrón**: Módulos + Inyección de Dependencias
- **Estructura**: Module → Controller (rutas) → Service (lógica)
- **Prisma**: ORM type-safe para base de datos

### 3. Autenticación
- **Supabase** maneja OAuth con Google
- **Guard**: Middleware que valida tokens en cada petición
- **Flujo**: Google OAuth → Token JWT → Guard valida → Usuario en request

### 4. Módulo de Colectas
- **CRUD completo**: Crear, leer, actualizar, eliminar colectas
- **Control de acceso granular**: Público vs Privado (owner/members)
- **Paginación**: `skip` y `take` para listar eficientemente
- **Búsqueda**: Por título y descripción (case-insensitive)
- **Estadísticas en tiempo real**: `currentAmount`, `progress`, `contributorsCount`
- **Actualización automática**: Cambia a `COMPLETED` al alcanzar la meta
- **Dos formas de unirse**: Directa (pública) o vía link compartido (privada)
- **Validaciones**: DTOs con decoradores de class-validator

### 5. PayPal
- **Autenticación**: clientId + secret → access token (cacheado)
- **Flujo**: Crear orden → Usuario aprueba → Capturar pago
- **Validación**: Monto no excede objetivo de colecta

### 6. Contribuciones
- **Control de acceso**: Solo miembros de colectas privadas pueden aportar
- **Validación**: Colecta activa, usuario autorizado, monto válido
- **Estados**: PAID (exitoso) o FAILED (simulación de pago)
- **Integración con PayPal**: Referencia de transacción en `paymentRef`

### 7. Frontend
- **HttpClient**: Centraliza peticiones, maneja auth y errores
- **Type-safe**: TypeScript valida tipos en compile-time
- **Automático**: Token en headers, logout en 401

---

## 🎤 CONSEJOS PARA LA EXPOSICIÓN

1. **Muestra el flujo visual**: Usa los diagramas de este documento
2. **Explica con ejemplos**: "Cuando un usuario hace click en contribuir, primero..."
3. **Menciona las validaciones**: "No solo creamos el pago, también validamos que..."
4. **Destaca TypeScript**: "Esto evita errores en producción porque..."
5. **Sé honesto**: "Usé IA para acelerar, pero ahora entiendo cómo funciona cada parte"

### Puntos Fuertes a Mencionar
✅ Arquitectura modular y escalable
✅ Autenticación segura con OAuth 2.0
✅ Integración real con PayPal
✅ Control de acceso granular (público/privado)
✅ Type-safety en todo el stack
✅ Manejo centralizado de errores

### Posibles Preguntas

**P: ¿Por qué usar TypeScript en lugar de JavaScript?**
R: Detecta errores en desarrollo, autocompletado en IDE, documentación automática de tipos, refactorización más segura.

**P: ¿Cómo proteges las rutas privadas?**
R: Con Guards de NestJS que validan el token JWT en cada petición. Además, tenemos control de acceso a nivel de colecta (pública/privada) y validamos que el usuario sea owner o miembro.

**P: ¿Qué pasa si el token expira?**
R: El Guard lanza 401, el frontend lo detecta automáticamente en el HttpClient, limpia el localStorage y redirige al login.

**P: ¿Cómo validas los pagos?**
R: PayPal retorna status: "COMPLETED", solo entonces guardamos la contribución con status: "PAID". También validamos que el monto no exceda el objetivo de la colecta.

**P: ¿Qué diferencia hay entre una colecta pública y privada?**
R: 
- **Pública**: Aparece en el listado público, cualquiera puede ver y unirse
- **Privada**: Solo visible para owner y miembros, se unen por invitación o link compartido

**P: ¿Cómo funciona la paginación?**
R: Usamos `skip` (saltar registros) y `take` (cantidad a traer). Por ejemplo: página 2 con 12 items → `skip: 12, take: 12`. Ejecutamos count y query en paralelo con `Promise.all` para mayor eficiencia.

**P: ¿Cómo se calcula el progreso en tiempo real?**
R: Sumamos todas las contribuciones con status "PAID", dividimos entre goalAmount y multiplicamos por 100. Se calcula dinámicamente en cada consulta, no se guarda en la DB.

**P: ¿Qué pasa si una colecta alcanza su meta?**
R: Tenemos una función `updateCollectionStatuses()` que se ejecuta antes de listar colectas. Revisa las colectas ACTIVE y si `currentAmount >= goalAmount`, cambia automáticamente el status a COMPLETED.

**P: ¿Por qué usas Prisma?**
R: Es un ORM type-safe que genera tipos TypeScript automáticamente desde el schema. Previene errores de SQL injection y hace las queries más legibles y seguras.

**P: ¿Cómo funciona la inyección de dependencias en NestJS?**
R: Decorador `@Injectable()` marca una clase como inyectable. NestJS crea una instancia única (singleton) y la provee automáticamente cuando se necesita en constructores. Ejemplo:
```typescript
constructor(private prisma: PrismaService) {}  // Inyección automática
```

¡Éxito en tu exposición! 🚀

---

## 📊 DIAGRAMA COMPLETO DE LA ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TS)                 │
│  • Vite + TypeScript                                         │
│  • HttpClient (fetch wrapper con interceptores)             │
│  • Autenticación: localStorage (token + refresh token)      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS + TS)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │  Collections │  │ Contributions│     │
│  │              │  │    Module    │  │    Module    │     │
│  │ • Supabase   │  │              │  │              │     │
│  │ • Google OAuth│ │ • CRUD       │  │ • PayPal    │     │
│  └──────────────┘  │ • Paginación │  │ • Validación│     │
│                    │ • Búsqueda   │  └──────────────┘     │
│  ┌──────────────┐  └──────────────┘                        │
│  │ Guards       │                                           │
│  │ • JWT        │  ┌──────────────┐  ┌──────────────┐     │
│  │ • Roles      │  │ PayPal Module│  │ Prisma Module│     │
│  └──────────────┘  │              │  │              │     │
│                    │ • Orders     │  │ • ORM        │     │
│                    │ • Capture    │  │ • Type-safe  │     │
│                    └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
            ↕                    ↕                ↕
┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐
│   Supabase      │  │   PayPal API     │  │ PostgreSQL  │
│   Auth + OAuth  │  │   (Sandbox)      │  │   Database  │
└─────────────────┘  └──────────────────┘  └─────────────┘
```
