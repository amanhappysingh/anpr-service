require("dotenv").config();
const express = require("express");
const vehicleRoutes = require("./routes/vehicle.routes");
const reportRoutes = require("./routes/report.route");
const emailRoutes = require("./routes/email.routs");
const authRoutes = require("./routes/auth.routs");
const { startCron } = require("./services/cron.service");
const registrationRoutes = require("./routes/vechile.registration.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const cors = require("cors");




const app = express();

app.use(cors()); // simplest and safest for dev

 // handle preflight requests

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api", vehicleRoutes);
app.use("/api", reportRoutes);
app.use("/api", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api", emailRoutes );
app.use("/api", dashboardRoutes);


startCron();

app.listen(process.env.PORT, () => {
  console.log("Node running on", process.env.PORT || 5000);
});