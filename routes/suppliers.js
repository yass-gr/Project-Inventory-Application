import express from "express";
import getSuppliers from "../controllers/getSuppliers.js";
import { showSupplierForm, createSupplier, updateSupplier, deleteSupplier } from "../controllers/supplierActions.js";

const suppliersRouter = express.Router();

suppliersRouter.get("/", getSuppliers);
suppliersRouter.get("/add", showSupplierForm);
suppliersRouter.get("/edit/:id", showSupplierForm);
suppliersRouter.post("/", createSupplier);
suppliersRouter.put("/:id", updateSupplier);
suppliersRouter.delete("/:id", deleteSupplier);

export default suppliersRouter;
