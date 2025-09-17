# 🎯 ColectaYa

**Aplicación independiente de gestión colaborativa de fondos que permita organizar colectas, dividir gastos y gestionar ahorros compartidos de manera eficiente*

Proyecto desarrollado como parte del programa de estudios universitarios, utilizando tecnologías modernas y mejores prácticas de desarrollo.

---

## 📋 **Información General**

| Campo | Detalle |
|-------|---------|
| **Tipo** | Proyecto Universitario |
| **Arquitectura** | Monorepo (Frontend + Backend) |
| **Estado** | 🚧 En Desarrollo |
| **Documentación** | ✅ En proceso |

---

## 🏗️ **Arquitectura del Proyecto**

```
ColectaYa/
├── 📁 backend/          # API REST - NestJS + TypeScript
│   ├── src/             # Código fuente del backend
│   ├── test/            # Tests automatizados
│   └── README.md        # 📖 Documentación técnica del backend
├── 📁 frontend/         # Aplicación Web - [Por definir]
│   └── README.md        # 📖 Documentación técnica del frontend
└── README.md            # 📖 Este archivo - Overview del proyecto
```

---

## 🚀 **Inicio Rápido**

### **1. Clonar el Repositorio**
```bash
git clone [URL-del-repositorio]
cd ColectaYa
```

### **2. Setup Backend (API)**
```bash
cd backend
npm install
npm run start:dev
# 🌐 Backend corriendo en: http://localhost:3000
```

### **3. Setup Frontend (Web App)**
```bash
cd frontend
# [Instrucciones específicas del frontend - por definir]
```

---

## 🛠️ **Stack Tecnológico**

### **Backend - API REST**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | v11.0.1 | Framework para APIs REST |
| **TypeScript** | v5.7.3 | Lenguaje de programación |
| **Node.js** | v22+ | Runtime de JavaScript |
| **Jest** | v30+ | Framework de testing |

### **Frontend - Aplicación Web** _(En desarrollo)_
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Framework** | Por definir | Interface de usuario |
| **Estado** | 🚧 En desarrollo | Próximamente |


### **Base de Datos** _(Por implementar)_
- Por definir según necesidades del proyecto

### **DevOps & Herramientas**
- **Git** - Control de versiones
- **ESLint + Prettier** - Calidad y formato de código
- **VS Code** - Editor recomendado con configuración optimizada

---

## 📚 **Documentación Detallada**

### 🎯 **Para empezar a desarrollar:**

1. **Backend (API)**: 
   - 📖 Lee: [`backend/README.md`](./backend/README.md)
   - 🚀 Contiene: Setup, comandos, estructura, troubleshooting

2. **Frontend (Web)**:
   - 📖 Documentación: 🚧 **En desarrollo**
   - 🚀 Próximamente: Setup, componentes, deployment


### 🎓 **Para profesores/evaluadores:**
- **Overview general**: Este archivo (README principal)
- **Detalles técnicos**: READMEs específicos de cada módulo
---

## 🎯 **Funcionalidades del Proyecto**

---

## 🔧 **Configuración de Desarrollo**

### **Prerrequisitos**
- **Node.js** v18+ (recomendado v22+)
- **npm** v8+ o **yarn** v1.22+
- **Git** configurado
- **VS Code** (recomendado)

### **Variables de Entorno**
```bash
# Backend
cd backend
cp .env.example .env

# Frontend (en desarrollo)
cd frontend
# 🚧 Próximamente: Instrucciones de setup del frontend

```

### **Comandos Principales**

#### **Backend**
```bash
cd backend
npm run start:dev    # 🚀 Desarrollo con hot-reload
npm run build        # 🏗️ Compilar para producción
npm test            # 🧪 Ejecutar tests
npm run lint        # ✅ Verificar calidad de código
```

#### **Frontend** _(En desarrollo)_
```bash
cd frontend
# 🚧 Próximamente: Comandos del frontend
# npm run dev     # Desarrollo
# npm run build   # Compilar
# npm test        # Tests
```

---

## 🧪 **Testing y Calidad**

### **Backend**
- ✅ **Tests Unitarios**: Jest configurado
- ✅ **Tests E2E**: Supertest + Jest
- ✅ **Coverage**: Reportes automáticos
- ✅ **Linting**: ESLint + TypeScript
- ✅ **Formatting**: Prettier

### **Frontend** _(En desarrollo)_
- 🚧 **Tests**: Por configurar según framework elegido
- ⏳ **Setup**: Pendiente definir stack tecnológico

---

## 📁 **Estructura de Carpetas**

```
ColectaYa/
├── backend/                    # 🏗️ API REST
│   ├── src/                   # Código fuente
│   ├── test/                  # Tests automatizados
│   ├── dist/                  # Código compilado
│   ├── .vscode/               # Configuración VS Code
│   ├── package.json           # Dependencias NPM
│   └── README.md              # Docs técnicas del backend
├── frontend/                   # 🖥️ Aplicación Web (en desarrollo)
│   ├── src/                   # 🚧 Próximamente
│   ├── public/                # 🚧 Próximamente  
│   ├── package.json           # 🚧 Próximamente
│   └── README.md              # 🚧 Próximamente
├── docs/                      # 📚 Documentación adicional
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # 📖 Este archivo
```


## 🤝 **Contribuir al Proyecto**

### **Estándares de Código**
- ✅ Usar TypeScript estricto
- ✅ Seguir convenciones de ESLint
- ✅ Escribir tests para nuevas funcionalidades
- ✅ Documentar código complejo
- ✅ Commits descriptivos en español

---

## 📞 **Soporte y Contacto**

### **Documentación**
- **General**: Este README
- **Backend**: [`backend/README.md`](./backend/README.md)
- **Frontend**: [`frontend/README.md`](./frontend/README.md) _(próximamente)_

### **Issues Comunes**
- **Problemas de setup**: Revisar documentación específica del módulo
- **Errores de compilación**: Verificar versiones de Node.js y dependencias
- **Tests fallando**: Ejecutar `npm run build` antes de `npm test`

### **Recursos de Aprendizaje**
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Best Practices](https://www.conventionalcommits.org/)

---

## 📜 **Licencia y Créditos**

**Proyecto Universitario** - Desarrollado con fines educativos

### **Tecnologías Utilizadas**
- NestJS Framework - MIT License
- TypeScript - Apache License 2.0
- Node.js - MIT License

---
