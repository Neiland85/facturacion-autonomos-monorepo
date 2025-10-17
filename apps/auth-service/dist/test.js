import express from "express";
const app = express();
const PORT = 3001;
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Auth Service is healthy",
        timestamp: new Date().toISOString(),
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Auth Service running on port ${PORT}`);
});
