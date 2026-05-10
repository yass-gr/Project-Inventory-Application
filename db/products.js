import pool from "./pool.js";

export const getProductsFiltred = async (query) => {
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

export const getProducts = async () => {
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

export const getProduct = async (id) => {
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

export const createProduct = async (data) => {
  const { name, type, qty, price, idsupplier } = data;
  const queryString = `
    INSERT INTO product (name, type, qty, price, idsupplier)
    VALUES ($1, $2, $3, $4, $5);
  `;
  return await pool.query(queryString, [name, type, qty, price, idsupplier]);
};

export const updateProduct = async (id, data) => {
  const { name, type, qty, price, idsupplier } = data;
  const queryString = `
    UPDATE product
    SET name = $1, type = $2, qty = $3, price = $4, idsupplier = $5
    WHERE id = $6;
  `;
  return await pool.query(queryString, [name, type, qty, price, idsupplier, id]);
};

export const deleteProduct = async (id) => {
  const queryString = `UPDATE product SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};
