# 🚀 ColectaYa - Plataforma de Gestión Colaborativa de Fondos

**ColectaYa** es una aplicación web moderna diseñada para facilitar la gestión colaborativa de fondos y colectas grupal
## 📚 **API Documentation**

Una vez iniciado el servidor backend, la documentación interactiva está disponible en:

**🌐 Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### **Endpoints Principales**

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere auth)

#### Usuarios
- `GET /users` - Listar usuarios (paginado, búsqueda)
- `POST /users` - Crear usuario
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

## 📋 **Información General**

| Campo | Detalle |
|-------|---------|
| **Tipo** | Proyecto Universitario - Aplicación Web Completa |
| **Arquitectura** | Modular en capas (Frontend + Backend) |
| **Estado** | ✅ Backend funcional, 🚧 Frontend en desarrollo |
| **Documentación** | ✅ Completa con Swagger UI |
| **Autenticación** | ✅ JWT implementado |
| **Base de Datos** | ✅ PostgreSQL + Prisma ORM |

---

## 🌟 **Características Principales**

### ✅ **Implementado**
- **👥 Gestión de Usuarios**: Registro, autenticación y perfiles
- **🔐 Autenticación JWT**: Sistema seguro con tokens Bearer
- **📊 API REST**: Endpoints documentados con Swagger
- **🛡️ Seguridad**: Rate limiting, validación, headers seguros
- **📄 Paginación**: Consultas optimizadas con búsqueda y filtros
- **🗄️ Base de Datos**: PostgreSQL con Prisma ORM
- **📚 Documentación**: Swagger UI interactivo
- **🧪 Testing**: Jest configurado para pruebas

---

## 🏗️ **Arquitectura del Proyecto**

```
📦 ColectaYa
├── � Frontend (React/Next.js) - En desarrollo
└── 🛠️ Backend (NestJS) - ✅ Funcional
    ├── 🎯 Controllers (API Endpoints)
    ├── ⚙️ Services (Lógica de Negocio)
    ├── 🗄️ Prisma (ORM & Database)
    ├── 🛡️ Guards (Autenticación/Autorización)
    ├── � Interceptors (Logging/Response)
    ├── 📝 DTOs (Validación de Datos)
    └── 🧪 Tests (Unit/Integration/e2e)
```

### Pipeline de Requests (Backend)
```
📨 Request
↓ 🛡️ Helmet + CORS + Compression
↓ � ThrottlerGuard (Rate Limiting)
↓ 🚪 AuthGuard (JWT Verification)
↓ 🔍 LoggingInterceptor
↓ 🧪 ValidationPipe + DTOs
↓ 🎯 Controller
↓ ⚙️ Service
↓ 🗄️ Prisma + PostgreSQL
↓ � ResponseInterceptor
↓ 📤 Formatted Response
```

---

## 🚀 **Inicio Rápido**

### **Prerequisitos**
- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/Jeremygim2002/03-Proyecto-ColectaYa.git
cd ColectaYa
```

### **2. Setup Backend (API)**
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos

# Configurar base de datos
npx prisma db push
npx prisma generate

# Iniciar servidor de desarrollo
npm run start:dev
# 🌐 Backend corriendo en: http://localhost:3000
# 📚 Swagger UI en: http://localhost:3000/api-docs
```

---

## 🛠️ **Stack Tecnológico**

### **Backend - API REST ✅ Funcional**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | v11.0.1 | Framework para APIs REST |
| **TypeScript** | v5.7.3 | Lenguaje con tipado estático |
| **Node.js** | v18+ | Runtime de JavaScript |
| **PostgreSQL** | v14+ | Base de datos relacional |
| **Prisma** | v5.x | ORM para TypeScript |
| **JWT** | - | Autenticación y autorización |
| **bcrypt** | - | Hashing seguro de contraseñas |
| **Swagger** | - | Documentación de API |
| **Jest** | v30+ | Framework de testing |

### **Seguridad Implementada**
- **Helmet**: Headers HTTP seguros
- **CORS**: Configuración de recursos cruzados
- **Rate Limiting**: Prevención de ataques DDoS
- **JWT Authentication**: Tokens seguros con expiración
- **Validation Pipes**: Validación estricta de entrada

### **Base de Datos ✅ Implementada**
- **PostgreSQL** - Base de datos principal
- **Prisma ORM** - Gestión de esquemas y migraciones
- **Connection Pooling** - Optimización de conexiones
---

## 📚 **Documentación Detallada**

### 🎯 **Para empezar a desarrollar:**

1. **Backend (API)**: 
   - 📖 Lee: [`backend/README.md`](./backend/README.md)
   - 🚀 Contiene: Setup, comandos, estructura, troubleshooting
---

## 🔧 **Configuración de Desarrollo**

### **Prerrequisitos**
- **Node.js** v18+ (recomendado v22+)
- **npm** v8+ o **yarn** v1.22+
- **Git** configurado
- **VS Code** (recomendado)

## 🔧 **Configuración de Desarrollo**

### **Variables de Entorno**
```bash
# Backend (.env)
DATABASE_URL="postgresql://usuario:password@localhost:5432/colectaya_db"
JWT_SECRET="profe-pongame-20"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001"
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

### **Comandos Principales**

#### **Backend ✅ Funcional**
```bash
cd backend
npm run start:dev    # 🚀 Desarrollo con hot-reload
npm run start:debug  # 🐛 Modo debug
npm run build        # 🏗️ Compilar para producción
npm run start:prod   # 🚀 Ejecutar versión compilada
npm test            # 🧪 Tests unitarios
npm run test:e2e    # 🧪 Tests end-to-end
npm run test:cov    # 📊 Coverage report
npm run lint        # ✅ Verificar calidad de código

# Base de datos
npx prisma db push   # 🗄️ Aplicar cambios del schema
npx prisma studio   # 🎨 GUI de base de datos
npx prisma generate # 🔄 Generar cliente Prisma
```

## 📁 **Estructura de Carpetas**

```
ColectaYa/
├── backend/                   # 🏗️ API REST ✅ Funcional
│   ├── src/
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── dto/           # DTOs de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   ├── user/              # Módulo de usuarios
│   │   │   ├── dto/           # DTOs de usuarios
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   ├── common/            # Utilidades compartidas
│   │   │   ├── filters/       # Exception filters
│   │   │   ├── interceptors/  # Request/Response interceptors
│   │   │   └── pipes/         # Custom pipes
│   │   ├── prisma/            # Configuración de Prisma
│   │   ├── app.module.ts      # Módulo principal
│   │   └── main.ts           # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema de base de datos
│   │   └── migrations/       # Migraciones de DB
│   ├── test/                 # Tests e2e
│   ├── dist/                 # Código compilado
│   ├── .vscode/              # Configuración VS Code
│   ├── package.json          # Dependencias NPM
│   └── README.md             # Docs técnicas del backend
├── frontend/                   # 🖥️ Aplicación Web (en desarrollo)
│   ├── src/                   # 🚧 Próximamente
│   ├── public/                # 🚧 Próximamente  
│   ├── package.json           # 🚧 Próximamente
│   └── README.md              # 🚧 Próximamente                     
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # 📖 Este archivo
```

---

## 📜 **Licencia y Créditos**

**Proyecto Universitario** - Desarrollado con fines educativos

### **Información del Proyecto**
- **Desarrollador**: Jeremy Rosas Caparachin
- **Repositorio**: [03-Proyecto-ColectaYa](https://github.com/Jeremygim2002/03-Proyecto-ColectaYa)

### **Tecnologías y Licencias**
- **NestJS Framework** - MIT License
- **Prisma ORM** - Apache License 2.0  
- **TypeScript** - Apache License 2.0
- **Node.js** - MIT License
- **PostgreSQL** - PostgreSQL License

---

⭐ **Si te gusta este proyecto, ¡dale una estrella en GitHub!**

📚 **Para más información técnica detallada, consulta la documentación del backend en [`backend/README.md`](./backend/README.md)**

````
