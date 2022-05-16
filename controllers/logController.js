const DB = require('../DB/db');
require('dotenv').config();

class LogController {
    async getLog(req, res) {
        try{
            const logs = await DB.query("SELECT * FROM log_entry")
            res.json(logs.rows)
        } catch(e){
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async createLog(req, res) {
        try {
            const {title, description, latitude, longitude, visit} = req.body
            const userId = req.user.id
            const createdAt = new Date().toISOString();
            const log = await DB.query(`INSERT INTO log_entry (title, description, latitude, longitude, created_at, user_id, visit) 
                values ($1,$2,$3,$4,$5,$6,$7)`,
                [title, description, latitude, longitude, createdAt, userId, visit])
            const logs = await DB.query("SELECT * FROM log_entry")
            res.json(logs.rows)
        } catch (error) {
            res.send({message: "Server error"})
        }
    }
}

module.exports = new LogController()