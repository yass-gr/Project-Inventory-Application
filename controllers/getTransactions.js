import db from "../db/db.js";

export default async function getTransactions(req, res) {
  const result = await db.getTransactions();
  const resultFiltred = await db.getTransactionsFiltered(req.query);
  res.render("transactions", {
    transactions: result.rows,
    filtred: resultFiltred.rows,
    query: req.query,
  });
}
