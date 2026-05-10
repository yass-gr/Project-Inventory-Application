import db from "../db/db.js";

export default async function getProducts(req, res) {
  const result = await db.getSuppliers();
  const resultFiltred = await db.getSuppliersFiltred(req.query);
  res.render("suppliers", {
    suppliers: result.rows,
    filtred: resultFiltred.rows,
  });
}
