Cree mi Projecto en Node

## Índice breve

- [Entorno y .env](#entorno-y-env)
- [Instalación de dependencias](#instalación-de-dependencias)
- [Configuración Drizzle Kit y scripts](#configuración-drizzle-kit-y-scripts)
- [Modelado y migraciones](#modelado-y-migraciones)

---

cree `.env` en el root del proyecto y agregue las variables de entorno necesarias para la configuracion del servidor y la base de datos 
*copie el snippet y lo puse en database_url en el .env
asi: ".env.*"
añadimos el .env al .gitignore

creo el .env.example para que otros desarrolladores puedan ver que variables de entorno son necesarias para correr el proyecto, pero sin exponer las credenciales 

descargamos neon y drizzle-orm 
// para poder conectarnos a la base de datos y hacer queries de manera mas facil y segura

```bash
npm install @neondatabase/serverless drizzle-orm
```

y añadimos una dev dependency - para que drizzer kit

```bash
npm install -D drizzle-kit
```

configurar el `drizzle-kit`
creo `drizzle.config.js` ([drizzle.config.js](drizzle.config.js))

Ahora vamos a montar el DataBase:
config de dentro creo `database.js` para conectar con la base de datos y exportar la instancia de Drizzle ORM ([src/config/database.js](src/config/database.js))

Despues pongo en el `package.json` los scripts para poder generar y migrar la base de datos con Drizzle Kit:

```json
"db:generate": "drizzle-kit generate", -> genera los archivos de migracion a partir de los modelos de datos

"db:migrate": "drizzle-kit migrate", -> ejecuta las migraciones pendientes en la base de datos

"db:studio": "drizzle-kit studio", -> abre la interfaz web de Drizzle Studio para explorar la base de datos y ejecutar queries
```

--- 

Vamos a crear el primer modelo para Usuarios
Ahí he creado mi primer mi primera tabla de usuarios con Drizzle ORM, definiendo los campos y sus tipos de datos, así como las restricciones de cada campo (como not null, unique, default values, etc.)

Generar SQL schemas usando Drizzle Kit 
abrimos la terminal y ejecutamos el comando:

```bash
npm run db:generate
```

se crea:

- `drizzle/0000_normal_vector.sql` (archivo de migración generado)

vamos a publicar/migrar los cambios a NeonDB

```bash
npm run db:migrate
```

se puede ver la tabla en la pagina del proyecto de NeonDB, en la seccion de "Tables"
