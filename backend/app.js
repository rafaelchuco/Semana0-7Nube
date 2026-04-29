
const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SECRET = "12345";
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@db:5432/appdb";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

let users = [{ username: "admin", password: "123" }];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ msg: "Credenciales incorrectas" });

  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

// MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(403);

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// CRUD
app.get("/items", auth, asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT id, name FROM items ORDER BY id ASC");
  res.json({ total: result.rows.length, data: result.rows });
}));

app.post("/items", auth, asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "El campo 'name' es obligatorio" });
  }

  const created = await pool.query(
    "INSERT INTO items(name) VALUES($1) RETURNING id, name",
    [name.trim()]
  );
  res.status(201).json({ msg: "Item creado", data: created.rows[0] });
}));

app.put("/items/:id", auth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "El campo 'name' es obligatorio" });
  }

  const updated = await pool.query(
    "UPDATE items SET name = $1 WHERE id = $2 RETURNING id, name",
    [name.trim(), id]
  );
  if (updated.rowCount === 0) {
    return res.status(404).json({ msg: "Item no encontrado" });
  }

  res.json({ msg: "Item actualizado", data: updated.rows[0] });
}));

app.delete("/items/:id", auth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  const deleted = await pool.query(
    "DELETE FROM items WHERE id = $1 RETURNING id, name",
    [id]
  );
  if (deleted.rowCount === 0) {
    return res.status(404).json({ msg: "Item no encontrado" });
  }

  res.json({ msg: "Item eliminado", data: deleted.rows[0] });
}));

// TEST

app.get("/server-info", (req, res) => {
  res.json({
    backend: process.env.HOSTNAME || "backend",
    port: PORT,
  });
});

// Vista principal (frontend simple)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: "Error interno del servidor" });
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log("Running " + PORT));
  } catch (error) {
    console.error("No se pudo iniciar la app:", error.message);
    process.exit(1);
  }
}

start();
