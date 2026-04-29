# 🟢 Login + CRUD + Balanceo de carga con Docker

## Descripción

Este proyecto es una demo simple de un sistema de autenticación (LOGIN con JWT) y CRUD de items, desplegado en 3 instancias de backend Node.js, balanceadas con Nginx usando Docker Compose.

- **Backend:** Node.js + Express (login y CRUD)
- **Frontend:** HTML simple (en `/`)
- **Balanceo:** Nginx (Round Robin)
- **Orquestación:** Docker Compose

---

## 📁 Estructura del proyecto

```
project/
│
├── backend/
│   ├── app.js           # Backend Express (API + vistas)
│   ├── package.json     # Dependencias
│   ├── Dockerfile       # Imagen backend
│   └── views.html       # Frontend simple
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

2. **Levanta todo con Docker Compose:**

```bash
docker-compose up --build
```

3. **Abre tu navegador en:**

```
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

---

## 📦 Servicios en Docker Compose

- **backend1, backend2, backend3:** Instancias del backend Node.js
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

- Plantilla y guía generada por GitHub Copilot (GPT-4.1)
