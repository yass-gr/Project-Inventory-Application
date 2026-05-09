import pool from "./pool.js";
import dotenv from "dotenv";

const getProducts = async () => {
  const data = await pool.query("SELECT * FROM product;");
  return data;
};

export default { getProducts };
