# 🚀 ColectaYa Backend

**API REST del proyecto ColectaYa desarrollada con NestJS + TypeScript**

Backend moderno y escalable para la plataforma de ColectaYa, construido con las mejores prácticas de desarrollo.

---

## 📋 **Información Técnica**

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **NestJS** | v11.0.1 | Framework principal para APIs REST |
| **TypeScript** | v5.7.3 | Lenguaje de programación tipado |
| **Node.js** | v22.19.0 | Runtime de JavaScript |
| **Jest** | v30.0.0 | Framework de testing |
| **ESLint** | v9.18.0 | Linter para calidad de código |
| **Prettier** | v3.4.2 | Formateador de código |

---

## 🛠️ **Configuración del Entorno**

### **Prerrequisitos**
- Node.js v18+ (recomendado v22+)
- npm v8+ o yarn v1.22+
- Git configurado
- VS Code (recomendado)

### **Instalación**
```bash
# Clonar el repositorio
git clone [URL-del-repo]
cd backend

# Instalar dependencias
npm install

# Verificar instalación
npm run build
npm test
```

---

## 🚀 **Scripts de Desarrollo**

### **Desarrollo**
```bash
# Servidor de desarrollo con hot-reload
npm run start:dev

# Servidor básico (sin watch)
npm run start
```

### **Producción**
```bash
# Compilar para producción
npm run build

# Ejecutar en modo producción
npm run start:prod
```

### **Testing**
```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests end-to-end
npm run test:e2e
```

### **Calidad de Código**
```bash
# Verificar y corregir con ESLint
npm run lint

# Formatear código con Prettier
npm run format
```

---

## 📁 **Estructura del Proyecto**

```
backend/
├── src/                    # Código fuente
│   ├── app.module.ts       # Módulo raíz
│   └── main.ts            # Punto de entrada
├── test/                  # Tests end-to-end
├── dist/                  # Código compilado (generado)
├── coverage/              # Reportes de coverage (generado)
├── .vscode/              # Configuración VS Code
│   ├── settings.json     # Settings del workspace
│   ├── tasks.json        # Tasks automatizadas
│   ├── launch.json       # Configuración debugging
│   └── extensions.json   # Extensiones recomendadas
├── .editorconfig         # Configuración de editor
├── .gitattributes        # Control de line endings
├── .prettierrc           # Configuración Prettier
├── eslint.config.mjs     # Configuración ESLint
└── package.json          # Dependencias y scripts
```

---

## 🔧 **Configuraciones Especiales**

### **Saltos de Línea (LF/CRLF)**
✅ **Problema resuelto** - Configuración automática para Windows:
- `.gitattributes` - Control de Git
- `.editorconfig` - Estandarización de editores  
- `prettier.config` - `endOfLine: "lf"`
- Git configurado: `core.autocrlf=false`

### **VS Code Optimizado**
- ✅ Formateo automático al guardar
- ✅ ESLint integrado
- ✅ Debugging configurado
- ✅ Tasks predefinidas (Ctrl+Shift+P > "Tasks")
- ✅ Extensiones recomendadas

---

## 🌐 **API Endpoints**
(Por implementar)
---

## 🧪 **Testing**

### **Estructura de Tests**
- **Unitarios**: `src/**/*.spec.ts`
- **E2E**: `test/**/*.e2e-spec.ts`
- **Coverage**: Configurado para reportes completos

### **Comandos de Testing**
```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:cov

# Tests específicos
npm test -- app.controller.spec.ts

# Tests en modo watch (desarrollo)
npm run test:watch
```

---

## 🔐 **Variables de Entorno**

```bash
# .env (crear archivo)
PORT=3000
NODE_ENV=development

# .env.production
NODE_ENV=production
PORT=8080
```

---


## 🚨 **Troubleshooting**

### **Problemas Comunes**

**1. Error de saltos de línea (CRLF/LF)**
```bash
# Ya está resuelto automáticamente
# Si aparece, ejecutar:
npm run format
```

**2. Error de dependencias**
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

**3. Puerto ocupado**
```bash
# Cambiar puerto en .env o:
PORT=3001 npm run start:dev
```

**4. Tests fallan**
```bash
# Verificar que todo esté compilado
npm run build
npm test
```

---

## 🔄 **Flujo de Trabajo Recomendado**

1. **Desarrollo**:
   ```bash
   npm run start:dev    # Terminal 1 - Servidor
   npm run test:watch   # Terminal 2 - Tests
   ```

2. **Antes de commit**:
   ```bash
   npm run lint         # Verificar código
   npm run format       # Formatear
   npm test            # Tests completos
   ```

3. **Deploy**:
   ```bash
   npm run build       # Compilar
   npm run start:prod  # Probar producción
   ```

---

## 📚 **Recursos y Documentación**

- [NestJS Documentation](https://docs.nestjs.com/) - Documentación oficial
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Guía TypeScript
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing
- [ESLint Rules](https://eslint.org/docs/rules/) - Reglas de linting

---
