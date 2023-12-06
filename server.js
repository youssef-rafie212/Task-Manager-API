import dotenv from "dotenv";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION , SERVER CLOSING DOWN ...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
import app from "./app.js";

mongoose.connect(process.env.DB).then(() => {
  console.log("DB connected");
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION , SERVER CLOSING DOWN ...");
  server.close(() => {
    process.exit(1);
  });
});
