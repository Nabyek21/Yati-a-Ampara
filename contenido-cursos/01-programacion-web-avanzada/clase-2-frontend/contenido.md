# Clase 2: Frontend Moderno con Astro y Tailwind CSS

## Objetivos
- Aprender a construir interfaces modernas con Astro
- Dominar Tailwind CSS para diseño responsive
- Crear componentes reutilizables

## Contenido

### 1. ¿Qué es Astro?

Astro es un framework moderno que permite construir sitios web rápidos con JavaScript/TypeScript. Destaca por su enfoque en rendimiento y su capacidad de usar componentes de múltiples frameworks.

**Ventajas:**
- **Carga rápida**: HTML estático + interactividad controlada
- **Flexible**: Usa React, Vue, Svelte, etc. en la misma página
- **SEO amigable**: HTML renderizado en el servidor
- **Bajo JavaScript**: Solo carga JS necesario

### 2. Fundamentos de Tailwind CSS

Tailwind es un framework de utilidades CSS que permite construir diseños complejos sin escribir CSS personalizado.

**Clases básicas:**
```html
<!-- Espaciado -->
<div class="p-4 m-2">Contenido</div>

<!-- Colores -->
<div class="bg-blue-500 text-white">Azul</div>

<!-- Responsive -->
<div class="text-sm md:text-base lg:text-lg">Responsive</div>

<!-- Flexbox -->
<div class="flex gap-4 items-center">Items</div>
```

### 3. Estructura de un Proyecto Astro

```
proyecto/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── layouts/       # Layouts de página
│   ├── pages/         # Páginas (rutas automáticas)
│   ├── styles/        # Estilos globales
│   └── scripts/       # Scripts JavaScript
├── public/            # Archivos estáticos
├── astro.config.mjs   # Configuración
└── tailwind.config.cjs# Config Tailwind
```

### 4. Crear tu Primer Componente

```astro
---
// Componente Astro
export interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
  <h2 class="text-2xl font-bold mb-2">{title}</h2>
  <p class="text-sm opacity-90">{description}</p>
</div>
```

### 5. Layouts Responsive

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4 rounded shadow">
    <h3 class="font-bold">Tarjeta 1</h3>
  </div>
  <div class="bg-white p-4 rounded shadow">
    <h3 class="font-bold">Tarjeta 2</h3>
  </div>
  <div class="bg-white p-4 rounded shadow">
    <h3 class="font-bold">Tarjeta 3</h3>
  </div>
</div>
```

## Práctica

### Actividad 1: Crear un Componente de Tarjeta

1. Crea archivo: `src/components/Card.astro`
2. Define un componente que acepte title, description, image
3. Estiliza con Tailwind CSS

### Actividad 2: Página de Galería

1. Crea `src/pages/galeria.astro`
2. Usa el componente Card
3. Crea un grid responsive de 3 columnas

### Actividad 3: Formulario Responsive

1. Crea un formulario de contacto
2. Aplica diseño responsive
3. Validación básica con JavaScript

## Ejercicios de Código

```astro
---
// Ejemplo: Página con Tailwind
---

<main class="min-h-screen bg-gray-50">
  <header class="bg-white shadow sticky top-0">
    <nav class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Mi Sitio</h1>
      <ul class="flex gap-6">
        <li><a href="#" class="hover:text-blue-500">Inicio</a></li>
        <li><a href="#" class="hover:text-blue-500">Servicios</a></li>
        <li><a href="#" class="hover:text-blue-500">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <section class="max-w-6xl mx-auto px-4 py-12">
    <h2 class="text-4xl font-bold mb-8 text-center">Bienvenido</h2>
    <p class="text-gray-600 text-center max-w-2xl mx-auto">
      Aprende a construir interfaces modernas y rápidas.
    </p>
  </section>
</main>
```

## Recursos

- [Astro Docs](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Astro Examples](https://astro.build/showcase)

## Próxima Clase

Clase 3: Backend con Express.js y Node.js
