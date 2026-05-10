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

  let queryString = `
    SELECT 
    product.name AS name, 
    product.id AS id,
    product.type AS type,
    product.qty AS qty,
    product.price AS price,
    supplier.name AS supplier
    FROM product JOIN supplier
    ON product.idsupplier = supplier.id
    `;
  let additions = "WHERE";

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

  let queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    count(product.id) AS products_supplied
    FROM supplier LEFT JOIN product 
    ON supplier.id = product.idsupplier 
    GROUP BY supplier.id, supplier.name
    `;
  let additions = "HAVING";

  if (availabilityQuery)
    additions += `${additions === "HAVING" ? "" : "AND"} ${availabilityQuery}`;
  if (nameQuery)
    additions += `${additions === "HAVING" ? "" : "AND"} ${nameQuery}`;

  if (additions !== "HAVING") {
    additions += ";";
    queryString += additions;
  }
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
    ;`;
  const data = await pool.query(queryString);
  return data;
};
const getSuppliers = async () => {
  const queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    count(product.id) AS products_supplied
    FROM supplier LEFT JOIN product 
    ON supplier.id = product.idsupplier 
    GROUP BY supplier.id, supplier.name;
    ;`;
  const data = await pool.query(queryString);
  return data;
};

const getTransactionsFiltered = async (query) => {
  let paramsCounter = 1;
  const fromQuery = query.from ? ` t.date >= $${paramsCounter++} ` : "";
  const toQuery = query.to ? ` t.date <= $${paramsCounter++} ` : "";

  let queryString = `
    SELECT
    t.id AS id,
    t.type AS type,
    t.date AS date,
    t.location AS location,
    t.note AS note,
    SUM(p.price * ti.qty) AS value,
    COUNT(ti.id) AS items
    FROM transaction t
    JOIN transaction_items ti ON ti.idtransaction = t.id
    JOIN product p ON p.id = ti.idproduct
    `;

  let additions = "WHERE";

  if (fromQuery)
    additions += `${additions === "WHERE" ? "" : " AND"} ${fromQuery}`;
  if (toQuery) additions += `${additions === "WHERE" ? "" : " AND"} ${toQuery}`;

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
    SUM(p.price * ti.qty) AS value,
    COUNT(ti.id) AS items
    FROM transaction t
    JOIN transaction_items ti ON ti.idtransaction = t.id
    JOIN product p ON p.id = ti.idproduct
    GROUP BY t.id, t.type, t.date, t.location, t.note;
    `;
  const data = await pool.query(queryString);
  return data;
};
export default {
  getProducts,
  getProductsFiltred,
  getSuppliers,
  getSuppliersFiltred,
  getTransactions,
  getTransactionsFiltered,
};
