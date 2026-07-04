Combinar y montar -> eslint and prettier combinado con CI/CD pipelines
para formaer el codigo y mantener un estilo consistente en todo el proyecto

## Índice breve

- [Resumen](#resumen)
- [Instalación y archivos](#instalación-y-archivos)
- [Scripts útiles](#scripts-útiles)

---

Resumen:

- descargar extensiones de eslint y prettier en el editor de codigo (vscode)

Instalación (en el root del proyecto):

```bash
npm install eslint @eslint/js prettier eslint-config-prettier eslint-plugin-prettier -D
```

y crear:

- `eslint.config.js` (le añadi las normas que mas le gustaron al tio del tutorial)
- `.prettierrc` & `.prettierignore`

Archivos relacionados: [eslint.config.js](eslint.config.js), [.prettierrc](.prettierrc), [.prettierignore](.prettierignore)

Añadir scripts en el `package.json` para correr eslint y prettier desde la terminal

Scripts y uso (mostrar linting al ejecutar `npm run dev`):

- Ejecutar lint una vez antes de arrancar (actual): muestra errores al inicio

`package.json` ejemplo:

```json
"dev": "npx eslint . && node --watch src/index.js"
```

Además, para corregir errores automáticamente:

```bash
npm run lint:fix
```

Para formatear el código:

```bash
npm run format
```

Para comprobar formato consistente en todo el proyecto:

```bash
npm run format:check
```
