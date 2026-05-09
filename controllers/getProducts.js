import dotenv from "dotenv";
import db from "../db/db.js";

export default async function getProducts(req, res) {
  const products = await db.getProducts();

  res.render("products", { products: products });
}
