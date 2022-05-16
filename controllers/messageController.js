const DB = require('../DB/db');
const Uuid = require('uuid')
const fs = require('fs')
require('dotenv').config();

class MessageController {
    async sendMessage(req, res) {
        try {
            const { conversationId, text } = req.body
            const sender = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            const createdAt = new Date().toISOString();
            if (!sender.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            await DB.query(`INSERT INTO message (conversation_id, sender, text, created_at) values ($1,$2,$3,$4)`,
                [conversationId, sender.rows[0].id, text, createdAt])
            const messages = await DB.query(`SELECT * FROM message WHERE conversation_id=$1`,[conversationId])
            return res.json({messages: messages.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Send message error"})
        }
    }

    async getMessages(req, res) {
        try {
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const messages = await DB.query(`SELECT * FROM message WHERE sender=$1`,[user.rows[0].id])
            return res.json({messages: messages.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async getMessagesByRoomId(req, res) {
        try {
            const {roomId} = req.body;
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const messages = await DB.query(`SELECT * FROM message WHERE conversation_id=$1`,[roomId])
            return res.json({messages: messages.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    
}

module.exports = new MessageController()