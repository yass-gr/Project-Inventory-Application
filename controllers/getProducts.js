import { getProducts as getProductsDb, getProductsFiltred } from "../db/products.js";

export default async function getProducts(req, res) {
  const result = await getProductsDb();
  const resultFiltred = await getProductsFiltred(req.query);

  res.render("products", {
    products: result.rows,
    filtred: resultFiltred.rows,
    query: req.query,
  });
}
