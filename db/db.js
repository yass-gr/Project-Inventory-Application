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
export default { getProducts, getProductsFiltred };
