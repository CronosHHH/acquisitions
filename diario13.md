# Definiciones

- ## ArcJet

ArcJet se usa para proteger aplicaciones web directamente desde el codigo, integrando seguridad activa (WAF, Rate Limiting, Deteccion de Bots) como parte del runtime de la aplicacion. Se suele elegir antes que soluciones tradicionales de red (como Cloudflare o AWS WAF) porque permite definir reglas dinamicas basadas en el contexto de la aplicacion (como el rol del usuario, base de datos o estado de la sesion) en lugar de reglas estaticas de IP o cabeceras.

### Comandos Claves:
- `npm i @arcjet/node @arcjet/inspect` (Instalacion del SDK y la herramienta de inspeccion local).
- `arcjet({ key, rules })` (Inicializacion del cliente con la API key y las reglas globales).
- `aj.withRule(...)` (Inyeccion de reglas dinamicas en runtime).
- `client.evaluate(req)` (Evaluacion de la peticion contra las reglas configuradas).

### Workflow:
1. **Configuracion**: Se crea un cliente centralizado en `src/config/arcjet.js` con reglas base (Shield, Bot Detection).
2. **Middleware**: Se monta un middleware de Express que intercepta las peticiones, inyecta reglas dinamicas (como Rate Limiting por rol) y evalua la peticion.
3. **Decision**: Si ArcJet deniega la peticion, el middleware bloquea el paso y responde con el codigo HTTP adecuado (403 o 429). Si la aprueba, la peticion continua hacia los controladores.

---

# Montaje

para la Cyber-Seguridad usaremos ArcJet [https://docs.arcjet.com/get-started?f=node-js-express]

> npm i @arcjet/node @arcjet/inspect


en la pagina de configuracion de ArcJet nos da el metodo para configurar a traves de index.js, pero en este proyecto lo haremos a traves de un archivo de configuracion separado, `src/config/arcjet.js` ([arcjet.config.js](arcjet.config.js))

para ello vamos a modificar la plantilla:
- cambiamos `tokenBucket` por `slidingWindow`
- quitamos la request (`app.get`)
- exportamos el `aj`

Y ahora podemos crear el middleware en `src/middlewares/arcjet.middleware.js` y usarlo en `src/app.js`

---

# Explicacion de `security.middleware.js`

El archivo `security.middleware.js` actua como un escudo dinamico para proteger nuestra aplicacion. No solo aplica reglas estaticas, sino que adapta la seguridad en tiempo real segun el rol del usuario que hace la peticion.

## Logica de Detras

La idea principal es la **seguridad adaptativa por rol**. En lugar de tratar a todos los usuarios por igual, el middleware identifica quien hace la peticion y ajusta los limites de peticiones (Rate Limiting) en consecuencia:

1. **Identificacion del Rol**: Lee el rol del usuario desde `req.user`. Si no ha iniciado sesion, se le asigna el rol de `'guest'` (invitado).
2. **Asignacion de Limites**:
   - **Admin**: 20 peticiones por minuto (necesita mas margen para tareas de gestion).
   - **User**: 10 peticiones por minuto (uso normal de la aplicacion).
   - **Guest**: 5 peticiones por minuto (limite estricto para evitar abusos de usuarios no autenticados).
3. **Evaluacion Dinamica**: Usa `aj.withRule` para inyectar la regla de `slidingWindow` configurada especificamente para ese rol en esa peticion.
4. **Toma de Decisiones**: Evalua la peticion contra ArcJet y, si es denegada, analiza la razon exacta (Bot, Shield o Rate Limit) para dar una respuesta adecuada y registrar el evento en los logs.

---

## Funcionalidades Clave

- **Rate Limiting Dinamico**: Cambia el maximo de peticiones permitidas en runtime usando `slidingWindow` de ArcJet.
- **Deteccion de Bots**: Bloquea scrapers y bots maliciosos de forma automatica.
- **Proteccion Shield**: Analiza la peticion en busca de ataques comunes como inyecciones SQL o Cross-Site Scripting (XSS).
- **Logs de Seguridad**: Registra advertencias detalladas con la IP, la ruta y el metodo HTTP cuando se bloquea una peticion sospechosa.

---

## Comandos y Metodos Notables

### `aj.withRule(...)`
Permite añadir o sobreescribir reglas de ArcJet sobre la marcha para una peticion especifica. Es lo que nos permite cambiar el limite de peticiones segun el rol del usuario de forma dinamica.

### `slidingWindow({ interval, max, name })`
Define un algoritmo de ventana deslizante para el Rate Limiting. Es mas preciso que una ventana fija porque evita que un usuario duplique su limite haciendo todas las peticiones justo en el cambio de minuto.

### `client.evaluate(req)`
Envia los datos de la peticion a ArcJet para que analice las reglas (Shield, Bot Detection y Rate Limit) y devuelva una decision.

### `decision.isDenied()`
Metodo para comprobar si la peticion debe ser bloqueada. Si devuelve `true`, la peticion no debe continuar hacia el controller.

### `decision.reason.isBot()`, `isShield()`, `isRateLimit()`
Metodos de analisis que nos permiten saber exactamente por que se denego el acceso, permitiendo personalizar la respuesta HTTP (403 para bots/shield, 429 para rate limit) y guardar logs especificos.

---
---


tras esto en app.js incorporamos el middleware de seguridad antes de las rutas, para que todas las peticiones pasen por el filtro de seguridad adaptativa.

> import securityMiddleware from '#middlewares/security.middleware.js';
>
>app.use(securityMiddleware);
