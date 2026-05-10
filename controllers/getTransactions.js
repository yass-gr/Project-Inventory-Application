import { getTransactions as getTransactionsDb, getTransactionsFiltered } from "../db/transactions.js";

export default async function getTransactions(req, res) {
  const result = await getTransactionsDb();
  const resultFiltred = await getTransactionsFiltered(req.query);
  res.render("transactions", {
    transactions: result.rows,
    filtred: resultFiltred.rows,
    query: req.query,
  });
}
