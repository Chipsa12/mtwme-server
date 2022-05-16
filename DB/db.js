require('dotenv').config();
const Pool = require('pg').Pool;
const userDB = process.env.USER_DB;
const passwordDB = process.env.PASSWORD_DB;
const hostDB = process.env.HOST_DB;
const portDB = process.env.PORT_DB;
const db = process.env.DB;
const pool = new Pool({
    user: userDB,
    password: passwordDB,
    host: hostDB,
    port: portDB,
    database: db
})

module.exports = pool