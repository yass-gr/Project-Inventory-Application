import pool from "./pool.js";

export const getSuppliersFiltred = async (query) => {
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

export const getSuppliers = async () => {
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

export const getSupplier = async (id) => {
  const queryString = `
    SELECT
    supplier.name AS supplier,
    supplier.id AS id,
    supplier.archived AS archived
    FROM supplier
    WHERE supplier.id = $1;`;
  return await pool.query(queryString, [id]);
};

export const createSupplier = async (data) => {
  const { name } = data;
  const queryString = `INSERT INTO supplier (name) VALUES ($1);`;
  return await pool.query(queryString, [name]);
};

export const updateSupplier = async (id, data) => {
  const { name } = data;
  const queryString = `UPDATE supplier SET name = $1 WHERE id = $2;`;
  return await pool.query(queryString, [name, id]);
};

export const deleteSupplier = async (id) => {
  const queryString = `UPDATE supplier SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};
