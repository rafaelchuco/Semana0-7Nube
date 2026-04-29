
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
  res.json(items);
});

app.post("/items", auth, (req, res) => {
  const item = { id: Date.now(), ...req.body };
  items.push(item);
  res.json(item);
});

app.put("/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  items = items.map(i => i.id === id ? { ...i, ...req.body } : i);
  res.json({ msg: "Actualizado" });
});

app.delete("/items/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);
  items = items.filter(i => i.id !== id);
  res.json({ msg: "Eliminado" });
});

// TEST

// Vista principal (frontend simple)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views.html"));
});

app.listen(PORT, () => console.log("Running " + PORT));
