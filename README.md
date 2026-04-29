# Login + CRUD con balanceo de carga usando Docker

Aplicación web demostrativa con autenticación JWT, operaciones CRUD, base de datos PostgreSQL compartida y balanceo de carga con Nginx. El objetivo del proyecto es mostrar una arquitectura simple pero realista con tres instancias del backend detrás de un balanceador.

## Resumen

- **Frontend:** interfaz web HTML servida desde el backend.
- **Backend:** Node.js + Express.
- **Autenticación:** JWT.
- **Base de datos:** PostgreSQL compartida por todas las instancias.
- **Balanceador:** Nginx con estrategia Round Robin.
- **Contenerización:** Docker Compose.

---

## Objetivo del proyecto

Este proyecto fue pensado para demostrar, de forma práctica, cómo se combinan varios conceptos de desarrollo web y despliegue:

- autenticación de usuarios con token,
- operaciones CRUD sobre una entidad simple,
- persistencia centralizada en base de datos,
- distribución de tráfico entre múltiples servidores,
- y orquestación con contenedores.

La idea principal es que, aunque existan tres backends, todos trabajen con la misma base de datos. Así, el usuario ve datos consistentes sin importar a qué instancia lo dirija Nginx.

---

## Teoría breve

### 1. ¿Qué es CRUD?

CRUD es el acrónimo de:

- **Create:** crear registros.
- **Read:** consultar registros.
- **Update:** actualizar registros.
- **Delete:** eliminar registros.

En este proyecto, el recurso administrado es `items`.

### 2. ¿Qué es JWT?

JWT significa **JSON Web Token**. Es un mecanismo para autenticar peticiones sin mantener sesión en el servidor.

Flujo básico:

1. El usuario inicia sesión con credenciales.
2. El servidor genera un token firmado.
3. El cliente guarda el token.
4. En cada petición protegida, el token se envía en el encabezado `Authorization`.
5. El backend valida el token antes de responder.

### 3. ¿Qué es balanceo de carga?

El balanceo de carga distribuye solicitudes entre varios servidores para mejorar:

- disponibilidad,
- tolerancia a fallos,
- y reparto de trabajo.

En este proyecto, Nginx actúa como reverse proxy y reparte las peticiones entre `backend1`, `backend2` y `backend3` usando Round Robin.

### 4. ¿Por qué usar una sola base de datos?

Si cada contenedor guarda datos en memoria local, cada backend tendría su propio estado y el usuario vería resultados diferentes. Con una base PostgreSQL compartida:

- todos los backends leen la misma información,
- todos escriben en el mismo lugar,
- y el balanceo no rompe la consistencia de los datos.

### 5. ¿Qué hace Docker aquí?

Docker permite ejecutar la aplicación y sus servicios como contenedores aislados, repetibles y fáciles de levantar. Con Docker Compose se inicia todo con un solo comando.

---

## Arquitectura

```text
Cliente (navegador / curl)
        |
        v
      Nginx
        |
   -----------------
   |       |       |
backend1 backend2 backend3
   \       |       /
        PostgreSQL
```

---

## Estructura del proyecto

```text
Semana0-7Nube/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── Dockerfile
│   └── views.html
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## Requisitos previos

Antes de ejecutar el proyecto necesitas:

- Docker
- Docker Compose
- Navegador web
- Opcional: `curl` para pruebas desde terminal

---

## Cómo iniciar el proyecto

1. Abrir una terminal en la carpeta del proyecto.

```bash
cd /Users/rafael/tecsup/Semana0-7Nube
```

1. Construir y levantar todos los servicios.

```bash
docker-compose up --build
```

1. Abrir el navegador en:

```text
http://localhost
```

---

## Credenciales de prueba

- **Usuario:** `admin`
- **Contraseña:** `123`

---

## Uso de la interfaz web

Al ingresar a `http://localhost` verás una vista guiada con estas secciones:

- título con el puerto de acceso,
- indicación de Nginx,
- backend atendido,
- formulario de login,
- formulario para crear y editar items,
- tabla con los registros,
- botones de editar y eliminar.

### Flujo recomendado

1. Inicia sesión con `admin / 123`.
2. Escribe un nombre en el formulario de items.
3. Pulsa **Crear item**.
4. El registro aparecerá en la tabla.
5. Pulsa **Editar** para cargar ese item en el formulario.
6. Modifica el nombre y pulsa **Guardar cambios**.
7. Pulsa **Eliminar** para borrar el registro.

---

## Endpoints disponibles

### `POST /login`

Autentica al usuario y devuelve un JWT.

**Body:**

```json
{
  "username": "admin",
  "password": "123"
}
```

**Respuesta:**

```json
{
  "token": "..."
}
```

### `GET /items`

Lista todos los items.

**Header requerido:**

```text
Authorization: TU_TOKEN
```

**Respuesta:**

```json
{
  "total": 1,
  "data": [
    {
      "id": 1,
      "name": "Laptop"
    }
  ]
}
```

### `POST /items`

Crea un nuevo item.

**Body:**

```json
{
  "name": "Laptop"
}
```

### `PUT /items/:id`

Actualiza un item existente.

**Body:**

```json
{
  "name": "Laptop Gamer"
}
```

### `DELETE /items/:id`

Elimina un item existente.

### `GET /server-info`

Devuelve información de la instancia backend que atendió la petición.

---

## Balanceo de carga con Nginx

Nginx está configurado como reverse proxy y balanceador usando Round Robin.

Cada petición entrante se envía a una de estas instancias:

- `backend1:8080`
- `backend2:8080`
- `backend3:8080`

Esto permite probar el balanceo sin perder consistencia de datos porque los tres backends usan la misma base PostgreSQL.

### Prueba rápida del balanceo

Puedes recargar `http://localhost` varias veces o usar `curl` repetidas veces para observar que Nginx distribuye las solicitudes.

---

## Pruebas rápidas por terminal

### Obtener token

```bash
curl -X POST http://localhost/login \
-H "Content-Type: application/json" \
-d '{"username":"admin","password":"123"}'
```

### Crear item

```bash
curl -X POST http://localhost/items \
-H "Content-Type: application/json" \
-H "Authorization: TU_TOKEN" \
-d '{"name":"Laptop"}'
```

### Listar items

```bash
curl http://localhost/items \
-H "Authorization: TU_TOKEN"
```

### Editar item

```bash
curl -X PUT http://localhost/items/1 \
-H "Content-Type: application/json" \
-H "Authorization: TU_TOKEN" \
-d '{"name":"Laptop Gamer"}'
```

### Eliminar item

```bash
curl -X DELETE http://localhost/items/1 \
-H "Authorization: TU_TOKEN"
```

---

## Configuración de Docker

### Servicios

- **db:** PostgreSQL 16 con volumen persistente.
- **backend1, backend2, backend3:** la misma imagen Node.js, conectada a la misma base.
- **nginx:** expone el puerto `80` y distribuye tráfico entre los backends.

### Variables de entorno importantes

- `DATABASE_URL`: cadena de conexión a PostgreSQL.
- `PORT`: puerto interno del backend.

---

## Persistencia de datos

La información de `items` se guarda en PostgreSQL, por lo que:

- no se pierde al alternar entre backends,
- no depende del contenedor que atendió la última petición,
- y permanece mientras el volumen `db_data` siga existiendo.

---

## Problemas comunes

### 1. El navegador muestra error 502

Verifica que todos los contenedores estén levantados:

```bash
docker-compose ps
```

Si es necesario, reinicia todo:

```bash
docker-compose down

docker-compose up --build
```

### 2. El login funciona pero el CRUD no responde

Revisa que el token esté presente en el encabezado `Authorization`.

### 3. Los datos parecen distintos entre peticiones

Eso no debería pasar con la versión actual, porque todos los backends comparten PostgreSQL. Si ocurre, revisa el estado de la base y vuelve a levantar los contenedores.

---

## Archivos principales

- [backend/app.js](backend/app.js)
- [backend/views.html](backend/views.html)
- [backend/package.json](backend/package.json)
- [nginx/nginx.conf](nginx/nginx.conf)
- [docker-compose.yml](docker-compose.yml)

---

## Conclusión

Este proyecto demuestra una solución completa y simple para integrar:

- autenticación con JWT,
- operaciones CRUD,
- persistencia con PostgreSQL,
- balanceo de carga con Nginx,
- y ejecución reproducible con Docker.

Es una base útil para trabajos académicos, pruebas de arquitectura y demos técnicas.

---

## Créditos

- Desarrollado con apoyo de GitHub Copilot.
