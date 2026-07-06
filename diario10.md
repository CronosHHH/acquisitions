Cree mi Projecto en Node

## Índice breve

- [Entorno y .env](#entorno-y-env)
- [Instalación de dependencias](#instalación-de-dependencias)
- [Configuración Drizzle Kit y scripts](#configuración-drizzle-kit-y-scripts)
- [Modelado y migraciones](#modelado-y-migraciones)

---

# Definiciones

## NeonBS

Neon es una base de datos PostgreSQL en la nube pensada para proyectos modernos. Sirve para guardar datos de forma persistente y escalar sin tener que administrar un servidor de base de datos a mano.

Se usa porque ofrece PostgreSQL administrado, ramas de base de datos y un flujo muy amigable para desarrollo y despliegue. Frente a otras opciones, su ventaja es que simplifica mucho el arranque de un proyecto Node sin perder compatibilidad con SQL y con el ecosistema PostgreSQL.

Comandos y acciones clave:

- Crear el proyecto y copiar la `DATABASE_URL` en `.env`.
- Usar la URL de conexión en producción sin exponer credenciales.
- Ver tablas y datos desde el panel web de Neon.

Como encaja en el workflow:

- Primero se crea la base en Neon.
- Luego se guarda la URL en `.env` y `.env.example`.
- Despues Drizzle se conecta a esa base para generar y aplicar migraciones.

Ejemplo de uso:

```env
DATABASE_URL="postgresql://usuario:clave@host/neondb?sslmode=require"
```

Comunidad y enlaces:

- [Documentacion oficial](https://neon.com/docs)
- [Quickstart](https://neon.com/docs/get-started-with-neon)
- [Consola de Neon](https://console.neon.tech/)

## Drizzle ORM

Drizzle ORM es la capa que te permite trabajar con la base de datos desde JavaScript o TypeScript usando modelos tipados. Sirve para definir tablas, relaciones y queries de forma mas segura y legible que escribir todo SQL a mano.

Se usa porque tiene muy buena integracion con TypeScript, genera tipos utiles y no te encierra en una abstraccion pesada. Su ventaja competitiva es que da una experiencia cercana a SQL, pero con autocompletado, tipado fuerte y menos errores en tiempo de desarrollo.

Comandos y acciones clave:

- Definir tablas con `pgTable` y tipos de columna.
- Importar el schema en tu archivo de acceso a datos.
- Ejecutar queries con `db.select()`, `db.insert()`, `db.update()` y `db.delete()`.


Como encaja en el workflow:

- Se crean los schemas en `src/db/schema` o una carpeta similar.(yo lo he hecho en src/models)
- El archivo `src/config/database.js` crea la conexion y exporta la instancia `db`.
- Los controladores o servicios usan `db` para leer y escribir datos.
    - schema -> definicion de la estructura de la base de datos. Ejemplo: `users` con `id`, `name` y `email`.
    - conexion -> enlace activo entre tu aplicacion y la base de datos. Ejemplo: la `DATABASE_URL` de Neon.
    - instancia -> objeto creado a partir de una libreria para usarla en el codigo. Ejemplo: `db` como instancia de Drizzle.
    - controlador -> funcion que recibe una peticion y decide que hacer con los datos. Ejemplo: `createUser` para crear un usuario.

Ejemplo de uso:

```js
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull()
});
```

Comunidad y enlaces:

- [Documentacion oficial](https://orm.drizzle.team/)
- [SQL query builder](https://orm.drizzle.team/docs/select)
- [Guia de schemas](https://orm.drizzle.team/docs/sql-schema-declaration)

## Drizzle Kit

Drizzle Kit es la herramienta de migraciones y sincronizacion del schema. Sirve para generar SQL a partir de tus modelos y para aplicar esos cambios a la base de datos de forma controlada.

Se usa porque automatiza el paso entre el schema de Drizzle y la base real, evitando escribir migraciones manuales todo el tiempo. Su ventaja competitiva es que encaja muy bien con Drizzle ORM y mantiene el flujo simple: defines schema, generas migracion y la aplicas.

Comandos clave para produccion:

- `drizzle-kit generate` para crear migraciones desde los schemas.
- `drizzle-kit migrate` para aplicar migraciones pendientes.
- `drizzle-kit studio` para inspeccionar la base de datos en desarrollo.

Como encaja en el workflow:

- Cuando cambias una tabla, actualizas el schema.
- Ejecutas `npm run db:generate` para crear el SQL.
- Ejecutas `npm run db:migrate` para llevarlo a Neon.
- En desarrollo puedes abrir `db:studio` para revisar datos y tablas.


Ejemplo de uso:

```bash
npm run db:generate
npm run db:migrate
```

Comunidad y enlaces:

- [Documentacion oficial](https://orm.drizzle.team/kit-docs/overview)
- [Migrations](https://orm.drizzle.team/kit-docs/migrations)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)


---

# Montaje

cree `.env` en el root del proyecto y agregue las variables de entorno necesarias para la configuracion del servidor y la base de datos.

copie el snippet de la URL de la base de datos de Neon y lo puse en `DATABASE_URL` dentro del `.env`, asi:

```env
DATABASE_URL="..."
```

añadimos el .env al .gitignore

creo el .env.example para que otros desarrolladores puedan ver que variables de entorno son necesarias para correr el proyecto, pero sin exponer las credenciales

descargamos neon y drizzle-orm
// para poder conectarnos a la base de datos y hacer queries de manera mas facil y segura

```bash
npm install @neondatabase/serverless drizzle-orm
```

y añadimos una dev dependency para usar Drizzle Kit

```bash
npm install -D drizzle-kit
```

configurar el `drizzle-kit`
creo `drizzle.config.js` ([drizzle.config.js](drizzle.config.js))

En ese archivo normalmente se define la ruta del schema, la salida de las migraciones y la `DATABASE_URL` para que Drizzle Kit sepa donde trabajar.

Ahora vamos a montar el DataBase:
config de dentro creo `database.js` para conectar con la base de datos y exportar la instancia de Drizzle ORM ([src/config/database.js](src/config/database.js))

Ese archivo suele importar la conexion de Neon y crear una instancia de `db` que luego usan los servicios o controladores.

Despues pongo en el `package.json` los scripts para poder generar y migrar la base de datos con Drizzle Kit:

```json
"db:generate": "drizzle-kit generate", -> genera los archivos de migracion a partir de los modelos de datos

"db:migrate": "drizzle-kit migrate", -> ejecuta las migraciones pendientes en la base de datos

"db:studio": "drizzle-kit studio", -> abre la interfaz web de Drizzle Studio para explorar la base de datos y ejecutar queries
```

Estos scripts forman parte del workflow normal: cambias el schema, generas migracion, revisas si hace falta y luego la aplicas a Neon.

---

Vamos a crear el primer modelo para Usuarios
Ahí he creado mi primer mi primera tabla de usuarios con Drizzle ORM, definiendo los campos y sus tipos de datos, así como las restricciones de cada campo (como not null, unique, default values, etc.)

Ejemplo de esquema:

`pgTable` es la funcion que define una tabla de PostgreSQL dentro de Drizzle. Le pasas el nombre de la tabla y un objeto con sus columnas, tipos y reglas, y con eso construyes el schema.

En tu proyecto, este ejemplo aparece en [src/models/user.model.js](src/models/user.model.js), donde defines la tabla `users` con campos como `id`, `name`, `email`, `password`, `role` y las fechas de creacion y actualizacion.

```js
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique()
});
```

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

se puede ver la tabla en la pagina del proyecto de Neon, en la seccion de "Tables".

Si quieres seguir el flujo de produccion de forma ordenada, lo normal es: cambiar schema, generar migracion, revisar el SQL generado y luego ejecutar la migracion en el entorno donde corresponda.
