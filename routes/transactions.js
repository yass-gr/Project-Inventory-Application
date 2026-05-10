import express from "express";
import getTransactions from "../controllers/getTransactions.js";
import { showTransactionForm, createTransaction, updateTransaction, deleteTransaction } from "../controllers/transactionActions.js";

const transactionsRouter = express.Router();

transactionsRouter.get("/", getTransactions);
transactionsRouter.get("/add", showTransactionForm);
transactionsRouter.get("/edit/:id", showTransactionForm);
transactionsRouter.post("/", createTransaction);
transactionsRouter.put("/:id", updateTransaction);
transactionsRouter.delete("/:id", deleteTransaction);

export default transactionsRouter;
