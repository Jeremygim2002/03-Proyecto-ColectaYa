# 📊 ColectaYa - Documentación del Modelo de Datos

## 🎯 **Resumen Ejecutivo**

ColectaYa es una plataforma colaborativa de recaudación de fondos que permite a usuarios crear, participar y gestionar fondos comunitarios. El modelo de datos está diseñado para soportar múltiples escenarios: desde regalos grupales hasta emergencias médicas y proyectos familiares.

---

## 🏗️ **Arquitectura del Modelo de Datos**

### **📋 Entidades Principales**

| Entidad | Propósito | Relaciones |
|---------|-----------|------------|
| **User** | Usuarios del sistema (creadores/participantes) | 1:N con Fund, Participant, Contribution, Expense |
| **Fund** | Fondos de recaudación | N:1 con User (creador), 1:N con Participant, Contribution, Expense |
| **Participant** | Participación de usuarios en fondos | N:1 con User y Fund |
| **Contribution** | Aportes económicos a los fondos | N:1 con User y Fund |
| **Expense** | Gastos registrados en los fondos | N:1 con User y Fund |

---

## 🔗 **Diagrama de Relaciones**

```
    User (Creador)
         |
         | 1:N (createdFunds)
         ▼
       Fund ←──────────────┐
         |                 │
         | 1:N             │ N:1
         ▼                 │
   ┌─Participant           │
   │     |                 │
   │     | N:1             │
   │     ▼                 │
   │   User ────────────────┘
   │     |
   │     | 1:N
   │     ▼
   │ Contribution
   │     |
   │     | N:1
   │     ▼
   └───Fund
         |
         | 1:N
         ▼
      Expense
         |
         | N:1
         ▼
       User
```

---

## 📝 **Especificación de Entidades**

### 👤 **User (Usuarios)**

**Propósito**: Gestionar usuarios del sistema con autenticación y autorización.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Campos Clave**:
- `email`: Identificación única (constraint único)
- `role`: ADMIN | USER (gestión de permisos)
- `isActive`: Para desactivar usuarios sin borrar datos

**Relaciones**:
- `createdFunds`: Fondos que ha creado (1:N)
- `participations`: Fondos en los que participa (1:N)
- `contributions`: Contribuciones realizadas (1:N)
- `expenses`: Gastos registrados (1:N)

---

### 💰 **Fund (Fondos)**

**Propósito**: Representar objetivos de recaudación con metas, plazos y configuración.

```prisma
model Fund {
  id            Int        @id @default(autoincrement())
  title         String
  description   String?
  goalAmount    Decimal    @db.Decimal(10, 2)
  currentAmount Decimal    @default(0) @db.Decimal(10, 2)
  deadline      DateTime?
  status        FundStatus @default(DRAFT)
  isPublic      Boolean    @default(false)
  allowOpenJoin Boolean    @default(false)
  maxParticipants Int?
  creatorId     Int
}
```

**Estados del Fondo** (`FundStatus`):
- `DRAFT`: Borrador, aún no publicado
- `ACTIVE`: Activo, recibiendo contribuciones
- `PAUSED`: Pausado temporalmente
- `COMPLETED`: Meta alcanzada o fecha límite cumplida
- `CANCELLED`: Cancelado por el creador

**Configuración**:
- `isPublic`: Visibilidad pública o privada
- `allowOpenJoin`: Permite unirse sin invitación
- `maxParticipants`: Límite de participantes (opcional)

---

### 🤝 **Participant (Participantes)**

**Propósito**: Gestionar la participación de usuarios en fondos con permisos granulares.

```prisma
model Participant {
  id               Int               @id @default(autoincrement())
  status           ParticipantStatus @default(INVITED)
  joinedAt         DateTime?
  leftAt           DateTime?
  canAddExpenses   Boolean           @default(false)
  canEditFund      Boolean           @default(false)
  canInviteOthers  Boolean           @default(false)
  userId           Int
  fundId           Int
}
```

**Estados de Participación** (`ParticipantStatus`):
- `INVITED`: Invitado pero no ha respondido
- `JOINED`: Aceptó la invitación y participa
- `DECLINED`: Rechazó la invitación
- `LEFT`: Se retiró del fondo

**Sistema de Permisos**:
- `canAddExpenses`: Puede registrar gastos
- `canEditFund`: Puede modificar el fondo
- `canInviteOthers`: Puede invitar otros participantes

**Constraint Único**: `@@unique([userId, fundId])` - Un usuario solo puede participar una vez por fondo.

---

### 💵 **Contribution (Contribuciones)**

**Propósito**: Registrar aportes económicos con integración de pagos.

```prisma
model Contribution {
  id              Int                @id @default(autoincrement())
  amount          Decimal            @db.Decimal(10, 2)
  description     String?
  status          ContributionStatus @default(PENDING)
  paymentId       String?
  paymentMethod   String?
  paymentDetails  Json?
  contributedAt   DateTime?
  userId          Int
  fundId          Int
}
```

**Estados de Contribución** (`ContributionStatus`):
- `PENDING`: Pendiente de procesamiento
- `COMPLETED`: Contribución exitosa
- `FAILED`: Falló el procesamiento
- `REFUNDED`: Reembolsado

**Integración de Pagos**:
- `paymentId`: ID de pago externo (ej: MercadoPago)
- `paymentMethod`: Método usado (tarjeta, transferencia, efectivo)
- `paymentDetails`: Detalles adicionales (JSON flexible)

---

### 🧾 **Expense (Gastos)**

**Propósito**: Registrar y aprobar gastos del fondo con categorización y comprobantes.

```prisma
model Expense {
  id            Int             @id @default(autoincrement())
  title         String
  description   String?
  amount        Decimal         @db.Decimal(10, 2)
  category      ExpenseCategory
  receiptUrl    String?
  attachmentUrl String?
  isApproved    Boolean         @default(false)
  expenseDate   DateTime
  userId        Int
  fundId        Int
}
```

**Categorías de Gastos** (`ExpenseCategory`):
- `FOOD`: Comida y bebidas
- `TRANSPORT`: Transporte
- `MEDICAL`: Gastos médicos
- `EDUCATION`: Educación
- `UTILITIES`: Servicios básicos
- `EMERGENCY`: Emergencias
- `EVENT`: Eventos y celebraciones
- `EQUIPMENT`: Equipos y herramientas
- `OTHER`: Otros gastos

**Sistema de Aprobación**:
- `isApproved`: Control de gastos por el creador del fondo
- `receiptUrl`: Comprobante del gasto
- `attachmentUrl`: Documentación adicional

---

## 📈 **Índices y Optimización**

### **Índices Implementados**

| Tabla | Índices | Propósito |
|-------|---------|-----------|
| **users** | `[role]`, `[isActive]`, `[createdAt]`, `[lastLogin]`, `[role, isActive]` | Filtros de administración y consultas frecuentes |
| **funds** | `[creatorId]`, `[status]`, `[isPublic]`, `[deadline]`, `[createdAt]`, `[status, isPublic]` | Búsquedas y filtros por estado |
| **participants** | `[fundId]`, `[userId]`, `[status]`, `[joinedAt]` | Consultas de participación |
| **contributions** | `[fundId]`, `[userId]`, `[status]`, `[contributedAt]`, `[paymentId]` | Historial financiero |
| **expenses** | `[fundId]`, `[userId]`, `[category]`, `[isApproved]`, `[expenseDate]` | Gestión de gastos |

### **Queries Optimizadas**

```sql
-- Fondos activos públicos (usa índice compuesto)
SELECT * FROM funds 
WHERE status = 'ACTIVE' AND "isPublic" = true;

-- Contribuciones por usuario (usa índice simple)
SELECT * FROM contributions 
WHERE "userId" = $1 AND status = 'COMPLETED';

-- Gastos pendientes por categoría (usa índices múltiples)
SELECT * FROM expenses 
WHERE category = 'MEDICAL' AND "isApproved" = false;
```

---

## 🎯 **Casos de Uso Principales**

### **1. Creación de Fondo**
```typescript
// 1. Usuario crea un fondo
const fund = await prisma.fund.create({
  data: {
    title: "Regalo de Cumpleaños",
    goalAmount: 500.00,
    creatorId: userId,
    status: FundStatus.ACTIVE
  }
});

// 2. Se crea automáticamente como participante
await prisma.participant.create({
  data: {
    userId: userId,
    fundId: fund.id,
    status: ParticipantStatus.JOINED,
    canEditFund: true,
    canInviteOthers: true
  }
});
```

### **2. Contribución a Fondo**
```typescript
// 1. Crear contribución
const contribution = await prisma.contribution.create({
  data: {
    userId: userId,
    fundId: fundId,
    amount: 100.00,
    status: ContributionStatus.PENDING,
    paymentId: "mp_001"
  }
});

// 2. Actualizar monto del fondo tras pago exitoso
await prisma.fund.update({
  where: { id: fundId },
  data: {
    currentAmount: {
      increment: 100.00
    }
  }
});

// 3. Marcar contribución como completada
await prisma.contribution.update({
  where: { id: contribution.id },
  data: {
    status: ContributionStatus.COMPLETED,
    contributedAt: new Date()
  }
});
```

### **3. Registro y Aprobación de Gastos**
```typescript
// 1. Participante registra gasto
const expense = await prisma.expense.create({
  data: {
    userId: participantId,
    fundId: fundId,
    title: "Compra de regalo",
    amount: 480.00,
    category: ExpenseCategory.EQUIPMENT,
    receiptUrl: "https://receipt-url.com",
    expenseDate: new Date()
  }
});

// 2. Creador del fondo aprueba
await prisma.expense.update({
  where: { id: expense.id },
  data: { isApproved: true }
});
```

### **4. Dashboard Financiero**
```typescript
// Consulta compleja para dashboard
const fundAnalytics = await prisma.fund.findUnique({
  where: { id: fundId },
  include: {
    creator: true,
    participants: {
      where: { status: ParticipantStatus.JOINED }
    },
    contributions: {
      where: { status: ContributionStatus.COMPLETED }
    },
    expenses: {
      where: { isApproved: true }
    }
  }
});

// Cálculo de métricas
const totalContributed = fundAnalytics.contributions
  .reduce((sum, c) => sum + Number(c.amount), 0);

const totalExpenses = fundAnalytics.expenses
  .reduce((sum, e) => sum + Number(e.amount), 0);

const balance = totalContributed - totalExpenses;
const progressPercentage = (totalContributed / Number(fundAnalytics.goalAmount)) * 100;
```

---

## 🔒 **Seguridad y Validaciones**

### **Constraints de Integridad**
- ✅ **Emails únicos**: Un email por usuario
- ✅ **Participación única**: Un usuario por fondo
- ✅ **Relaciones válidas**: Todas las FK apuntan a registros existentes
- ✅ **Montos positivos**: Contribuciones y gastos > 0
- ✅ **Estados válidos**: Solo valores enum permitidos

### **Reglas de Negocio**
- ✅ **Creador automático**: El creador del fondo es participante por defecto
- ✅ **Permisos granulares**: Control fino de qué puede hacer cada participante
- ✅ **Aprobación de gastos**: Solo gastos aprobados afectan el balance
- ✅ **Estados coherentes**: Transiciones de estado validadas
- ✅ **Fechas lógicas**: `joinedAt` solo si status es JOINED

---

## 📊 **Métricas y Análisis**

### **KPIs del Sistema**
- **Fondos activos**: Cantidad de fondos en estado ACTIVE
- **Tasa de completion**: % de fondos que alcanzan su meta
- **Participación promedio**: Promedio de participantes por fondo
- **Contribución promedio**: Monto promedio por contribución
- **Tiempo de duración**: Tiempo promedio desde creación hasta completion

### **Queries Analíticas**
```sql
-- Top usuarios por contribuciones
SELECT u.name, COUNT(c.id) as contributions, SUM(c.amount) as total
FROM users u
JOIN contributions c ON u.id = c."userId"
WHERE c.status = 'COMPLETED'
GROUP BY u.id, u.name
ORDER BY total DESC;

-- Fondos más exitosos
SELECT f.title, f."goalAmount", f."currentAmount", 
       (f."currentAmount" / f."goalAmount" * 100) as completion_rate
FROM funds f
WHERE f.status = 'COMPLETED'
ORDER BY completion_rate DESC;

-- Categorías de gastos más frecuentes
SELECT e.category, COUNT(*) as frequency, AVG(e.amount) as avg_amount
FROM expenses e
WHERE e."isApproved" = true
GROUP BY e.category
ORDER BY frequency DESC;
```

---

## 🚀 **Consideraciones de Escalabilidad**

### **Optimizaciones Implementadas**
- ✅ **Índices estratégicos**: Basados en queries frecuentes
- ✅ **Paginación**: Para listados grandes
- ✅ **Connection pooling**: Gestión eficiente de conexiones
- ✅ **Tipos decimales**: Precisión en cálculos financieros
- ✅ **Soft deletes**: Preservación de datos históricos

### **Extensiones Futuras**
- 🔄 **Notificaciones**: Tabla para eventos y alertas
- 🔄 **Auditoría**: Log de cambios y actividad
- 🔄 **Archivos**: Gestión de documentos y media
- 🔄 **Reportes**: Vistas materializadas para analytics
- 🔄 **Multi-tenant**: Soporte para organizaciones

---

## 📋 **Scripts de Utilidad**

### **Comandos Prisma**
```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name "descripcion"

# Aplicar migraciones
npx prisma migrate deploy

# Poblar datos
npx prisma db seed

# Abrir Prisma Studio
npx prisma studio

# Validar schema
npx ts-node prisma/validate-schema.ts
```

### **Datos de Prueba**
```typescript
// Usuarios disponibles
const testUsers = [
  'admin@colectaya.com (ADMIN)',
  'maria.gonzalez@gmail.com (USER)',
  'carlos.rodriguez@hotmail.com (USER)',
  'ana.lopez@outlook.com (USER)',
  'diego.martinez@gmail.com (USER)',
  'sofia.torres@yahoo.com (USER)'
];

// Contraseña universal: password123
```

---

## 🎉 **Estado del Proyecto**

### ✅ **Completado (100%)**
- [x] Diseño completo del modelo de datos
- [x] Migración aplicada a PostgreSQL
- [x] Datos de prueba realistas
- [x] Validación de integridad
- [x] Documentación técnica
- [x] Scripts de utilidad
- [x] Optimizaciones de performance

### 🎯 **Listo para Semana 4**
El modelo de datos está **100% completo** y validado. Se puede proceder con confianza a implementar los módulos de negocio (FundModule, ContributionModule, etc.) en la **Semana 4** del plan maestro.

---

**Última actualización**: Septiembre 25, 2025  
**Versión del schema**: 2.0  
**Estado**: ✅ Producción Ready