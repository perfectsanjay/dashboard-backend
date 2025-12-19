import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 5000;

// we have to store this secret key into the env file but for assingment i am doint it here
const JWT_SECRET = "super_secret_key";

app.use(cors());
app.use(express.json());


const users = [
  { id: 1, username: "admin", password: "admin123", name: "Admin User" },
  { id: 2, username: "user", password: "user123", name: "Regular User" },
];


const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

 
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user; 
    next();
  });
};


app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = generateToken(user);

  return res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name },
  });
});


app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Protected dashboard data",
    user: req.user,
    stats: {
      users: 120,
      sales: 3400,
      revenue: "$12,000",
    },
    notifications: ["Welcome to the dashboard!", "New updates available."],
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
