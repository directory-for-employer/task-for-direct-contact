import express from "express";
import { routes } from "./routes";
import cookieParser from "cookie-parser";

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", routes);
app.get("/", (request, response) => {
  response.send("Hello world!");
});

app.listen(port, () => console.log(`Running on port ${port}`));
