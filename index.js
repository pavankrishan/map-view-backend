
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "My_key";


const users = [];


const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};


(async () => {
  const hashedPassword = await hashPassword("password");
  users.push({ username: "admin", password: hashedPassword });
  console.log("Admin user created");
})();

// Login API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (!user || !password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1d" });
  res.json({ token });
});

// Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "User not logged in" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Dashboard API
app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({ cards: [{ id: 1, name: "Card 1" }, { id: 2, name: "Card 2" }] });
});

// Map API
app.get("/api/map", authenticateToken, (req, res) => {
  res.json({ center: [20.5937, 78.9629], zoom: 5 });
});


app.listen(5000, () => console.log("Server running on port 5000"));
