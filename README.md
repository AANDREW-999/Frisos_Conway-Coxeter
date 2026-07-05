# Frisos de Conway–Coxeter — herramienta interactiva

Aplicación web (HTML/CSS/JS puro, sin frameworks ni build tools) creada para apoyar
una exposición de Licenciatura en Matemáticas sobre **frisos de Conway–Coxeter**.

## ¿Qué incluye?

1. **Recurrencia de Lyness** — recrea el Ejemplo 2 del documento base: dados
   `x1, x2`, calcula `x3, x4, x5, x6, x7` con la regla
   `x_n = (1 + x_{n-1}) / x_{n-2}`, mostrando cada sustitución paso a paso y
   confirmando que el patrón regresa a `(x1, x2)` — periodo 5.
2. **Explorador de la cuadrícula** — reproduce el Ejemplo 1 del documento
   (friso numérico con periodo 6), con animación de construcción columna por
   columna y el dominio fundamental resaltado.
3. **Calculadora de diamante** — dado un diamante `(a, b, c, d)` con la regla
   `ad − bc = 1`, calcula el valor faltante a partir de los otros tres.
4. **Constructor libre** — cuadrícula editable para que el estudiante arme su
   propio friso y la aplicación valide cada diamante en vivo.

Toda la matemática implementada es exacta (se usan fracciones, no floats, para
evitar errores de redondeo) y se corresponde directamente con las reglas del
documento fuente (`ad - bc = 1` y `d = (1+bc)/a`).

## Estructura del proyecto

```
frisos-app/
├── index.html      # estructura y contenido de las 4 secciones
├── style.css       # diseño visual (tema "friso arquitectónico")
├── script.js       # toda la lógica matemática e interactividad
└── README.md
```

## Cómo usarlo

No requiere instalación ni dependencias. Basta con abrir `index.html` en
cualquier navegador, o servirlo con cualquier servidor estático:

```bash
# Opción 1: abrir directamente
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# Opción 2: servidor local (recomendado para evitar restricciones de módulos)
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## Desarrollo con GitHub Copilot

El proyecto está pensado para seguir extendiéndose con ayuda de Copilot en
VS Code. Ideas para continuar (ver `TODO` en `script.js`):

- Exportar el friso construido como imagen o PDF.
- Modo "triangulación de polígono" (los frisos de Conway–Coxeter están en
  biyección con triangulaciones de polígonos — buen siguiente tema).
- Guardar/cargar frisos personalizados en `localStorage`.

## Publicar en GitHub Pages

```bash
git remote add origin <URL_DE_TU_REPO>
git branch -M main
git push -u origin main
```

Luego, en GitHub → Settings → Pages → Source: rama `main`, carpeta `/root`.
La app queda disponible en `https://<usuario>.github.io/<repo>/`.
