import express from "express";
import userRouter from "./Routes/user.js";
import { connectMongoDb } from "./Connection.js";
import { logReqRes } from "./Middlewares/index.js";

const app = express();
const port = 8000;

// Connection
connectMongoDb("mongodb://127.0.0.1:27017/UserDoc")
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Error", err));

// Middleware - builtIn - plugins
app.use(express.urlencoded({ extended: false })); // this will call the next in the stack after processing the request. in these case logs middleware is next if its not then routes

// Middleware custom
app.use(logReqRes("./logs.txt"));

// Routes
app.use("/api/users", userRouter);

app.listen(port, () => console.log("server is running on port " + port));
