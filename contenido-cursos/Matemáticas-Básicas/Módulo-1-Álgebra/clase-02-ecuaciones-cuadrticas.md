# Clase 2: Ecuaciones Cuadráticas

## Introducción

En la clase anterior estudiamos ecuaciones lineales (grado 1). Ahora avanzaremos a **ecuaciones cuadráticas** (grado 2), que son más complejas pero también muy importantes.

---

## Tema 1: Introducción a ecuaciones cuadráticas

### Definición

Una ecuación cuadrática es una ecuación polinómica de grado 2. Su forma general es:

**ax² + bx + c = 0**

Donde:
- a, b, c son constantes
- a ≠ 0 (si a = 0, no sería cuadrática)
- x es la variable

### Ejemplos

1. **x² - 5x + 6 = 0** → a=1, b=-5, c=6
2. **2x² + 3x - 5 = 0** → a=2, b=3, c=-5
3. **x² - 9 = 0** → a=1, b=0, c=-9
4. **3x² + 2x = 0** → a=3, b=2, c=0

### ¿Por qué "cuadrática"?

El término "cuadrática" proviene de "quadratum", que significa cuadrado en latín. Porque el mayor exponente de la variable es 2 (x²).

---

## Tema 2: Métodos de resolución

### Método 1: Factorización

Si la ecuación se puede factorizar, es el método más rápido.

**Ejemplo 1:**
```
x² - 5x + 6 = 0

Buscamos dos números que:
- Multipliquen a 6
- Sumen a -5

Esos números son -2 y -3

Factorización: (x - 2)(x - 3) = 0

Por lo tanto:
x - 2 = 0  →  x = 2
o
x - 3 = 0  →  x = 3

Soluciones: x = 2, x = 3
```

**Ejemplo 2:**
```
x² - 9 = 0

Esto es una diferencia de cuadrados: a² - b² = (a+b)(a-b)

(x - 3)(x + 3) = 0

Soluciones: x = 3, x = -3
```

**Ejemplo 3:**
```
x² + 5x = 0

Sacar factor común:
x(x + 5) = 0

Soluciones: x = 0, x = -5
```

---

### Método 2: Fórmula Cuadrática

Cuando la factorización es difícil o imposible, usamos la **fórmula cuadrática**:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

**Explicación:**
- El símbolo ± significa que hay dos soluciones (suma y resta)
- La expresión bajo la raíz (b² - 4ac) se llama **discriminante**

#### Interpretación del discriminante

- Si **b² - 4ac > 0**: dos soluciones reales distintas
- Si **b² - 4ac = 0**: una solución real (raíz doble)
- Si **b² - 4ac < 0**: sin soluciones reales (soluciones complejas)

#### Ejemplo resuelto

```
Resolver: 2x² + 3x - 5 = 0

Identificamos: a = 2, b = 3, c = -5

Discriminante: b² - 4ac = 3² - 4(2)(-5) = 9 + 40 = 49

x = (-3 ± √49) / (2·2)
x = (-3 ± 7) / 4

Primera solución: x = (-3 + 7) / 4 = 4/4 = 1
Segunda solución: x = (-3 - 7) / 4 = -10/4 = -2.5

Soluciones: x = 1, x = -2.5
```

---

### Método 3: Completar el cuadrado

Este método transforma la ecuación en un cuadrado perfecto.

**Pasos:**
1. Aisla los términos con x
2. Divide por a (si a ≠ 1)
3. Completa el cuadrado sumando (b/2)² a ambos lados
4. Toma la raíz cuadrada
5. Resuelve para x

**Ejemplo:**
```
x² + 6x - 7 = 0

Paso 1: x² + 6x = 7

Paso 2: Completar cuadrado
       (6/2)² = 9
       
       x² + 6x + 9 = 7 + 9
       x² + 6x + 9 = 16

Paso 3: Escribir como cuadrado
       (x + 3)² = 16

Paso 4: Tomar raíz cuadrada
       x + 3 = ±4

Paso 5: Resolver
       x = -3 + 4 = 1  o  x = -3 - 4 = -7

Soluciones: x = 1, x = -7
```

---

## Tema 3: Aplicaciones

### Ejemplo 1: Problema de área

```
Un rectángulo tiene un ancho (x) metros y largo (x+3) metros.
Su área es 28 m².

Plantear y resolver:
x(x + 3) = 28
x² + 3x = 28
x² + 3x - 28 = 0

Factorizar: (x + 7)(x - 4) = 0
x = -7  o  x = 4

Como x es longitud, x = 4 metros

Ancho = 4 m, Largo = 7 m
Verificación: 4 × 7 = 28 ✓
```

### Ejemplo 2: Movimiento de proyectil

```
La altura h de un objeto lanzado es: h = -5t² + 20t + 10
donde t es tiempo en segundos, h en metros

¿Cuándo toca el suelo (h = 0)?

-5t² + 20t + 10 = 0
t² - 4t - 2 = 0

Usando fórmula cuadrática:
t = (4 ± √(16 + 8)) / 2 = (4 ± √24) / 2 = (4 ± 2√6) / 2
t = 2 ± √6

t ≈ 4.45 segundos (solución positiva)
```

---

## Tema 4: Gráficas

### Parábola

La gráfica de una ecuación cuadrática es una **parábola**.

**Características:**
- Vértice: punto más alto o más bajo
- Eje de simetría: línea vertical que pasa por el vértice
- Raíces: donde cruza el eje x
- Concavidad: hacia arriba (a > 0) o hacia abajo (a < 0)

### Ejemplo visual

Para y = x² - 5x + 6:
- Raíces: x = 2, x = 3 (donde y = 0)
- Vértice: x = 5/2 = 2.5
- Concavidad: hacia arriba (a = 1 > 0)

```
      y
      |     *
      |   *   *
      | *       *
      |*         *
    0 |___*___*___  x
      0   2   3
```

---

## Resumen

| Método | Ventajas | Desventajas |
|--------|----------|------------|
| Factorización | Rápido y simple | No siempre posible |
| Fórmula cuadrática | Siempre funciona | Más cálculos |
| Completar cuadrado | Enseña concepto | Tedioso |

---

## Ejercicios propuestos

Resuelve usando el método más apropiado:

1. x² + 5x + 4 = 0
2. x² - 16 = 0
3. 3x² - 7x + 2 = 0
4. x² - 2x - 8 = 0
5. 2x² + 8x = 0

---

## Próxima clase

- Sistemas de ecuaciones cuadráticas
- Inecuaciones
- Aplicaciones avanzadas

**Recursos complementarios:**
- Descarga: ejercicios-02.pdf
- Video: [Ecuaciones Cuadráticas](https://example.com)
