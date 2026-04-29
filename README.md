# 🟢 Login + CRUD + Balanceo de carga con Docker

## Descripción

Este proyecto es una demo simple de un sistema de autenticación (LOGIN con JWT) y CRUD de items, desplegado en 3 instancias de backend Node.js, balanceadas con Nginx usando Docker Compose.

- **Backend:** Node.js + Express (login y CRUD)
- **Base de datos compartida:** PostgreSQL (una sola para los 3 backends)
- **Frontend:** HTML simple (en `/`)
- **Balanceo:** Nginx (Round Robin)
- **Orquestación:** Docker Compose

### ¿Por qué antes se veía "una base distinta"?

Porque el CRUD estaba guardando en memoria (`let items = []`) dentro de cada contenedor.

- Backend1 tenía su propio arreglo.
- Backend2 tenía otro arreglo distinto.
- Backend3 otro más.

Como Nginx reparte peticiones entre los 3, parecía que los datos "cambiaban" o desaparecían.

Ahora el CRUD usa **PostgreSQL único** (`db`) y los 3 backends leen/escriben en la misma base.

---

## 📁 Estructura del proyecto

```text
project/
│
├── backend/
│   ├── app.js           # Backend Express (API + vistas)
│   ├── package.json     # Dependencias
│   ├── Dockerfile       # Imagen backend
│   └── views.html       # Frontend simple
│
├── db/                  # Servicio PostgreSQL (definido en compose)
│
├── nginx/
│   └── nginx.conf       # Configuración de Nginx
│
└── docker-compose.yml   # Orquestación de servicios
```

---

## 🚀 Cómo ejecutar

1. **Clona el repositorio y entra a la carpeta:**

```bash
cd Semana0-7Nube
```

1. **Levanta todo con Docker Compose:**

```bash
docker-compose up --build
```

1. **Abre tu navegador en:**

```text
http://localhost
```

---

## 🔐 Login de prueba

- **Usuario:** `admin`
- **Contraseña:** `123`

---

## 🧪 Pruebas rápidas

### Login (obtener token)

```bash
curl -X POST http://localhost/login \
-H "Content-Type: application/json" \
-d '{"username":"admin","password":"123"}'
```

### CRUD (requiere token)

```bash
curl http://localhost/items -H "Authorization: TU_TOKEN"
```

Crear item:

```bash
curl -X POST http://localhost/items \
-H "Content-Type: application/json" \
-H "Authorization: TU_TOKEN" \
-d '{"name":"Laptop"}'
```

Editar item:

```bash
curl -X PUT http://localhost/items/ID_ITEM \
-H "Content-Type: application/json" \
-H "Authorization: TU_TOKEN" \
-d '{"name":"Laptop Gamer"}'
```

Eliminar item:

```bash
curl -X DELETE http://localhost/items/ID_ITEM \
-H "Authorization: TU_TOKEN"
```

---

## ⚖️ Balanceo de carga

Nginx distribuye las peticiones entre 3 instancias del backend usando Round Robin.

- Puedes probarlo recargando la página varias veces o usando:

```bash
curl http://localhost/
```

Verás que la respuesta alterna entre los 3 backends.

---

## 🖥️ Frontend visual

- Accede a `http://localhost` para usar la interfaz web:
  - Login
  - Crear, editar y eliminar items

### Flujo del CRUD explicado simple

1. Inicia sesión con `admin / 123`.
2. En el campo "Nombre del item", escribe un nombre y pulsa "Crear item".
3. El item aparece en la tabla con su ID.
4. Pulsa "Editar" en una fila para cargar ese item en el formulario.
5. Cambia el nombre y pulsa "Guardar cambios".
6. Pulsa "Eliminar" para borrar el item (con confirmación).

La caja de estado te muestra mensajes como "Item creado", "Item actualizado" o "Item eliminado".

---

## 🔎 Endpoints del backend (resumen)

- `POST /login`
  - Body: `{ "username": "admin", "password": "123" }`
  - Respuesta: `{ "token": "..." }`

- `GET /items`
  - Header: `Authorization: TU_TOKEN`
  - Respuesta: `{ "total": number, "data": [...] }`

- `POST /items`
  - Header: `Authorization: TU_TOKEN`
  - Body: `{ "name": "Texto" }`
  - Respuesta: `{ "msg": "Item creado", "data": { ... } }`

- `PUT /items/:id`
  - Header: `Authorization: TU_TOKEN`
  - Body: `{ "name": "Nuevo texto" }`
  - Respuesta: `{ "msg": "Item actualizado", "data": { ... } }`

- `DELETE /items/:id`
  - Header: `Authorization: TU_TOKEN`
  - Respuesta: `{ "msg": "Item eliminado", "data": { ... } }`

---

## 📦 Servicios en Docker Compose

- **backend1, backend2, backend3:** Instancias del backend Node.js
- **db:** PostgreSQL compartido
- **nginx:** Balanceador de carga

---

## 📝 Explicación del balanceo

El flujo es:

1. El cliente (navegador/curl) hace peticiones a Nginx (`localhost:80`).
2. Nginx reenvía cada petición a uno de los 3 backends disponibles (Round Robin).
3. Cada backend responde de forma independiente.

![Diagrama de balanceo](adjunta-tu-diagrama.png)

---

## 🛑 Notas

- Todo es **stateless**: los items y usuarios se guardan en memoria (se pierden al reiniciar contenedores).
- El frontend es solo para pruebas rápidas.
- Puedes modificar y extender el backend según tus necesidades.

---

## 📚 Créditos

- Plantilla y guía generada por GitHub Copilot (GPT-5.3-Codex)
