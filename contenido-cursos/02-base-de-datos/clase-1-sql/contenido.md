# Clase 1: Fundamentos de SQL y Consultas

## Objetivos
- Comprender la estructura de bases de datos relacionales
- Aprender comandos SQL básicos (CRUD)
- Ejecutar queries efectivas en MySQL

## Contenido

### 1. ¿Qué es una Base de Datos Relacional?

Una base de datos relacional es un conjunto de tablas relacionadas entre sí mediante claves.

**Características:**
- **Tablas**: Organización de datos en filas y columnas
- **Relaciones**: Conexiones entre tablas
- **Integridad**: Reglas para mantener consistencia
- **ACID**: Atomicidad, Consistencia, Aislamiento, Durabilidad

### 2. Estructura Básica

```
Tabla: usuarios
┌─────────────┬───────────────┬──────────────┐
│ id (PK)     │ nombre        │ email        │
├─────────────┼───────────────┼──────────────┤
│ 1           │ Juan Pérez    │ juan@ex.com  │
│ 2           │ María García  │ maria@ex.com │
│ 3           │ Carlos López  │ carlos@ex.com│
└─────────────┴───────────────┴──────────────┘

PK = Primary Key (Clave Primaria)
```

### 3. Tipos de Datos en SQL

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| INT | Números enteros | 42, -10 |
| VARCHAR(50) | Texto variable | 'Juan' |
| DECIMAL(10,2) | Números decimales | 99.99 |
| DATE | Fechas | 2025-12-10 |
| BOOLEAN | Verdadero/Falso | TRUE, FALSE |
| TEXT | Texto largo | Párrafos enteros |

### 4. Comandos CRUD

#### CREATE (Crear)
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  fecha_creacion DATE DEFAULT CURDATE()
);

INSERT INTO usuarios (nombre, email) 
VALUES ('Juan', 'juan@example.com');
```

#### READ (Leer)
```sql
-- Obtener todos
SELECT * FROM usuarios;

-- Obtener específico
SELECT nombre, email FROM usuarios WHERE id = 1;

-- Con condiciones
SELECT * FROM usuarios WHERE nombre LIKE 'J%';
```

#### UPDATE (Actualizar)
```sql
UPDATE usuarios 
SET nombre = 'Juan Actualizado' 
WHERE id = 1;
```

#### DELETE (Eliminar)
```sql
DELETE FROM usuarios WHERE id = 1;
```

### 5. Queries Avanzadas

#### WHERE (Filtrado)
```sql
-- Igual a
SELECT * FROM usuarios WHERE id = 1;

-- Mayor que
SELECT * FROM usuarios WHERE id > 5;

-- Entre
SELECT * FROM usuarios WHERE id BETWEEN 1 AND 10;

-- En lista
SELECT * FROM usuarios WHERE id IN (1, 3, 5);

-- Contiene
SELECT * FROM usuarios WHERE nombre LIKE '%Juan%';
```

#### ORDER BY (Ordenamiento)
```sql
-- Ascendente (por defecto)
SELECT * FROM usuarios ORDER BY nombre ASC;

-- Descendente
SELECT * FROM usuarios ORDER BY id DESC;

-- Múltiples columnas
SELECT * FROM usuarios ORDER BY apellido, nombre;
```

#### LIMIT (Paginación)
```sql
-- Primeros 10
SELECT * FROM usuarios LIMIT 10;

-- Del 10 al 20
SELECT * FROM usuarios LIMIT 10, 10;
```

#### JOIN (Relaciones)
```sql
-- INNER JOIN: Solo coincidencias
SELECT u.nombre, c.nombre 
FROM usuarios u
INNER JOIN cursos c ON u.id_curso = c.id;

-- LEFT JOIN: Todos de la izquierda
SELECT u.nombre, c.nombre 
FROM usuarios u
LEFT JOIN cursos c ON u.id_curso = c.id;
```

### 6. Funciones de Agregación

```sql
-- Contar
SELECT COUNT(*) FROM usuarios;

-- Suma
SELECT SUM(calificacion) FROM notas;

-- Promedio
SELECT AVG(calificacion) FROM notas;

-- Máximo/Mínimo
SELECT MAX(calificacion), MIN(calificacion) FROM notas;

-- Con agrupación
SELECT id_curso, COUNT(*) 
FROM usuarios 
GROUP BY id_curso;
```

## Práctica

### Actividad 1: Conectar a MySQL

```bash
# En terminal
mysql -u root -p
# Ingresar contraseña (vacía por defecto)

# Ver bases de datos
SHOW DATABASES;

# Usar la BD yati
USE yati;

# Ver tablas
SHOW TABLES;
```

### Actividad 2: Queries Básicas

```sql
-- Listar todos los usuarios
SELECT * FROM usuarios;

-- Contar usuarios
SELECT COUNT(*) FROM usuarios;

-- Usuarios activos
SELECT * FROM usuarios WHERE id_estado = 1;

-- Ordenar por nombre
SELECT * FROM usuarios ORDER BY nombre;
```

### Actividad 3: Queries Complejas

```sql
-- Estudiantes por curso
SELECT c.nombre, COUNT(u.id) as cantidad
FROM cursos c
LEFT JOIN usuarios u ON u.id_curso = c.id
GROUP BY c.id;

-- Calificaciones promedio
SELECT u.nombre, AVG(n.calificacion) as promedio
FROM usuarios u
LEFT JOIN notas n ON u.id = n.id_usuario
GROUP BY u.id
HAVING promedio > 70;
```

## Recursos

- [MySQL Oficial](https://www.mysql.com)
- [W3Schools SQL](https://www.w3schools.com/sql)
- [SQL Tutorial](https://www.sqltutorial.org)

## Próxima Clase

Clase 2: Normalización de Bases de Datos
