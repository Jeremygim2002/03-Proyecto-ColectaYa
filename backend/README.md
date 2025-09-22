# �️ ColectaYa Backend - API REST

Backend API REST desarrollado con **NestJS** para la plataforma ColectaYa. Proporciona autenticación JWT, gestión de usuarios y una arquitectura modular escalable.

---

## 🎯 **Características Técnicas**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | v11.0.1 | Framework para APIs REST con decorators |
| **TypeScript** | v5.7.3 | Lenguaje tipado estático |
| **Node.js** | v18+ | Runtime de JavaScript |
| **PostgreSQL** | v14+ | Base de datos relacional |
| **Prisma** | v5.x | ORM con type safety |
| **JWT** | - | Autenticación stateless |
| **bcrypt** | - | Hashing seguro de contraseñas |
| **Swagger** | - | Documentación automática de API |
| **Jest** | v30+ | Framework de testing |

### 🛡️ **Seguridad Implementada**
- **Helmet**: Headers HTTP seguros
- **CORS**: Configuración de recursos cruzados  
- **Rate Limiting**: Prevención de ataques DDoS
- **JWT Authentication**: Tokens seguros con expiración
- **Validation Pipes**: Validación estricta de entrada
- **Password Hashing**: bcrypt con factor 12

---

## 🏗️ **Arquitectura del Proyecto**

### Pipeline de Requests
```
📨 HTTP Request
    ↓
🛡️  Middleware (Helmet + CORS + Compression)
    ↓
🚪  Guards (ThrottlerGuard → AuthGuard)
    ↓
🔍  Interceptors (LoggingInterceptor - before)
    ↓
🧪  Pipes (ValidationPipe + DTOs)
    ↓
🎯  Controller Method
    ↓
⚙️  Service (Business Logic)
    ↓
🗄️  Prisma Client → PostgreSQL
    ↓
🔍  Interceptors (ResponseInterceptor - after)
    ↓
🛠️  Exception Filters (si hay error)
    ↓
📤  JSON Response
```

### Estructura de Módulos
```
src/
├── auth/                      # 🔐 Autenticación
│   ├── dto/sign-in.dto.ts    # DTO para login
│   ├── auth.controller.ts     # /auth/login, /auth/profile
│   ├── auth.service.ts        # Lógica JWT + bcrypt
│   ├── auth.guard.ts         # Protección de rutas
│   ├── auth.module.ts        # Configuración del módulo
│   ├── constants.ts          # Constantes JWT
│   └── types.ts             # Interfaces centralizadas
├── user/                     # 👥 Gestión de Usuarios
│   ├── dto/                  # DTOs con validación
│   ├── user.controller.ts    # CRUD completo
│   ├── user.service.ts      # Lógica + Prisma
│   └── user.module.ts       # Configuración
├── common/                   # 🛠️ Utilidades
│   ├── filters/             # Exception filters
│   ├── interceptors/        # Logging + Response
│   └── pipes/               # Custom validation
├── prisma/                  # 🗄️ Base de Datos
│   └── prisma.service.ts    # Conexión a PostgreSQL
├── app.module.ts           # Módulo principal
└── main.ts                # Bootstrap + Swagger
```

---

## ⚡ **Quick Start**

### **1. Instalación**
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con configuración de PostgreSQL
```

### **2. Base de Datos**
```bash
# Aplicar schema a PostgreSQL
npx prisma db push

# Generar cliente de Prisma
npx prisma generate

# (Opcional) Abrir Prisma Studio
npx prisma studio
```
---

## 🚀 **Scripts de Desarrollo**

### **Desarrollo**
```bash
npm run start:dev     # Servidor con hot reload ⚡
npm run start:debug   # Modo debug con inspector 🐛
npm run start         # Servidor básico
```

### **Producción**
```bash
npm run build        # Compilar TypeScript → JavaScript
npm run start:prod   # Ejecutar versión compilada
```

### **Base de Datos**
```bash
npx prisma db push    # Aplicar schema.prisma → PostgreSQL
npx prisma generate   # Generar cliente TypeScript
npx prisma studio    # GUI para explorar datos
npx prisma migrate   # Crear migración
```

### **Testing**
```bash
npm test            # Tests unitarios
npm run test:watch  # Tests en modo watch
npm run test:cov    # Coverage report
npm run test:e2e    # Tests end-to-end
```

### **Calidad de Código**
```bash
npm run lint        # ESLint verificación
npm run format      # Prettier formato
```

---

## �️ **Base de Datos**

### **Schema Principal (Prisma)**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String   // Hasheado con bcrypt (factor 12)
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

### **Configuración de Conexión**
```env
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/colectaya_db"
```

---

## 🔐 **Autenticación**

### **Flujo JWT**
1. **Login**: `POST /auth/login` con email/password
2. **Verificación**: bcrypt.compare() con hash almacenado
3. **Token**: JWT con payload `{sub: userId, email, role}`
4. **Autorización**: Bearer token en header

---

## � **API de Usuarios**

### **Endpoints**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/users` | Listar usuarios (paginado + búsqueda) | ✅ |
| `POST` | `/users` | Crear nuevo usuario | ❌ |
| `GET` | `/users/:id` | Obtener usuario por ID | ✅ |
| `PUT` | `/users/:id` | Actualizar usuario | ✅ |
| `DELETE` | `/users/:id` | Eliminar usuario | ✅ |

---

## 📚 **Swagger Documentation**

### **Acceso a la Documentación**
- **URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Features**: Autorización JWT, ejemplos interactivos, schemas
- **Filosofía**: Mínima verbosidad, máxima funcionalidad
---

## ⚙️ **Variables de Entorno**

### **Configuración Requerida (.env)**
```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/colectaya_db"

# JWT
JWT_SECRET="profe-pongame-20"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV="development"

# Frontend
FRONTEND_URL="http://localhost:3001"

# Rate Limiting
THROTTLE_TTL=60000    # 60 segundos
THROTTLE_LIMIT=10     # 10 requests por TTL
```

---


## 🧪 **Testing**

### **Configuración de Tests**
```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Watch mode (desarrollo)
npm run test:watch
```

### **Estructura de Tests**
```
test/
├── app.e2e-spec.ts     # Tests de integración
└── jest-e2e.json       # Configuración Jest e2e

src/
├── app.controller.spec.ts   # Tests unitarios
└── **/*.spec.ts            # Tests por módulo
```

---

### **Configuraciones Especiales**

#### **Saltos de Línea (Windows)**
✅ **Resuelto automáticamente**:
- `.gitattributes` - Control de Git
- `.editorconfig` - Estandarización  
- `prettier.config` - `endOfLine: "lf"`

#### **VS Code Optimizado**
- ✅ Formateo automático al guardar
- ✅ ESLint integrado
- ✅ Debugging configurado
- ✅ Tasks predefinidas

---

## 🔄 **Flujo de Trabajo Recomendado**

### **Desarrollo Diario**
```bash
# Terminal 1 - Servidor
npm run start:dev

# Terminal 2 - Tests (opcional)
npm run test:watch

# Terminal 3 - Base de datos (opcional)
npx prisma studio
```

### **Antes de Commit**
```bash
npm run lint         # Verificar código
npm run format       # Formatear
npm test            # Tests completos
npm run build       # Verificar compilación
```

### **Deploy/Producción**
```bash
npm run build       # Compilar
npm run start:prod  # Probar producción local
```

---

## 📊 **Performance**

### **Optimizaciones Implementadas**
- **Connection Pooling**: Prisma gestiona conexiones eficientemente
- **Select Específicos**: Solo campos necesarios en queries
- **Paginación**: Offset/limit para grandes datasets
- **Índices DB**: En campos de búsqueda frecuente (email)
- **Compression**: Gzip en responses HTTP
- **Rate Limiting**: Prevención de abuso

---

📚 **Para información general del proyecto, consulta el [`README.md`](../README.md) principal**
