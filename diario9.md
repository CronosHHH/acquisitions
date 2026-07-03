Combinar y montar -> eslint and prettier combinado con CI/CD pipelines
para formaer el codigo y mantener un estilo consistente en todo el proyecto

en el root del proyecto:

- descargar extensiones de eslint y prettier en el editor de codigo (vscode)

npm install eslint @eslint/js prettier eslint-config-prettier eslint-plugin-prettier -D

y crear:
eslint.config.js //le añadi las normas que mas le gustaron al tio del tutorial)
.prettierrc & .prettierignore//idem

añadir scripts en el package.json para correr eslint y prettier desde la terminal

mostrar linting al ejecutar npm run dev:
Ejecutar lint una vez antes de arrancar (actual): muestra errores al inicio
package.json:
"dev": "npx eslint . && node --watch src/index.js"

ademas ahorra puede corregir errores automaticamente con:
npm run lint:fix
para formato mas bonito:
npm run format
para formato consistente en todo el proyecto:
npm run format:check
