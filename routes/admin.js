import express from "express";
import { getAdmin, postAdmin } from "../controllers/getAdmin.js";

const adminRouter = express.Router();

adminRouter.get("/", getAdmin);
adminRouter.post("/", postAdmin);

export default adminRouter;
