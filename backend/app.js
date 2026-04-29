
const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SECRET = "12345";

let users = [{ username: "admin", password: "123" }];
let items = [];

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
app.get("/items", auth, (req, res) => {
  res.json({ total: items.length, data: items });
});

app.post("/items", auth, (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "El campo 'name' es obligatorio" });
  }

  const item = { id: Date.now(), name: name.trim() };
  items.push(item);
  res.status(201).json({ msg: "Item creado", data: item });
});

app.put("/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "El campo 'name' es obligatorio" });
  }

  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ msg: "Item no encontrado" });
  }

  items[index] = { ...items[index], name: name.trim() };
  res.json({ msg: "Item actualizado", data: items[index] });
});

app.delete("/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ msg: "Item no encontrado" });
  }

  const deleted = items[index];
  items = items.filter(i => i.id !== id);
  res.json({ msg: "Item eliminado", data: deleted });
});

// TEST

// Vista principal (frontend simple)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views.html"));
});

app.listen(PORT, () => console.log("Running " + PORT));
