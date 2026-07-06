PRACTICAS - Construir y desplegar un API ESCALABLE

## Índice breve

- [Setup](#setup)
- [Inicializar proyecto y dependencias](#inicializar-proyecto-y-dependencias)
- [Estructura recomendada y archivos relacionados](#estructura-recomendada-y-archivos-relacionados)
- [Notas por archivo](#notas-por-archivo)

---

## Setup

- Neon para el database (PostgreSQL)
- ArcJet para seguridad
- Warp para comando y shipping tasks

---

## Inicializar proyecto y dependencias

//para el `package.json` que es el root de nuestra aplicacion
```bash
npm init -y
```

```bash
npm install express dotenv
```
---
- ## Express

Express es un framework ligero para crear aplicaciones web y APIs en Node.js. Nos da una base simple para definir rutas, middlewares y respuestas sin tener que construir todo desde cero.

Comandos básicos:

```bash
npm install express
npm run dev
node --watch src/index.js
```

¿Por qué usamos Express y no otro?

- Es simple y rápido para arrancar.
- Tiene una comunidad enorme y mucha documentación.
- Funciona muy bien para APIs pequeñas y medianas.
- Su estructura es clara y no te obliga a seguir una arquitectura pesada.

---
- ## dotenv

dotenv es un paquete que carga variables de entorno desde un archivo .env. Así evitamos poner secretos o configuraciones sensibles directamente en el código.

Comandos básicos:

```bash
npm install dotenv
```

Uso típico:

```js
import 'dotenv/config';
```

¿Por qué lo usamos?

- Separa la configuración del código.
- Facilita trabajar con distintos entornos: desarrollo, pruebas y producción.
- Ayuda a mantener credenciales y claves fuera del repositorio.

--- 

creo el `.gitignore` para ignorar `node_modules` y otros archivos innecesarios

En el [package.json](package.json)

- se cambia `"type": "module"` 

  - `type` define cómo Node.js interpreta los archivos JavaScript del proyecto. Le dice al runtime si debe tratar el código como módulos modernos o como módulos más clásicos.

  - Usamos `module` porque nos deja trabajar con `import` y `export`, que es la sintaxis actual y más limpia para organizar el código. Además, encaja mejor con proyectos modernos y con librerías recientes.

  - La otra alternativa más usada es `commonjs`. En ese modo se trabaja con `require` y `module.exports`, que fue el estándar durante mucho tiempo en Node.js y todavía aparece en muchos proyectos antiguos.

- se cambia el script `"test": "node index.js"` por `"dev": "node --watch index.js"`

  - porque por ahora no tenemos ningun script de tests, y queremos un script para correr el servidor en modo desarrollo.
  
  - el comando `--watch` es para que el servidor se reinicie automaticamente cuando se hagan cambios en el codigo

 

para correr el servidor en modo desarrollo, se ejecuta el comando:
```bash
npm run dev
```

## Estructura recomendada y archivos relacionados

creo `src` y los archivos de dentro
- `app.js` --> montar la aplicacion express con los middlewares y rutas correctas ([src/app.js](src/app.js))
- `server.js` --> levantar el servidor, implementar la logging y escuchar en el puerto correcto ([src/server.js](src/server.js))
- `index.js` --> punto de entrada de la aplicacion (importar `app` y `server` y ejecutar el servidor) ([src/index.js](src/index.js))
- `config` --> para todos los tipos de configuraciones ([src/config/](src/config/))
- `controllers` --> dentro del codigo fuente, los controladores manejan la logica de cada ruta e interactuan con la base de datos u otros servicios - model view controller paradigm del backend ([src/controllers/](src/controllers/))
- `middleware` --> funciones que se ejecutan antes de llegar a los controladores (son como logging functions), para validar datos, autenticar usuarios, etc. ([src/middleware/](src/middleware/))
- `models` --> para definir los modelos de datos ([src/models/](src/models/))
- `routes` --> para definir las rutas de la API y asociarlas con los controladores correspondientes ([src/routes/](src/routes/))

    TODOS ESTOS SON CONVENCIONES DE LA INDUSTRIA, NO SON OBLIGATORIOS, PERO SON RECOMENDADOS PARA MANTENER EL CODIGO ORGANIZADO Y FACIL DE ENTENDER

    services --> para funciones de utilidad
    utils --> para funciones de utilidad que no pertenecen a ningun modelo o controlador en particular
    validations --> para definir las validaciones de los datos de entrada
     
## Notas por archivo

en `app.js` 
- se importa `express` y se crea una instancia de la aplicacion express.
- en vez de establecer una `app.listen` le ponemos un endpoint para que responda a una solicitud GET en la raíz (`"/"`) y devuelva un mensaje de bienvenida.
- Exporta `default app` para que pueda ser importado en otros archivos (como `server.js`) y utilizado para levantar el servidor.

en `src/server.js`
- no tenemos la app real siendo enrutada, sino que estara escuchando al servidor, ya que estamos importando la app desde `src/index.js` y levantando el servidor en un puerto especifico (3000 por defecto o el que se defina en las variables de entorno).

en `src/index.js`
- se importa `dotenv/config` para cargar las variables de entorno desde un archivo `.env`

*vamos a usar el `index` en `src` asique elimino el index en el root*
poner en `package.json` `"dev": "node --watch src/index.js"`
