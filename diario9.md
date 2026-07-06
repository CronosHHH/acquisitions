# Eslint and prettier combinado con CI/CD pipelines
> Para formatear el codigo y mantener un estilo consistente en todo el proyecto.

## Índice breve

- [Definiciones](#definiciones)
- [Montaje](#montaje)
- [Instalación y archivos](#instalación-y-archivos)
- [Scripts útiles](#scripts-útiles)

---

## Definiciones

Hay dos herramientas que suelen usarse juntas:

- ESLint para detectar errores, malas practicas y reglas de estilo.
- Prettier para dar formato automatico al codigo.

Se usan mucho porque reducen discusiones de estilo, hacen el codigo mas legible y ayudan a mantener consistencia en equipos grandes. Lo normal es instalarlas desde npm y apoyarse en configuraciones creadas por la comunidad o por presets muy usados.

Recursos de la comunidad:

- ESLint: [Documentacion oficial](https://eslint.org/docs/latest/), [Reglas](https://eslint.org/docs/latest/rules/), [Shareable configs](https://eslint.org/docs/latest/extend/shareable-configs)
- Prettier: [Documentacion oficial](https://prettier.io/docs/en/), [Opciones](https://prettier.io/docs/en/options.html), [Editor integration](https://prettier.io/docs/en/editors.html)

---

## ESLint

ESLint analiza el codigo JavaScript y encuentra errores antes de que lleguen a produccion. Ayuda a detectar variables sin usar, errores de sintaxis, patrones peligrosos y reglas de estilo del proyecto.

Se usa sobre todo ejecutando el linter desde la terminal o integrandolo en el editor de codigo. Tambien puede corregir algunas cosas automaticamente con la opcion de fix.

Cuando quieras usarlo en VS Code, instala la extension de ESLint y activa sus comandos desde la paleta con `Ctrl+Shift+P` buscando `>ESLint`. Asi puedes ejecutar acciones como arreglar problemas, validar archivos o aplicar correcciones automaticas sin salir del editor.

### Workflow de ESLint

El flujo de trabajo estandar en 2026 funciona asi:

#### Paso 1: Instalar la base oficial del lenguaje

En lugar de presets gigantescos de terceros, la tendencia actual impulsada por ESLint 9+ es usar directamente las configuraciones recomendadas oficiales de los lenguajes que uses.

#### Paso 2: El archivo hibrido (`eslint.config.js`)

Se crea un archivo de configuracion plano donde importas lo recomendado por la comunidad y, en el ultimo bloque, sobreescribes lo que a ti o a tu equipo os molesta. Un archivo moderno y limpio se ve asi:

```js
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier, // Apaga las reglas de ESLint que choquen con Prettier
	{
		// === AQUI VAN TUS REGLAS PROPIAS ===
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }], // Permitir solo console.warn y error
			'@typescript-eslint/no-explicit-any': 'warn', // No me bloquees el build por un 'any' temporal
			'prefer-const': 'error' // Obligatorio usar const si no cambia
		}
	}
);
```

Configuraciones comunes:

- `eslint.config.js` con `@eslint/js`.
- Reglas para variables no usadas, comillas, punto y coma y orden de imports.
- Presets de la comunidad como los de `airbnb` o `standard` en proyectos que ya quieren una base opinionada.

La comunidad aporta reglas, presets y ejemplos listos para copiar. Eso permite partir de una base probada en lugar de escribir todas las reglas desde cero.

Recursos utiles:

- [ESLint playground](https://eslint.org/play/)
- [Guia de configuracion](https://eslint.org/docs/latest/use/configure/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

## Prettier

Prettier formatea el codigo de forma automatica para que todos escriban con el mismo estilo. No busca tanto errores logicos, sino consistencia visual: sangrias, comillas, saltos de linea y ancho maximo de linea.

Se usa normalmente con un comando de formateo, con guardado automatico en el editor o integrado en el flujo del proyecto. Tambien puede revisar si el formato cumple con lo esperado.

Cuando quieras usarlo en VS Code, instala la extension de Prettier y abre la paleta con `Ctrl+Shift+P` buscando `>Prettier`. Desde ahi puedes formatear el documento, elegir el formatter por defecto o lanzar acciones rapidas.

### Workflow de Prettier

Con Prettier nunca te haces un preset desde cero. Prettier esta disenado para ser deliberadamente dogmatico, con muy pocas opciones configurables. Simplemente creas un archivo `.prettierrc` con 4 o 5 preferencias cosméticas basicas, como comas finales, comillas simples o uso de punto y coma, y dejas que haga su trabajo.

Configuraciones comunes:

- `.prettierrc` para definir reglas como `semi`, `singleQuote` y `printWidth`.
- `.prettierignore` para excluir archivos generados o dependencias.
- Integracion con ESLint usando `eslint-config-prettier` para evitar conflictos entre ambas herramientas.

La comunidad comparte presets y reglas comunes que ayudan a empezar rapido y a mantener un formato uniforme en proyectos distintos.

Recursos utiles:

- [Prettier playground](https://prettier.io/playground/)
- [Configuracion](https://prettier.io/docs/en/configuration.html)
- [Editor integrations](https://prettier.io/docs/en/editors.html)

---

## Montaje

En VS Code conviene instalar las extensiones de ESLint y Prettier cuando quieres que el editor te ayude en tiempo real con avisos, correcciones y formato automatico.

Tambien puedes acceder a sus comandos con `Ctrl+Shift+P` y buscando `>` seguido del nombre de la extension o la accion que necesitas. Por ejemplo, `>ESLint: Fix all auto-fixable Problems` o `>Prettier: Format Document`.

Eso ayuda a trabajar mas rapido porque no dependes solo de la terminal y puedes aplicar las reglas del proyecto mientras escribes.

---

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
