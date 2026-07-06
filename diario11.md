# Logger Y Middleware

# Definiciones

## Winston

Winston se usa para logging estructurado en backend: registrar eventos de negocio, errores y trazas tecnicas en consola y archivos. Se suele elegir antes que `console.log` porque permite niveles (`info`, `warn`, `error`), multiples transportes y formato JSON para poder filtrar y analizar logs en produccion. El codigo mas comun es crear un logger global y reutilizarlo en controllers y services.

```js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'acquisition-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

Workflow tipico: la request entra, Morgan registra acceso HTTP, y tu app usa Winston para logs de negocio y errores de dominio. Al final revisas `combined.log` para flujo general y `error.log` para incidencias.

Enlaces:
- GitHub: https://github.com/winstonjs/winston
- Comunidad/Docs: https://www.npmjs.com/package/winston

## Helmet (de helmetjs)

Helmet se usa para reforzar seguridad HTTP en Express añadiendo cabeceras (CSP, X-Content-Type-Options, etc.). Se elige antes que configurar headers manualmente porque aplica buenas practicas por defecto y reduce errores de configuracion. El uso mas comun es montarlo como middleware global al inicio.

```js
import helmet from 'helmet';

app.use(helmet());
```

Workflow tipico: primero montas Helmet en `app.js`, luego ajustas opciones solo si alguna cabecera rompe algo (por ejemplo CSP en frontend). Es mejor empezar estricto y abrir solo lo necesario.

Enlaces:
- GitHub: https://github.com/helmetjs/helmet
- Comunidad/Docs: https://helmetjs.github.io/

## Morgan

Morgan se usa para logging de trafico HTTP: metodo, ruta, status, tiempo de respuesta y user-agent. Se elige antes que hacer logs manuales en cada endpoint porque captura todo el trafico de forma uniforme y automatica. Lo mas comun es usar formato `combined` y redirigir salida a Winston.

```js
import morgan from 'morgan';
import logger from './config/logger.js';

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));
```

Workflow tipico: Morgan observa cada request/response, Winston persiste el log y luego puedes correlacionar errores de app con las peticiones reales que los causaron.

Enlaces:
- GitHub: https://github.com/expressjs/morgan
- Comunidad/Docs: https://www.npmjs.com/package/morgan

## CORS y cookie-parser

CORS se usa para permitir que un frontend en otro origen (dominio/puerto) pueda llamar al backend. `cookie-parser` se usa para leer y gestionar cookies en `req.cookies`. Se suelen elegir estas librerias porque Express no trae una configuracion de CORS lista para produccion y porque parsear cookies a mano es innecesario y propenso a errores.

```js
import cors from 'cors';
import cookieParser from 'cookie-parser';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());
```

Workflow tipico: configuras CORS segun origenes permitidos, habilitas `credentials` si usas cookies/sesion, y luego en auth lees cookie con `req.cookies.token` o la limpias en logout. Si frontend y backend estan en puertos distintos, esta parte es obligatoria.

Enlaces:
- CORS GitHub: https://github.com/expressjs/cors
- CORS Comunidad/Docs: https://www.npmjs.com/package/cors
- cookie-parser GitHub: https://github.com/expressjs/cookie-parser
- cookie-parser Comunidad/Docs: https://www.npmjs.com/package/cookie-parser
--- 

# montarje 

> npm i winston

## Winston

vamos a configurar un logger para registrar eventos importantes, errores y mensajes de depuración en la aplicación. Esto nos ayuda a monitorear el comportamiento del servidor y a diagnosticar problemas.

creamos `src/config/logger.js` para configurar Winston y definir niveles de log, formatos y transportes (por ejemplo, consola y archivos).

Copiamos y pegamos el snippet de la documentacion oficial de Winston para configurar un logger basico. la unica cosilla es que como nosotros usamos ES Modules (./diario8.md -linea 83), tenemos que cambiar:

```js
const winston = require('winston');
```

por 

```js
import winston from 'winston';
```

Otros cambios que hay que hacer son:

```js
level: 'info',
```

por

```js
level: process.env.LOG_LEVEL || 'info',
```

Y

```js
format: winston.format.json()
```

por

```js
format: winston.format.combine(
    winston.format.timestamp(), // para saber cuando se genero el log
    winston.format.errors({ stack: true }), // para incluir el stack trace en los logs de errores
    winston.format.json() 
  )
```

Y

```js
defaultMeta: { service: 'user-service' },
```

por

```js
defaultMeta: { service: 'acquisition-api' },
```

y en transport (donde tu defines a donde se van a guardar ,y como, los logs):

```js
new winston.transports.File({ filename: 'error.log', level: 'error' })
new winston.transports.File({ filename: 'combined.log'}),
```

por

```js
new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
new winston.transports.File({ filename: 'logs/combined.log'}),
```

y en los logs de porduccion tambien cambio

```js
format: winston.format.simple(),
```

por 

```js
format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
```

y añadidemo un export con

```js
export default logger;
```

---

## app.js

Ahora en app.js
añadimos el middleware para registrar cada request entrante y su respuesta. Esto nos permite ver qué rutas se están accediendo y con qué métodos, así como el estado de la respuesta.
añadimos al principio de app.js:

```js
import logger from './config/logger.js';
```

y en la funcion app.get añadimos:   logger.info('Request received for home page');

---

## package.json (alias)

Para no equivocarnos con los rutas:
ejemplo: import logger from './config/logger.js';
y poder poner: @logger.info('Request received for home page');

nos vamos a package.json y añadimos un alias para que el import sea mas facil de escribir y leer:

```json
  "imports": {
    "#config/*": "./src/config/*",
    "#models/*": "./src/models/*",
    "#controllers/*": "./src/controllers/*",
    "#middlewares/*": "./src/middlewares/*",
    "#services/*": "./src/services/*",
    "#utils/*": "./src/utils/*",
    "#routes/*": "./src/routes/*",
    "#validations/*": "./src/validators/*"
  },
```

---

## Helmet

Vamos a implementar Helmet para mejorar la seguridad de nuestra aplicación Express. Helmet ayuda a proteger la aplicación configurando varios encabezados HTTP relacionados con la seguridad.

> npm i helmet

Copiamos us Usage de la documentacion oficial de Helmet y lo pegamos en app.js (y hacemos import helmet from 'helmet'), justo despues de crear la instancia de express.

> app.use(helmet()); 
ahora helmet sera considerado un middleware (global)

---

## Morgan

Vamos a implementar Morgan para registrar las solicitudes HTTP entrantes. Morgan es un middleware(longger) de registro de solicitudes que nos permite ver información sobre cada solicitud que llega al servidor, como el método HTTP, la URL, el código de estado y el tiempo de respuesta.

>npm i morgan

igual, nos vamos a app.js y hacemos import morgan from 'morgan'; y añadimos el middleware de morgan justo despues de helmet:

> app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
el combina es de que es en dev y en produccion, y nos da un log mas completo, con mas informacion de la request y la response.
y esto lo hemo añadido nosostros [{ stream: { write: (message) => logger.info(message.trim()) }] y es que cuando recibe un mensaje (que sera de morgan) lo envia al logger de winston, y lo guarda en el archivo de logs.

añadimos 

```js
app.use(express.json()); // para parsear el body de las solicitudes entrantes como JSON
app.use(express.urlencoded({ extended: true })); // para parsear el body de las solicitudes entrantes como URL-encoded
```

--- 

## CORS y cookie-parser

añadir las ultimas piezas del middleware

cors le permite al backend aceptar solicitudes de otros dominios (externas), lo cual es importante para aplicaciones web modernas donde el frontend y el backend pueden estar en diferentes dominios o puertos.
Sin el los navegadores bloquean las solicitudes de origen cruzado por razones de seguridad, y eso nos impide que el frontend pueda comunicarse con el backend.

> npm install cors cookie-parser

cookie-parser es un middleware que nos permite leer y escribir cookies en las solicitudes y respuestas HTTP. Esto es útil para manejar sesiones de usuario, autenticación y otras funcionalidades que dependen de cookies.

vamos a usar express.json() que es un middleware incorporado en Express que analiza el cuerpo de las solicitudes entrantes con contenido JSON y lo convierte en un objeto JavaScript accesible a través de req.body. Esto es útil para manejar datos enviados desde el frontend en formato JSON.

igual, en app.js añadimos:

```js
import cors from 'cors';
y
import cookieParser from 'cookie-parser';
y añadimos el middleware de cors justo despues de helmet:
app.use(cors());
y 
app.use(coo)
```

---

## Workflow final


LO QUE SE VE POR AHORA, cuando ejecutas npm run dev:

primero se corre ESLint sobre todo el proyecto con npx eslint .. Si no hay errores graves, entonces se lanza el servidor con node --watch src/index.js, así que la app queda escuchando cambios y se reinicia automáticamente cuando modificas archivos.

Después, al arrancar la aplicación, Express carga los middlewares globales: helmet, cors, cookieParser, express.json(), express.urlencoded() y morgan. Eso deja lista la app para recibir peticiones, leer cookies, parsear JSON y registrar accesos.

Luego, cuando haces una petición a /, entra morgan, que genera el log de la request, y ese mensaje se pasa a winston, que lo guarda o lo muestra según tu configuración. Además, en la ruta raíz tú mismo registras otro mensaje con logger.info('Request received for home page'), así que en ese caso se ven tanto los logs automáticos de morgan como el log personalizado de winston.