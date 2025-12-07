# 📤 Guía: Subir Proyecto a GitHub

## ✅ Verificaciones Previas

### 1. Verificar que Git está configurado

```powershell
git config --global user.name
git config --global user.email
```

Si no aparece nada, configura:

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@example.com"
```

### 2. Verificar que tienes acceso a GitHub

```powershell
# Si usas SSH (recomendado)
ssh -T git@github.com

# Si usas HTTPS (con token)
git clone https://github.com/Nabyek21/Yati-a-Ampara.git --depth 1 temp-test
```

---

## 🚀 Opción 1: Usar Script Automático (RECOMENDADO)

### Paso 1: Ejecutar el script

```powershell
cd C:\Proyectos\SoaYatinya
.\upload-to-git.ps1
```

### Paso 2: Seguir las instrucciones

El script te pedirá:
1. ✅ Verifica cambios
2. ✅ Agregará todos los archivos
3. ✅ Te pedirá descripción del commit
4. ✅ Hará commit
5. ✅ Hará push a GitHub

---

## 🔧 Opción 2: Manual (Paso a Paso)

### Paso 1: Ver qué cambios hay

```powershell
cd C:\Proyectos\SoaYatinya
git status
```

### Paso 2: Agregar todos los cambios

```powershell
git add .
```

### Paso 3: Ver lo que se va a commitear

```powershell
git diff --cached --stat
```

### Paso 4: Hacer commit

```powershell
git commit -m "Agregar sistema de pesos configurables para calificaciones

- Nuevas tablas en BD: configuracion_pesos_actividades
- Nueva API REST: /api/pesos
- Tipos de actividades expandidos: 6 tipos
- Cálculo dinámico de promedio ponderado
- Documentación completa"
```

### Paso 5: Subir a GitHub

```powershell
git push origin master
```

---

## 📋 Buen Mensaje de Commit

**Estructura recomendada:**

```
Título (máximo 50 caracteres)

Descripción (detallada, con saltos de línea)
- Punto 1
- Punto 2
- Punto 3

Footer (si hay problemas cerrados)
Closes #123
```

**Ejemplo:**

```powershell
git commit -m "Implementar sistema de pesos configurables para calificaciones

CAMBIOS:
- Nueva tabla MySQL: configuracion_pesos_actividades
- Nuevo controlador: configPesosController.js
- 5 nuevas rutas REST en /api/pesos
- Función dinámicas de cálculo de promedio

MEJORAS:
- Promedio correcto: 17.5 (antes 680)
- Tipos expandidos: de 3 a 6
- Pesos configurables por sección
- Sin breaking changes

ARCHIVOS:
- Backend: 6 nuevos, 2 modificados
- Frontend: 3 modificados
- BD: 1 tabla nueva, scripts iniciales"
```

---

## ❌ Si Algo Sale Mal

### Error: "Remote rejected"

```powershell
# Significa que tu rama está atrasada
git pull origin master
git push origin master
```

### Error: "Permission denied"

```powershell
# Significa que no tienes permisos
# 1. Verifica que seas colaborador en GitHub
# 2. O usa SSH en lugar de HTTPS:

git remote set-url origin git@github.com:Nabyek21/Yati-a-Ampara.git
git push origin master
```

### Error: "File too large"

```powershell
# Algunos archivos son muy grandes
# Típicamente: node_modules, pnpm-lock.yaml

# Reversa cambios
git reset HEAD

# Agrega selectivamente
git add .gitignore
git add backend/src/
git add frontend/src/
git add QUICK_START.md
# etc.

git commit -m "mensaje"
git push origin master
```

### Quiero deshacer el último commit (ANTES de hacer push)

```powershell
# Opción 1: Deshacer commit pero mantener cambios
git reset --soft HEAD~1

# Opción 2: Deshacer todo
git reset --hard HEAD~1
```

### Quiero revertir cambios locales

```powershell
# Ver archivos modificados
git status

# Descartar cambios de un archivo
git restore archivo.js

# Descartar todos los cambios
git restore .
```

---

## 🔐 Configurar SSH (Opcional pero Recomendado)

Si no quieres ingresar contraseña cada vez:

### 1. Generar clave SSH

```powershell
ssh-keygen -t ed25519 -C "tu.email@example.com"
# Presiona Enter 3 veces (usa valores por defecto)
```

### 2. Copiar clave pública a GitHub

```powershell
# Copiar a portapapeles
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

# O mostrar en pantalla
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

### 3. Agregar en GitHub

1. Ve a GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Pega el contenido de la clave
4. Guarda

### 4. Cambiar origen a SSH

```powershell
git remote set-url origin git@github.com:Nabyek21/Yati-a-Ampara.git
```

---

## 📊 Ver Histórico de Cambios

### Ver últimos commits

```powershell
git log --oneline -10
```

### Ver cambios detallados del último commit

```powershell
git show HEAD
```

### Ver quién cambió cada línea

```powershell
git blame archivo.js
```

### Ver diferencias entre commits

```powershell
git diff commit1 commit2
```

---

## 🌳 Trabajar con Ramas (Avanzado)

### Ver ramas

```powershell
git branch -a
```

### Crear nueva rama

```powershell
git checkout -b feature/nueva-funcionalidad
```

### Cambiar de rama

```powershell
git checkout master
```

### Subir rama nueva

```powershell
git push origin feature/nueva-funcionalidad
```

### Mergear rama

```powershell
# 1. Cambiar a master
git checkout master

# 2. Mergear rama
git merge feature/nueva-funcionalidad

# 3. Subir
git push origin master
```

---

## ✅ Verificar Que Todo Subió Correctamente

### En línea de comandos

```powershell
# Ver últimos commits en remoto
git log --oneline -5 origin/master

# Verificar que estamos al día
git status
# Debe decir: "Your branch is up to date with 'origin/master'"
```

### En GitHub

1. Ve a: https://github.com/Nabyek21/Yati-a-Ampara
2. Verifica que ves los cambios recientes
3. Haz click en "commits" para ver el histórico
4. Busca tu último commit

---

## 🎓 Resumen Rápido

```powershell
# 1. Ver cambios
git status

# 2. Agregar todo
git add .

# 3. Commit
git commit -m "Descripción"

# 4. Push
git push origin master

# 5. Verificar
git log --oneline -3
```

---

## 📞 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Your branch is behind" | `git pull origin master` |
| "permission denied" | Configurar SSH o token |
| "nothing to commit" | No hay cambios, o ya están subidos |
| "detached HEAD" | `git checkout master` |
| "merge conflict" | Edita archivo, `git add .`, `git commit`, `git push` |

---

## 🚀 Siguiente Paso

Después de subir, puedes:

1. **Compartir con el equipo:**
   ```
   Envía el link: https://github.com/Nabyek21/Yati-a-Ampara
   ```

2. **Configurar protecciones de rama:**
   - Ve a Settings → Branches
   - Require pull request reviews
   - Require status checks to pass

3. **Configurar CI/CD:**
   - Agregar GitHub Actions
   - Tests automáticos
   - Deploy automático

---

**¿Necesitas ayuda? Revisa el error específico arriba o pregunta.** 🤝
