import { getTransaction, createTransaction as createTransactionDb, updateTransaction as updateTransactionDb, deleteTransaction as deleteTransactionDb } from "../db/transactions.js";
import { getProducts } from "../db/products.js";

export async function showTransactionForm(req, res) {
  const products = await getProducts();
  if (req.params.id) {
    const result = await getTransaction(req.params.id);
    const transaction = result.rows[0];
    res.render("transaction-form", { mode: "edit", transaction, products: products.rows });
  } else {
    res.render("transaction-form", { mode: "add", transaction: null, products: products.rows });
  }
}

export async function createTransaction(req, res) {
  const { type, date, location, note, idproduct, qty } = req.body;
  await createTransactionDb({ type, date, location, note, idproduct: Number(idproduct), qty: Number(qty) });
  res.redirect("/transactions");
}

export async function updateTransaction(req, res) {
  const { type, date, location, note, idproduct, qty } = req.body;
  await updateTransactionDb(req.params.id, { type, date, location, note, idproduct: Number(idproduct), qty: Number(qty) });
  res.redirect("/transactions");
}

export async function deleteTransaction(req, res) {
  await deleteTransactionDb(req.params.id);
  res.redirect("/transactions");
}
