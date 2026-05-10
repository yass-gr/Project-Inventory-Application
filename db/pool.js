import { Pool } from "pg";

export default new Pool({
  connectionString: process.env.DB_LINK,
  ssl: {
    rejectUnauthorized: false,
  },
});
