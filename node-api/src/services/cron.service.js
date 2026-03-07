const cron = require("node-cron");
const reportService = require("./report.service");
const mailService = require("./mail.service");

exports.startCron = () => {
  cron.schedule(
    "0 18 * * *",
    async () => {
      try {
        console.log("Running 6 PM Cron...");

        const buffer = await reportService.generateCronReport();

        await mailService.sendMail(
          "6PM Daily Vehicle Report",
          "Report from previous 6PM to current 6PM",
          {
            filename: "6pm-report.xlsx",
            content: buffer,
          }
        );

        console.log("Cron Report Sent");
      } catch (err) {
        console.error("Cron error:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
};