# Clase 1: Introducción a Programación Web Avanzada

## Objetivos de Aprendizaje
- Comprender los fundamentos de la arquitectura web moderna
- Conocer los componentes principales de una aplicación web
- Familiarizarse con el stack tecnológico del curso

## Contenido

### 1. ¿Qué es una Aplicación Web Moderna?

Una aplicación web moderna es un software que se ejecuta en un navegador y utiliza tecnologías actuales para proporcionar una experiencia de usuario similar a las aplicaciones de escritorio.

**Características principales:**
- **Interactividad en tiempo real**: Cambios sin recargar la página
- **Sincronización de datos**: Actualización automática del contenido
- **Interfaz responsive**: Se adapta a cualquier dispositivo
- **Escalabilidad**: Puede manejar millones de usuarios

### 2. Arquitectura Cliente-Servidor

```
┌─────────────────┐
│    NAVEGADOR    │
│  (Frontend)     │
│ HTML/CSS/JS     │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   SERVIDOR      │
│  (Backend)      │
│ Node/Express    │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│   BASE DATOS    │
│    (MySQL)      │
└─────────────────┘
```

### 3. Componentes Principales

#### Frontend
- **HTML**: Estructura del contenido
- **CSS**: Estilos y diseño
- **JavaScript**: Interactividad y lógica

#### Backend
- **API REST**: Interfaz de comunicación
- **Base de Datos**: Almacenamiento de datos
- **Autenticación**: Seguridad y acceso

### 4. Stack Tecnológico del Curso

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Astro (framework moderno)
- Tailwind CSS (utility-first)
- Vite (bundler rápido)

**Backend:**
- Node.js (runtime JavaScript)
- Express.js (framework web)
- MySQL (base de datos)

**Herramientas:**
- Git (control de versiones)
- npm/pnpm (gestor de dependencias)
- Postman (testing de APIs)

## Práctica

### Actividad 1: Configurar el Entorno

1. Instalar Node.js v16+
2. Clonar el repositorio
3. Instalar dependencias: `npm install`
4. Verificar la instalación: `node --version`

### Actividad 2: Ejecutar la Aplicación

```bash
cd backend
npm start
```

Verificar en: http://localhost:3000

## Recursos

- [MDN Web Docs](https://developer.mozilla.org)
- [Node.js Documentación](https://nodejs.org)
- [Express.js](https://expressjs.com)

## Resumen

En esta clase aprendimos:
- ✅ Qué es una aplicación web moderna
- ✅ La arquitectura cliente-servidor
- ✅ Los componentes principales
- ✅ El stack tecnológico del curso

## Próxima Clase

Clase 2: Frontend con Astro y Tailwind CSS
