const DB = require('../DB/db');
require('dotenv').config();

class ConversationController {
    async createConversation(req, res) {
        try {
            const { senderId, receiverId } = req.body
            const sender = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!sender.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const currentConversation = await DB.query(`INSERT INTO conversation (members) values ($1) RETURNING *`,[`{${senderId},${receiverId}}`])
            const conversations = await DB.query(`SELECT * FROM conversation`)
            return res.json({
                conversations: conversations.rows, 
                currentConversation: {id: currentConversation.rows[0].id, members: currentConversation.rows[0].members} 
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async getConversations(req, res) {
        try {
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const conversations = await DB.query(`SELECT * FROM conversation`)
            return res.json({conversations: conversations.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }
}

module.exports = new ConversationController()