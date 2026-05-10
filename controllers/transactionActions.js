import db from "../db/db.js";

export async function showTransactionForm(req, res) {
  const products = await db.getProducts();
  if (req.params.id) {
    const result = await db.getTransaction(req.params.id);
    const transaction = result.rows[0];
    res.render("transaction-form", { mode: "edit", transaction, products: products.rows });
  } else {
    res.render("transaction-form", { mode: "add", transaction: null, products: products.rows });
  }
}

export async function createTransaction(req, res) {
  const { type, date, location, note, idproduct, qty } = req.body;
  await db.createTransaction({ type, date, location, note, idproduct: Number(idproduct), qty: Number(qty) });
  res.redirect("/transactions");
}

export async function updateTransaction(req, res) {
  const { type, date, location, note, idproduct, qty } = req.body;
  await db.updateTransaction(req.params.id, { type, date, location, note, idproduct: Number(idproduct), qty: Number(qty) });
  res.redirect("/transactions");
}

export async function deleteTransaction(req, res) {
  await db.deleteTransaction(req.params.id);
  res.redirect("/transactions");
}
