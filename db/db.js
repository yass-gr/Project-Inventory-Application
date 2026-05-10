import pool from "./pool.js";

const getProductsFiltred = async (query) => {
  let paramsCounter = 1;
  let availabilityQuery = "";
  switch (query.availability) {
    case "on":
      availabilityQuery = " qty > 0 ";
      break;
    case "out":
      availabilityQuery = " qty = 0 ";
      break;
  }

  const nameQuery = query.name
    ? ` product.name ILIKE $${paramsCounter++} `
    : "";

  const typeQuery = query.type ? ` product.type = $${paramsCounter++} ` : "";

  const supplierQuery = query.supplier
    ? ` supplier.name = $${paramsCounter++} `
    : "";

  const archivedQuery = query.showArchived !== "true"
    ? " product.archived IS NOT TRUE "
    : "";

  let queryString = `
    SELECT 
    product.name AS name, 
    product.id AS id,
    product.type AS type,
    product.qty AS qty,
    product.price AS price,
    product.archived AS archived,
    supplier.name AS supplier
    FROM product JOIN supplier
    ON product.idsupplier = supplier.id
    `;
  let additions = "WHERE";

  if (archivedQuery)
    additions += ` ${archivedQuery}`;
  if (availabilityQuery)
    additions += `${additions === "WHERE" ? "" : "AND"} ${availabilityQuery}`;
  if (nameQuery)
    additions += `${additions === "WHERE" ? "" : "AND"} ${nameQuery}`;
  if (typeQuery)
    additions += `${additions === "WHERE" ? "" : "AND"} ${typeQuery}`;
  if (supplierQuery)
    additions += `${additions === "WHERE" ? "" : "AND"} ${supplierQuery}`;

  if (additions !== "WHERE") {
    additions += ";";
    queryString += additions;
  }
  let parameters = [];

  if (nameQuery) parameters.push(`%${query.name}%`);
  if (typeQuery) parameters.push(query.type);
  if (supplierQuery) parameters.push(query.supplier);

  const data = await pool.query(queryString, parameters);
  return data;
};

const getSuppliersFiltred = async (query) => {
  let availabilityQuery = "";
  switch (query.availability) {
    case "on":
      availabilityQuery = " count(product.id) > 0 ";
      break;
    case "out":
      availabilityQuery = " count(product.id) = 0 ";
      break;
  }

  const nameQuery = query.name ? ` supplier.name ILIKE $1 ` : "";
  const archivedQuery = query.showArchived !== "true" ? " supplier.archived IS NOT TRUE " : "";

  let queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    supplier.archived AS archived,
    count(product.id) AS products_supplied
    FROM supplier LEFT JOIN product 
    ON supplier.id = product.idsupplier 
    `;

  const whereParts = [archivedQuery, nameQuery].filter(c => c);
  if (whereParts.length > 0) {
    queryString += " WHERE " + whereParts.join(" AND ");
  }

  queryString += " GROUP BY supplier.id, supplier.name";

  if (availabilityQuery) {
    queryString += " HAVING " + availabilityQuery;
  }

  queryString += ";";

  let parameters = [];
  if (nameQuery) parameters.push(`%${query.name}%`);

  const data = await pool.query(queryString, parameters);
  return data;
};

const getProducts = async () => {
  const queryString = `
    SELECT 
    product.name AS name, 
    product.id AS id,
    product.type AS type,
    product.qty AS qty,
    product.price AS price,
    supplier.name AS supplier
    FROM product JOIN supplier
    ON product.idsupplier = supplier.id
    WHERE product.archived IS NOT TRUE;`;
  const data = await pool.query(queryString);
  return data;
};
const getSuppliers = async () => {
  const queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    supplier.archived AS archived,
    count(product.id) AS products_supplied
    FROM supplier LEFT JOIN product 
    ON supplier.id = product.idsupplier 
    WHERE supplier.archived IS NOT TRUE
    GROUP BY supplier.id, supplier.name;`;
  const data = await pool.query(queryString);
  return data;
};

const getTransactionsFiltered = async (query) => {
  let paramsCounter = 1;
  const fromQuery = query.from ? ` t.date >= $${paramsCounter++} ` : "";
  const toQuery = query.to ? ` t.date <= $${paramsCounter++} ` : "";

  const archivedQuery = query.showArchived !== "true"
    ? " t.archived IS NOT TRUE "
    : "";

  let queryString = `
    SELECT
    t.id AS id,
    t.type AS type,
    t.date AS date,
    t.location AS location,
    t.note AS note,
    t.archived AS archived,
    SUM(p.price * ti.qty) AS value,
    COUNT(ti.id) AS items
    FROM transaction t
    JOIN transaction_items ti ON ti.idtransaction = t.id
    JOIN product p ON p.id = ti.idproduct
    `;

  let additions = "WHERE";

  if (archivedQuery)
    additions += ` ${archivedQuery}`;
  if (fromQuery)
    additions += `${additions === "WHERE" ? "" : " AND"} ${fromQuery}`;
  if (toQuery)
    additions += `${additions === "WHERE" ? "" : " AND"} ${toQuery}`;

  if (additions !== "WHERE") {
    queryString += additions;
  }

  queryString += ` GROUP BY t.id, t.type, t.date, t.location, t.note;`;

  let parameters = [];
  if (fromQuery) parameters.push(query.from);
  if (toQuery) parameters.push(query.to);

  const data = await pool.query(queryString, parameters);
  return data;
};

const getTransactions = async () => {
  const queryString = `
    SELECT
    t.id AS id,
    t.type AS type,
    t.date AS date,
    t.location AS location,
    t.note AS note,
    t.archived AS archived,
    SUM(p.price * ti.qty) AS value,
    COUNT(ti.id) AS items
    FROM transaction t
    JOIN transaction_items ti ON ti.idtransaction = t.id
    JOIN product p ON p.id = ti.idproduct
    WHERE t.archived IS NOT TRUE
    GROUP BY t.id, t.type, t.date, t.location, t.note;
    `;
  const data = await pool.query(queryString);
  return data;
};

const getTransaction = async (id) => {
  const queryString = `
    SELECT
    t.id AS id,
    t.type AS type,
    t.date AS date,
    t.location AS location,
    t.note AS note,
    t.archived AS archived,
    ti.idproduct AS idproduct,
    ti.qty AS qty,
    p.name AS product_name
    FROM transaction t
    LEFT JOIN transaction_items ti ON ti.idtransaction = t.id
    LEFT JOIN product p ON p.id = ti.idproduct
    WHERE t.id = $1
    LIMIT 1;`;
  return await pool.query(queryString, [id]);
};

const createTransaction = async (data) => {
  const { type, date, location, note, idproduct, qty } = data;
  const result = await pool.query(
    `INSERT INTO transaction (type, date, location, note) VALUES ($1, $2, $3, $4) RETURNING id;`,
    [type, date, location, note]
  );
  const transactionId = result.rows[0].id;
  await pool.query(
    `INSERT INTO transaction_items (idtransaction, idproduct, qty) VALUES ($1, $2, $3);`,
    [transactionId, idproduct, qty]
  );
};

const updateTransaction = async (id, data) => {
  const { type, date, location, note, idproduct, qty } = data;
  await pool.query(
    `UPDATE transaction SET type = $1, date = $2, location = $3, note = $4 WHERE id = $5;`,
    [type, date, location, note, id]
  );
  await pool.query(`DELETE FROM transaction_items WHERE idtransaction = $1;`, [id]);
  await pool.query(
    `INSERT INTO transaction_items (idtransaction, idproduct, qty) VALUES ($1, $2, $3);`,
    [id, idproduct, qty]
  );
};

const deleteTransaction = async (id) => {
  const queryString = `UPDATE transaction SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};

const getProduct = async (id) => {
  const queryString = `
    SELECT 
    product.name AS name, 
    product.id AS id,
    product.type AS type,
    product.qty AS qty,
    product.price AS price,
    product.idsupplier AS idsupplier,
    supplier.name AS supplier
    FROM product JOIN supplier
    ON product.idsupplier = supplier.id
    WHERE product.id = $1;
  `;
  return await pool.query(queryString, [id]);
};

const createProduct = async (data) => {
  const { name, type, qty, price, idsupplier } = data;
  const queryString = `
    INSERT INTO product (name, type, qty, price, idsupplier)
    VALUES ($1, $2, $3, $4, $5);
  `;
  return await pool.query(queryString, [name, type, qty, price, idsupplier]);
};

const updateProduct = async (id, data) => {
  const { name, type, qty, price, idsupplier } = data;
  const queryString = `
    UPDATE product
    SET name = $1, type = $2, qty = $3, price = $4, idsupplier = $5
    WHERE id = $6;
  `;
  return await pool.query(queryString, [name, type, qty, price, idsupplier, id]);
};

const deleteProduct = async (id) => {
  const queryString = `UPDATE product SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};

const getSupplier = async (id) => {
  const queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    supplier.archived AS archived
    FROM supplier
    WHERE supplier.id = $1;`;
  return await pool.query(queryString, [id]);
};

const createSupplier = async (data) => {
  const { name } = data;
  const queryString = `INSERT INTO supplier (name) VALUES ($1);`;
  return await pool.query(queryString, [name]);
};

const updateSupplier = async (id, data) => {
  const { name } = data;
  const queryString = `UPDATE supplier SET name = $1 WHERE id = $2;`;
  return await pool.query(queryString, [name, id]);
};

const deleteSupplier = async (id) => {
  const queryString = `UPDATE supplier SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};

export default {
  getProducts,
  getProductsFiltred,
  getSuppliers,
  getSuppliersFiltred,
  getTransactions,
  getTransactionsFiltered,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
