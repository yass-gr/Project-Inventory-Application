import pool from "./pool.js";

export const getTransactionsFiltered = async (query) => {
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

export const getTransactions = async () => {
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

export const getTransaction = async (id) => {
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

export const createTransaction = async (data) => {
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

export const updateTransaction = async (id, data) => {
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

export const deleteTransaction = async (id) => {
  const queryString = `UPDATE transaction SET archived = NOT archived WHERE id = $1;`;
  return await pool.query(queryString, [id]);
};
