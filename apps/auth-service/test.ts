import express from "express";

const app = express();
const PORT = 3001;

console.log("Starting server...");

app.get("/api/health", (req, res) => {
  console.log("Health check called");
  res.json({
    success: true,
    message: "Auth Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
});
