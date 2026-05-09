import db from "../db/db.js";

export default async function getProducts(req, res) {
  const result = await db.getProducts();
  const resultFiltred = await db.getProductsFiltred(req.query);

  res.render("products", {
    products: result.rows,
    filtred: resultFiltred.rows,
  });
}
