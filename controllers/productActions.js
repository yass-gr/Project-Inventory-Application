import db from "../db/db.js";

export async function showProductForm(req, res) {
  const suppliers = await db.getSuppliers();
  if (req.params.id) {
    const result = await db.getProduct(req.params.id);
    const product = result.rows[0];
    res.render("product-form", { mode: "edit", product, suppliers: suppliers.rows });
  } else {
    res.render("product-form", { mode: "add", product: null, suppliers: suppliers.rows });
  }
}

export async function createProduct(req, res) {
  const { name, type, price, qty, idsupplier } = req.body;
  await db.createProduct({ name, type, qty: Number(qty), price: Number(price), idsupplier: Number(idsupplier) });
  res.redirect("/products");
}

export async function updateProduct(req, res) {
  const { name, type, price, qty, idsupplier } = req.body;
  await db.updateProduct(req.params.id, { name, type, qty: Number(qty), price: Number(price), idsupplier: Number(idsupplier) });
  res.redirect("/products");
}

export async function deleteProduct(req, res) {
  await db.deleteProduct(req.params.id);
  res.redirect("/products");
}
