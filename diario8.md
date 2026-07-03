PRACTICAS - Construir y desplegar un API ESCALABLE

Setup
Neon para el database (PostgreSQL)
ArcJet para seguridad
Warp para comando y shipping tasks

---

//para el package.json que es el root de nuestra aplicacion
npm init -y

npm install express dotenv
// express es un framework para crear aplicaciones web y APIs en Node.js
// dotenv es un paquete que permite cargar variables de entorno desde un archivo .env

creo el gitignore para ignorar node_modules y otros archivos innecesarios

En el package.json
--> se cambia "type": "module" // poder usar import/export en lugar de require/module.exports
--> se cambia el script "test": "node index.js" por "dev": "node --watch index.js"
// para poder correr el servidor en modo desarrollo y que se reinicie automaticamente cuando se hagan cambios en el codigo
// el comando --watch es para que el servidor se reinicie automaticamente cuando se hagan cambios en el codigo

//para correr el servidor en modo desarrollo, se ejecuta el comando:
npm run dev

creo src y los archivos de dentro
app.js --> montar la aplicacion express con los middlewares y rutas correctas
server.js --> levantar el servidor, implementar la logging y escuchar en el puerto correcto
index.js --> punto de entrada de la aplicacion (importar app y server y ejecutar el servidor)
config --> para todos los tipos de configuraciones
controllers --> dentro del codigo fuente, los controladores manejan la logica de cada ruta e interactuan con la base de datos u otros servicios - model view controller paradigm del backend
middleware
--> funciones que se ejecutan antes de llegar a los controladores (son como logging functions), para validar datos, autenticar usuarios, etc.
models --> para definir los modelos de datos
routes --> para definir las rutas de la API y asociarlas con los controladores correspondientes

    TODOS ESTOS SON CONVENCIONES DE LA INDUSTRIA, NO SON OBLIGATORIOS, PERO SON RECOMENDADOS PARA MANTENER EL CODIGO ORGANIZADO Y FACIL DE ENTENDER

    services --> para funciones de utilidad
    utils --> para funciones de utilidad que no pertenecen a ningun modelo o controlador en particular
    validations --> para definir las validaciones de los datos de entrada


Conclusion---

en app.js
importa express & app = express() -> crea una instancia de la aplicación express

en server.js
importa app & PORT = process.env.PORT || 3000; -> escuha ese puerto

en index.js
importa dotenv/config & server.js -> carga las variables de entorno y ejecuta el servidor

*vamos a usar el index en src asique elimino el index en el root
poner en package.json "dev": "node --watch src/index.js"
