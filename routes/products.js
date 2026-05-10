import express from "express";
import getProducts from "../controllers/getProducts.js";
import { showProductForm, createProduct, updateProduct, deleteProduct } from "../controllers/productActions.js";

const productsRouter = express.Router();

productsRouter.get("/", getProducts);
productsRouter.get("/add", showProductForm);
productsRouter.get("/edit/:id", showProductForm);
productsRouter.post("/", createProduct);
productsRouter.put("/:id", updateProduct);
productsRouter.delete("/:id", deleteProduct);

export default productsRouter;
