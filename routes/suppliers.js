import express from "express";
import getSuppliers from "../controllers/getSuppliers.js";

const suppliersRouter = express.Router();

suppliersRouter.get("/", getSuppliers);

export default suppliersRouter;
