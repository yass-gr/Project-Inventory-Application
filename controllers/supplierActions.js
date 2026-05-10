import { getSupplier, createSupplier as createSupplierDb, updateSupplier as updateSupplierDb, deleteSupplier as deleteSupplierDb } from "../db/suppliers.js";

export async function showSupplierForm(req, res) {
  if (req.params.id) {
    const result = await getSupplier(req.params.id);
    const supplier = result.rows[0];
    res.render("supplier-form", { mode: "edit", supplier });
  } else {
    res.render("supplier-form", { mode: "add", supplier: null });
  }
}

export async function createSupplier(req, res) {
  const { name } = req.body;
  await createSupplierDb({ name });
  res.redirect("/suppliers");
}

export async function updateSupplier(req, res) {
  const { name } = req.body;
  await updateSupplierDb(req.params.id, { name });
  res.redirect("/suppliers");
}

export async function deleteSupplier(req, res) {
  await deleteSupplierDb(req.params.id);
  res.redirect("/suppliers");
}
