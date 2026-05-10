import db from "../db/db.js";

export async function showSupplierForm(req, res) {
  if (req.params.id) {
    const result = await db.getSupplier(req.params.id);
    const supplier = result.rows[0];
    res.render("supplier-form", { mode: "edit", supplier });
  } else {
    res.render("supplier-form", { mode: "add", supplier: null });
  }
}

export async function createSupplier(req, res) {
  const { name } = req.body;
  await db.createSupplier({ name });
  res.redirect("/suppliers");
}

export async function updateSupplier(req, res) {
  const { name } = req.body;
  await db.updateSupplier(req.params.id, { name });
  res.redirect("/suppliers");
}

export async function deleteSupplier(req, res) {
  await db.deleteSupplier(req.params.id);
  res.redirect("/suppliers");
}
