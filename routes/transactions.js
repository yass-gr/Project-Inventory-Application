import express from "express";
import getTransactions from "../controllers/getTransactions.js";

const transactionsRouter = express.Router();

transactionsRouter.get("/", getTransactions);

export default transactionsRouter;
