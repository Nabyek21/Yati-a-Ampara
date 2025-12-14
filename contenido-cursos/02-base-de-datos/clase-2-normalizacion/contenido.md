# Clase 2: Normalización de Bases de Datos

## Objetivos
- Entender qué es la normalización
- Aprender las formas normales
- Diseñar bases de datos eficientes

## Contenido

### 1. ¿Qué es la Normalización?

La normalización es un proceso para organizar datos en una base de datos de manera eficiente, eliminando redundancias y mejorando la integridad.

**Beneficios:**
- ✅ Reduce redundancia de datos
- ✅ Mejora integridad referencial
- ✅ Facilita mantenimiento
- ✅ Optimiza queries

### 2. Formas Normales

#### Primera Forma Normal (1FN)
**Regla**: Cada celda contiene un único valor (sin listas).

❌ **Mal:**
```
Tabla: estudiantes
┌─────┬──────────┬─────────────────────────┐
│ ID  │ Nombre   │ Cursos                  │
├─────┼──────────┼─────────────────────────┤
│ 1   │ Juan     │ Python, SQL, JavaScript │
└─────┴──────────┴─────────────────────────┘
```

✅ **Bien:**
```
Tabla: estudiante_curso
┌─────────────────┬──────────┐
│ id_estudiante   │ id_curso │
├─────────────────┼──────────┤
│ 1               │ 1        │
│ 1               │ 2        │
│ 1               │ 3        │
└─────────────────┴──────────┘
```

#### Segunda Forma Normal (2FN)
**Reglas**: 
- Cumple 1FN
- Todos los datos no-clave dependen de la clave primaria completa

❌ **Mal:**
```
Tabla: ordenes
┌────────┬──────────┬──────────────┬─────────────┐
│ id_ord │ id_prod  │ nombre_prod  │ cantidad    │
├────────┼──────────┼──────────────┼─────────────┤
│ 1      │ 5        │ Laptop       │ 2           │
└────────┴──────────┴──────────────┴─────────────┘
(nombre_prod no depende de id_orden, solo de id_prod)
```

✅ **Bien:**
```
Tabla: ordenes
┌────────┬──────────┬──────────┐
│ id_ord │ id_prod  │ cantidad │
├────────┼──────────┼──────────┤
│ 1      │ 5        │ 2        │
└────────┴──────────┴──────────┘

Tabla: productos
┌────────┬──────────────┐
│ id_prod│ nombre_prod  │
├────────┼──────────────┤
│ 5      │ Laptop       │
└────────┴──────────────┘
```

#### Tercera Forma Normal (3FN)
**Reglas**:
- Cumple 2FN
- Ningún dato no-clave depende de otro dato no-clave

❌ **Mal:**
```
Tabla: estudiantes
┌─────┬──────────┬───────────┬──────────┐
│ ID  │ Nombre   │ id_ciudad │ ciudad   │
├─────┼──────────┼───────────┼──────────┤
│ 1   │ Juan     │ 1         │ Quito    │
└─────┴──────────┴───────────┴──────────┘
(ciudad depende de id_ciudad, no de ID)
```

✅ **Bien:**
```
Tabla: estudiantes
┌─────┬──────────┬───────────┐
│ ID  │ Nombre   │ id_ciudad │
├─────┼──────────┼───────────┤
│ 1   │ Juan     │ 1         │
└─────┴──────────┴───────────┘

Tabla: ciudades
┌───────────┬──────────┐
│ id_ciudad │ nombre   │
├───────────┼──────────┤
│ 1         │ Quito    │
└───────────┴──────────┘
```

### 3. Diagrama Entidad-Relación (ER)

Ejemplo para sistema académico:

```
┌──────────────┐
│  Estudiantes │
├──────────────┤
│ id (PK)      │
│ nombre       │
│ email        │
│ id_ciudad(FK)├─────┐
└──────────────┘     │
                     │
        ┌────────────┘
        │
        ↓
    ┌──────────────┐
    │   Ciudades   │
    ├──────────────┤
    │ id (PK)      │
    │ nombre       │
    └──────────────┘

┌──────────────┐        ┌──────────┐
│   Cursos     │────────│Estudiantes
├──────────────┤(M:N)   │
│ id (PK)      │        │
│ nombre       │        │
└──────────────┘        └──────────┘
     ↑
     │ (1:N)
     │
┌────────────────────────┐
│ Estudiante_Curso       │
├────────────────────────┤
│ id_estudiante (FK, PK) │
│ id_curso (FK, PK)      │
│ calificacion           │
└────────────────────────┘
```

### 4. Relaciones entre Tablas

#### Uno a Uno (1:1)
```sql
-- Un estudiante tiene un carné
CREATE TABLE estudiantes (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE carnes (
  id INT PRIMARY KEY,
  numero VARCHAR(20) UNIQUE,
  id_estudiante INT UNIQUE,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id)
);
```

#### Uno a Muchos (1:N)
```sql
-- Un curso tiene muchos estudiantes
CREATE TABLE cursos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE estudiantes (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  id_curso INT,
  FOREIGN KEY (id_curso) REFERENCES cursos(id)
);
```

#### Muchos a Muchos (M:N)
```sql
-- Muchos estudiantes en muchos cursos
CREATE TABLE estudiantes (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE cursos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE estudiante_curso (
  id_estudiante INT,
  id_curso INT,
  calificacion DECIMAL(4,2),
  PRIMARY KEY (id_estudiante, id_curso),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id),
  FOREIGN KEY (id_curso) REFERENCES cursos(id)
);
```

### 5. Constraints (Restricciones)

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- UNIQUE: Valor único
  email VARCHAR(100) UNIQUE NOT NULL,
  
  -- NOT NULL: Obligatorio
  nombre VARCHAR(100) NOT NULL,
  
  -- DEFAULT: Valor por defecto
  estado VARCHAR(20) DEFAULT 'activo',
  
  -- CHECK: Validación
  edad INT CHECK (edad >= 18),
  
  -- FOREIGN KEY: Relación
  id_ciudad INT,
  FOREIGN KEY (id_ciudad) REFERENCES ciudades(id)
);
```

## Práctica

### Actividad 1: Analizar Tabla Existente

```sql
-- En la BD yati, analiza:
DESCRIBE usuarios;
DESCRIBE cursos;
DESCRIBE notas;

-- ¿Están normalizadas?
```

### Actividad 2: Crear Tabla Normalizada

```sql
-- Crear tabla de contactos normalizada
CREATE TABLE contactos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  id_ciudad INT,
  id_pais INT,
  FOREIGN KEY (id_ciudad) REFERENCES ciudades(id),
  FOREIGN KEY (id_pais) REFERENCES paises(id)
);
```

### Actividad 3: Query en Tabla Normalizada

```sql
-- Obtener nombre de estudiante, curso y calificación
SELECT 
  e.nombre as estudiante,
  c.nombre as curso,
  ec.calificacion
FROM estudiante_curso ec
JOIN estudiantes e ON ec.id_estudiante = e.id
JOIN cursos c ON ec.id_curso = c.id
ORDER BY e.nombre, c.nombre;
```

## Recursos

- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [Normalization Rules](https://www.guru99.com/database-normalization.html)

## Resumen

✅ Comprendimos la normalización de datos
✅ Aprendimos las tres formas normales
✅ Diseñamos bases de datos eficientes
✅ Creamos relaciones correctas

## Próxima Clase

Clase 3: Optimización de Queries
