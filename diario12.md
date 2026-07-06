# Auth I

# Definiciones 

## HTTPie

HTTPie se usa para probar endpoints HTTP rapido desde cliente, enviando requests y viendo respuestas de forma clara. Se suele elegir antes que herramientas mas pesadas cuando estas en fase de desarrollo backend porque es rapido para iterar, repetir pruebas y validar payloads sin montar frontend.

Primer descargamos e instalamos HTTPIE [https://httpie.io/docs/cli/linux]
Para usar redes locales, ahi que usar la version de desktop, QUE ES UN COÑAZO de descargar para linux

Codigo mas comun usado, con ejemplo:

```bash
http POST :3000/api/auth/sing-up name=Renato email=renato@email.com password=123123 role=user
```

Workflow tipico: arrancas el server, pruebas el endpoint con HTTPie, revisas status y body, luego miras logs para confirmar el flujo de backend.

Enlaces:
- GitHub: https://github.com/httpie/cli
- Comunidad/Docs: https://httpie.io/docs

## jsonwebtoken

`jsonwebtoken` se usa para firmar y verificar JWT en autenticacion. Se suele elegir antes que implementar tokens manuales porque ya trae firma segura, expiracion, validacion y opciones estandar del ecosistema Node.

Codigo mas comun usado, con ejemplo:

```js
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});

const payload = jwt.verify(token, process.env.JWT_SECRET);
```

Workflow tipico: login/signup exitoso -> firmas token -> lo envias por cookie/header -> en rutas protegidas verificas token -> extraes payload y autorizas.

Enlaces:
- GitHub: https://github.com/auth0/node-jsonwebtoken
- Comunidad/Docs: https://www.npmjs.com/package/jsonwebtoken

## zod

Zod es un paquete super popular para validar y parsear datos en JavaScript y TypeScript. Nos ayuda a asegurarnos de que los datos que recibimos o enviamos cumplen con ciertas reglas, como tipos, formatos y valores permitidos. Se suele elegir antes que validaciones manuales porque centraliza reglas, da errores consistentes y evita repetir checks en cada controller.

Codigo mas comun usado, con ejemplo:

```js
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

const result = signupSchema.safeParse(req.body);
```

Workflow tipico: request entra -> validas con schema -> si falla devuelves 400 con errores -> si pasa delegas al servicio para logica de negocio.

Enlaces:
- GitHub: https://github.com/colinhacks/zod
- Comunidad/Docs: https://zod.dev/

## Get y Post requests

GET se usa para leer datos y POST se usa para enviar datos y crear/modificar recursos. Se elige GET cuando no quieres efectos secundarios y POST cuando la accion cambia estado del sistema. Esta separacion hace que la API sea mas predecible y mantenible.

Codigo mas comun usado, con ejemplos:

```js
await fetch('/api/users'); // GET

await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Carlos' }),
});
```

Workflow tipico: frontend consulta con GET para pintar datos, y usa POST cuando el usuario envia formularios para crear/actualizar informacion.

Enlaces:
- GitHub (referencia cliente HTTP): https://github.com/whatwg/fetch
- Comunidad/Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

Las diferencias clave:

| Caracteristica | GET | POST |
| --- | --- | --- |
| Objetivo principal | Obtener datos del servidor. | Enviar datos al servidor para crear o modificar algo. |
| ¿Donde van los datos? | Visibles en la URL, como parametros: `?id=123`. | Ocultos en el cuerpo (`body`) de la peticion. |
| Limite de datos | Si. Las URLs tienen un limite de caracteres, aprox. 2,048. | Practicamente ilimitado. |
| Seguridad | Menor. Nunca envies contraseñas por GET, quedan en el historial. | Mayor. Los datos viajan en el cuerpo de la peticion. |
| Cache | Las respuestas se pueden guardar en cache y cargar mas rapido. | Normalmente no se guardan en cache. |

## Ejemplos practicos con `fetch`

Hoy en dia, la forma mas limpia de hacer esto en JavaScript moderno es usar la API `fetch` con `async/await`.

### 1. Peticion GET

Imagina que quieres traer la informacion de un usuario especifico. Como solo vas a leer datos, usas GET. Si no especificas el metodo en `fetch`, JavaScript asume GET por defecto.

```js
async function obtenerUsuario() {
  try {
    // Los datos que necesitas, como el ID, van directamente en la URL
    const respuesta = await fetch('https://api.ejemplo.com/usuarios?id=42');

    if (!respuesta.ok) throw new Error('Error al obtener datos');

    const usuario = await respuesta.json();
    console.log('Datos del usuario recibidos:', usuario);
  } catch (error) {
    console.error('Hubo un problema:', error);
  }
}

obtenerUsuario();
```

### 2. Peticion POST

Ahora imagina que quieres registrar a un usuario nuevo. Tienes que mandarle al servidor su nombre y su contrasena. Como vas a crear datos y manejas informacion sensible, usas POST.

```js
async function crearUsuario() {
  const nuevoUsuario = {
    nombre: 'Carlos',
    email: 'carlos@email.com',
    password: 'SuperPassword123' // Datos sensibles que no deben ir en la URL
  };

  try {
    const respuesta = await fetch('https://api.ejemplo.com/usuarios', {
      method: 'POST', // Especificamos el metodo
      headers: {
        'Content-Type': 'application/json' // Le decimos al servidor que le enviamos un JSON
      },
      body: JSON.stringify(nuevoUsuario) // Convertimos el objeto JS a una cadena JSON
    });

    if (!respuesta.ok) throw new Error('Error al crear el usuario');

    const resultado = await respuesta.json();
    console.log('Usuario creado con exito:', resultado);
  } catch (error) {
    console.error('Hubo un problema:', error);
  }
}

crearUsuario();
```

> Regla de oro: si la accion modifica algo en la base de datos, usa POST o sus hermanos PUT/DELETE. Si solo vas a ver informacion, usa GET.

---
---

# Montaje

en src/routes vamos a crear nuestro pirmer grupo de routas

creamos un archivo llamado `auth.routes.js` ([src/routes/auth.routes.js](src/routes/auth.routes.js)) y dentro definimos las rutas relacionadas con la autenticacion, como sing-in, sing-up, sing-out, etc, usando express.Router() para agruparlas y exportarlas.

app.js añado:



```js
import authRoutes from './routes/auth.routes.js';

...

app.use('/api/auth', authRoutes); // análogo a lo q veniamos haciendo con los middlewares
// exponemos las rutas de autenticacion bajo el prefijo /api/auth, asi que todas las rutas definidas en auth.routes.js seran accesibles desde /api/auth/...

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() , uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});


```
esto al hacer localhos300/health nos devuelve un json con el estado de la app y el tiempo de actividad del proceso, y al hacer localhost:3000/api nos devuelve un json con un mensaje de que la api esta corriendo.
Pero esto solo se pued e hacer por GET REQUESTS

pien en que significa que "carge una pagina web"
- significa hacer la "get request" más simple, hacie ese endpoint
- que el servidor le devuelva un mensaje de que esta corriendo, y que el servidor este vivo y funcionando.

para hacer app.post se necesita un HTTP CLIENT, como postman o insomnia, o un front-end que haga la peticion POST a la ruta correspondiente. 

Vamos a usar HTTPIE (el mas simple y rapido)

ahora vamos a probar la ruta de autenticacion con HTTPIE
lo poner en modo POST y pones :3000/api/auth/sing-in y saldra correcto el mensaje que pusimos.

---

jsonwebtoken (JWT) es un estandar abierto que define una forma compacta y segura de transmitir información entre partes como un objeto JSON. Esta informacion puede ser verificada y confiable porque esta firmada digitalmente.
Se usa para asegurarnos que nuestros usuarios estan autenticados y si lo estan, saber quienes son.

> npm i jsonwebtoken

ademas creamos jwt.js[src/utils/jwt.js] en src/utils 


- primero añadiremos un metodo para firmar el token
- - este metodo acepta un payload y devuelve un TOKEN FIRMADO, despues de verificar si eres el que dices ser
- - en el catch se captura el error y se loguea, ademas de lanzar un error para que el llamador sepa que hubo un problema
- - en el try se intenta firmar el token con la clave secreta y un tiempo de expiracion, si todo sale bien se devuelve el token firmado

- ademas añadiremos un metodo para verificar el token
- - igual que el anterior pero en el try pondemos jwt.verify

---

Ademas crearemos otro componente llamado cookies.js [src/utils/cookies.js] para manejar las cookies de manera centralizada y consistente en toda la aplicacion.

haremos un metodo getOptions que es una "callback function" 
- con respuesta automatica (por eso -> ({}) (callback function) y no -> {} (code function) block) 
- - para obtener las opciones de la cookie, como el tiempo de expiracion, el dominio, la ruta y si es segura o no.

haremos otro metodo clear
- que recibe respuesta, nombre y opciones, 
- lo que hace es limpiar la cookie con el nombre especificado, usando las opciones por defecto de getOptions y las opciones adicionales que se le pasen.

haremos otro metodo get 
- que recibe request y nombre
- lo que hace es devolver el valor de la cookie con el nombre especificado

---

con ZOD vamos a crear un esquema de validacion para el login y otro para el registro de usuarios, para asegurarnos de que los datos que recibimos cumplen con las reglas que definimos.

> npm i zod

lo haremos en la carpeta de /src/validators, creando dos archivos: auth.validator.js[src/validators/auth.validator.js]

para poder formatear todos los errores puestos en validatos (ejemplo: si el email no es valido, o la contrasena es muy corta) vamos a crear otra funcion de utilidad llamada format.js[src/utils/format.js]
Este archivo contiene una funcion llamada formatValidationErrors que toma los errores de validacion de Zod y los convierte en un mensaje de error legible para el usuario. array de issues, cada issue tiene un path y un message, y los concatenamos en un string separado por comas. Si no hay issues, devolvemos un mensaje generico de error.

---

La logica para crear usuarios, una vez han iniciado sesion, lo haremos en controllers/auth.controller.js[src/controllers/auth.controller.js]

Mientras en routes definimos los endpoints, en controllers definimos lo que pasa cuando se llama a ese endpoint.

La funcion que haremos (que sera la que se produzca cuando se haga un POST a /api/auth/sing-up) sera:
export const signup = async (req, res, next)

usaremos next(e) - pasa el error y pasaselo a la siguiente funcionalidad de next, que es el middleware de error que definimos en app.js, y que se encarga de loguear el error y devolver un mensaje generico al cliente.

next se suele usar:
- para pasar el control al siguiente middleware en la cadena, especialmente cuando hay un error o cuando queremos delegar la respuesta a otro middleware. 
- cuando una accion especifica sera llamada antes que otra accion, asique le pasa la antorcha a la siguiente accion,

logica del signup creado en controllers/auth.controller.js[src/controllers/auth.controller.js], podemos implementar la funcion singup en rutas, para que cuando se haga un POST a /api/auth/sing-up, se llame a la funcion signup del controlador:

pasa de:
router.post('/sing-up', (req, res) => {
  res.send('POST /api/auth/sing-up response');
});
A:
import { signup } from '#controllers/auth.controller.js';
router.post('/sing-up', signup);

ahora en vez de ver en POST localhost3000/api/auth/sing-up:
POST /api/auth/sing-up response
veremos:
{
    "error": "Validation failed",
    "details": "..."
}
* en httpie cambios de params a body tipo form

| Campo | Valor | Estado |
| --- | --- | --- |
| email | renatoramirezvida@gm... | activo |
| name | Renato | activo |
| password | 123123 | activo |
| name | value | inactivo |

tras poner eso y enviar el POST request veremos:

{
  "message": "User signed up successfully",
  "user": {
    "id": 1,
    "name": "Renato",
    "email": "renatoramirezvida@gmail.com",
    "role": "user"
  }
}

y si nos vamos a los logs de backend, podemos ver que se ha hecho la post request: 
info: User Renato signed up successfully with email renatoramirezvida@gmail.com and role user {"service":"acquisition-api"}

si en user en auth.controller.js[src/controllers/auth.controller.js] ponemos ponemos contraseña:
      user: { 
        id: 1, name, email, role, password
      } 
la veriamos perfectamente, y podriamos hacer lo que quisieramos con ella, pero eso es un riesgo de seguridad, asique no lo hacemos.
Para ello vamos a encriptar la contraseña antes de guardarla en la base de datos, usando bcrypt.

> npm i bcrypt

en src/services creamos auth.service.js[src/services/auth.service.js] y ahi creamos una funcion hashPassword que recibe la contraseña en texto plano y devuelve la contraseña encriptada usando bcrypt.hash.

ademas ese servicio hace mas cosas importantes:

- comprueba si ya existe un usuario con ese email en la base de datos, para evitar duplicados.
- crea el hash de la contraseña antes de guardarla, asi nunca se almacena en texto plano.
- inserta el nuevo usuario en la tabla `users` usando Drizzle ORM.
- devuelve solo los datos publicos del usuario, como `id`, `name`, `email` y `role`, pero nunca la contraseña.
- registra en los logs que el usuario se ha creado correctamente.

la funcion `createUser` centraliza toda esa logica, asi el controlador queda mas limpio y el servicio se encarga de la parte real de negocio y persistencia.

volvemos a auth.controller.js[src/controllers/auth.controller.js] y en la funcion signup llamamos a createUser del servicio auth.service.js[src/services/auth.service.js] para crear el usuario.

---

## Error de base de datos y solucion

Al probar el alta de usuarios, la API devolvia un `500` en `POST /api/auth/sing-up` y en los logs aparecia este error en la consulta de comprobacion de email:

`Failed query: select ... from "users" where "users"."email" = $1 limit $2`

Al principio parecia un problema de tabla o de migraciones, pero lo fuimos descartando paso a paso. Primero confirmamos que la tabla `users` existia en Neon, que tenia las columnas correctas y que `SELECT * FROM users LIMIT 1;` funcionaba directamente en el editor SQL de Neon. Tambien comprobamos que `npm run db:migrate` terminaba bien, asi que el esquema estaba aplicado.

La pista decisiva fue comparar la misma consulta fuera de la app. La conexion cruda con `neon(process.env.DATABASE_URL)` funcionaba, pero la misma logica pasando por Drizzle fallaba. Eso nos hizo ver que el problema no estaba en el controller ni en el servicio, sino en la capa de conexion que usaba Drizzle.

La solucion fue cambiar [src/config/database.js](src/config/database.js) para que Drizzle usara `Pool` de `@neondatabase/serverless` con el adaptador `drizzle-orm/neon-serverless`, en vez de depender de la ruta que estaba fallando con el cliente HTTP. Tras ese cambio, probamos de nuevo una transaccion con `select` e `insert` sobre `users` y ambas operaciones funcionaron correctamente, con rollback incluido para no dejar datos de prueba.

En resumen: la base y la tabla estaban bien, pero la capa de acceso con Drizzle estaba usando un camino de conexion que fallaba. Se detecto con pruebas minimas aisladas y se resolvio cambiando el adaptador de conexion en la configuracion de la base de datos.

---

## Conexion entre Database y Drizzle

La conexion a la base de datos funciona en dos capas. Primero esta `DATABASE_URL`, que es la cadena con la direccion exacta de Neon, el usuario, la clave y la base a la que queremos entrar. Esa URL es la llave que le dice a la aplicacion donde esta la base de datos y como autenticarse.

Encima de eso esta Drizzle ORM. Drizzle no es la base de datos, sino la herramienta que usamos para hablar con ella desde JavaScript de forma ordenada y tipada. En vez de escribir SQL a mano en cada parte del codigo, definimos tablas y consultas con objetos y funciones. Asi el codigo queda mas legible y es mas dificil equivocarse con nombres de columnas, tipos o estructuras.

La idea basica es esta:

- `DATABASE_URL` apunta a la base real de Neon.
- Neon es el servidor de PostgreSQL donde estan guardadas las tablas.
- Drizzle recibe esa conexion y construye las consultas.
- El servicio `auth.service.js` usa Drizzle para leer y escribir en `users`.
- El controller recibe la peticion HTTP y delega la logica al servicio.

En este proyecto, la configuracion vive en [src/config/database.js](src/config/database.js). Ahí se crea la conexion y se exporta `db`, que luego se importa en los servicios. Ese `db` es el punto de entrada para hacer consultas como `select`, `insert` o `update`.

La teoria mas basica seria esta: la base de datos guarda datos, la URL dice donde esta, y Drizzle es la capa intermedia que transforma tu codigo en consultas SQL. Si esa capa intermedia falla, la tabla puede existir perfectamente y aun asi la app no funcionar. Por eso fue importante probar la consulta fuera del controller y luego dentro de Drizzle, para encontrar exactamente donde se rompia.





