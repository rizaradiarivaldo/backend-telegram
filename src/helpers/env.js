require("dotenv").config();

const env = {
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  privatekey: process.env.PRIVATEKEY
};

module.exports = env;