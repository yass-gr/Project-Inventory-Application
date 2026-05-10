import { getSuppliers as getSuppliersDb, getSuppliersFiltred } from "../db/suppliers.js";

export default async function getSuppliers(req, res) {
  const result = await getSuppliersDb();
  const resultFiltred = await getSuppliersFiltred(req.query);
  res.render("suppliers", {
    suppliers: result.rows,
    filtred: resultFiltred.rows,
    query: req.query,
  });
}
