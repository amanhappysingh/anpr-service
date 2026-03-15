require("dotenv").config();
const express = require("express");
const http = require("http");

const vehicleRoutes = require("./routes/vehicle.routes");
const reportRoutes = require("./routes/report.route");
const emailRoutes = require("./routes/email.routs");
const authRoutes = require("./routes/auth.routs");
const registrationRoutes = require("./routes/vechile.registration.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const { startCron } = require("./services/cron.service");
const { initWebSocket } = require("./websocket");   
const path = require("path");



const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

// ─── ROUTES ─────────────────────────────
app.use("/uploads", express.static("uploads"));
app.use("/api", vehicleRoutes);
app.use("/api", reportRoutes);
app.use("/api", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api", emailRoutes);
app.use("/api", dashboardRoutes);

// ─── CRON JOB ───────────────────────────

startCron();

// ─── HTTP SERVER (FOR WEBSOCKET) ────────

const server = http.createServer(app);

// initialize websocket
initWebSocket(server);

// ─── START SERVER ───────────────────────

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Node running on", PORT);
});