import "dotenv/config";
import express from "express";

import productsRouter from "./routes/products.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use("/products", productsRouter);

app.listen(PORT, () => {
  console.log(`listening at ${PORT} ...`);
});
