Dockerizacion 

Warp con sonnet 5 me ha hecho:

You are a senior DevOps engineer. Your task is to dockerize my application that uses Neon Database. The setup must work differently for development and production:

1. **Development Environment (Local):**
    - Use **Neon Local** via Docker.
    - Configure `docker-compose.yml` to run the Neon Local proxy alongside my application. Learn more about Neon Local here: https://neon.com/docs/local/neon-local
    - The application should connect to Postgres at `postgres://user:password@neon-local:5432/dbname` (or equivalent `localhost` inside the compose network).
    - Neon Local should automatically create ephemeral branches for dev and testing.
    - Ensure `.env.development` or equivalent config points to this Neon Local connection string.
2. **Production Environment:**
    - Use the actual **Neon Cloud Database URL** (e.g., `DATABASE_URL=postgres://...neon.tech...`).
    - No Neon Local proxy should be used in production.
    - Ensure secrets and URLs are injected via environment variables, not hardcoded.
    - Create a separate `.env.production` for production environments
3. **General Requirements:**
    - Write a `Dockerfile` for the app.
    - Write a `docker-compose.dev.yml` that runs both the app and Neon Local for development.
    - Write a `docker-compose.prod.yml` that runs both the app and serverless neondb for production.
    - Show how environment variables (`DATABASE_URL`) switch between dev and prod.
    - Provide documentation (in `README.md` style) for how a developer should start the app locally with Neon Local, and how the same app deploys with production Neon DB.

despues he cambiado el script de dev por start
y lo he cambiado al final del Dockerfile[/Dockerfile] 
CMD ["node", "src/index.js"]
por 
CMD["npm", "start"] para que se ejecute el script de start y no el de dev, ya que este ultimo ejecuta eslint y no es necesario en produccion.

---

para Produccion corre en Neon Cloud Database 
para desarrollo corre en Neon Local 
- que es un proxy de Neon Cloud Database que corre en Docker y permite crear ramas efimeras para desarrollo y testing.

He creado una personal API en NeonDb y la he puesto en el archivo .env.development para que se conecte a Neon Local y cree ramas efimeras para desarrollo y testing.

Y tb tuve q poner todas las demas variables de entorno en el archivo .env.development para que se conecte a Neon Local y cree ramas efimeras para desarrollo y testing.
(no olvidar porner la variable de entorno ARCJET_KEY para que funcione el middleware de seguridad)

asegurarnos que el dockerfile tiene un ptero a las variables de entorno, en vez de ponerlo directamente:

```dockerfile
environment:
  - DATABASE_URL=${DATABASE_URL}
  - NEON_API_KEY=${NEON_API_KEY}
  - NEON_PROJECT_ID=${NEON_PROJECT_ID}
  - NEON_PARENT_BRANCH_ID=${NEON_PARENT_BRANCH_ID}
  - ARCJET_KEY=${ARCJET_KEY}
```
ES MEJOR:
```dockerfile
env_file:
  - .env.development
```

---

he creado un script de desarrollo en `scripts/dev.sh` que ejecuta el docker-compose.dev.yml y levanta la aplicacion y Neon Local para desarrollo y testing.
y lo he añadido al package.json como script de desarrollo `dev:docker` para que se pueda ejecutar con `npm run dev:docker`
