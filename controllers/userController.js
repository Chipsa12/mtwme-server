const DB = require('../DB/db');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const uniqId = require('uniqid'); 
const Uuid = require('uuid')
const fs = require('fs')
require('dotenv').config();

class UserController {
    async registration(req, res) {
        try {
            const {login, password, firstName, lastName} = req.body
            const candidate = await DB.query("SELECT * FROM users where login=$1", [login])
            if(candidate.rows[0]) {
                return res.status(400).json({message: `User with email ${login} already exist`})
            }
            const hashPassword = await bcrypt.hash(password, 4);
            const id = uniqId();
            await DB.query(`INSERT INTO users (id, login, password, name, surname, avatar) 
                            values ($1,$2,$3,$4,$5,$6)`,
                            [id, login, hashPassword, firstName, lastName, 'defaultAvatar.png'])
            res.send({
                message: "User created"
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async login(req, res) {
        try {
            const {login, password} = req.body
            const user = await DB.query("SELECT * FROM users where login=$1", [login])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const isPassValid = bcrypt.compareSync(password, user.rows[0].password)
            if (!isPassValid) {
                return res.status(400).json({message: "Invalid password"})
            }
            const token = jwt.sign({id: user.rows[0].id}, process.env.SECRET_KEY)
            await DB.query("UPDATE users SET token=$1 WHERE id=$2", [token, user.rows[0].id])
            return res.json({
                token,
                user: {
                    id: user.rows[0].id,
                    login: user.rows[0].login,
                    name: user.rows[0].name,
                    surname: user.rows[0].surname,
                    avatar: user.rows[0].avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async auth(req, res) {
        try {
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const token = jwt.sign({id: user.rows[0].id}, process.env.SECRET_KEY)
            await DB.query("UPDATE users SET token=$1 WHERE id=$2", [token, user.rows[0].id])
            return res.json({
                token,
                user: {
                    id: user.rows[0].id,
                    login: user.rows[0].login,
                    name: user.rows[0].name,
                    surname: user.rows[0].surname,
                    avatar: user.rows[0].avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async logout(req, res) {
        try {
            const {token} = req.body
            const user = await DB.query("SELECT * FROM users where token=$1", [token])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            await DB.query("UPDATE users SET token=$1 WHERE token=$2", [null, token])
            const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
            res.json({users: users.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
            if (!users.rows) {
                return res.status(404).json({message: "Users not found"})
            }
            res.json({users: users.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files.file
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const filePath = req.filePath + '\\' + user.rows[0].id;
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            }
            if (user.rows[0].avatar !== 'defaultAvatar.png') {
                fs.unlinkSync(filePath + '\\' + user.rows[0].avatar)
            }
            const avatarName = Uuid.v4() + '.jpg'
            file.mv(filePath + "\\" + avatarName)
            await DB.query("UPDATE users SET avatar=$1 WHERE id=$2", [avatarName, req.user.id])
            const updateUser = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
            return res.json({user: updateUser.rows[0], users: users.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Upload avatar error'})
        }
    }

    async deleteAvatar(req, res) {
        try {
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0].avatar) {
                await DB.query("UPDATE users SET avatar=$1 WHERE id=$2 RETURNING *", ['defaultAvatar.png', req.user.id])
                const updateUser = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
                const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
                return res.json({user: updateUser.rows[0], users: users.rows})
            }
            if (user.rows[0].avatar === 'defaultAvatar.png') {
                const updateUser = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
                const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
                return res.json({user: updateUser.rows[0], users: users.rows})
            }
            const filePath = req.filePath + '\\' + user.rows[0].id;
            fs.unlinkSync(filePath + '\\' + user.rows[0].avatar)
            await DB.query("UPDATE users SET avatar=$1 WHERE id=$2 RETURNING *", ['defaultAvatar.png', req.user.id])
            const updateUser = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            const users = await DB.query("SELECT id, login, name, surname, token, avatar FROM users")
            return res.json({user: updateUser.rows[0], users: users.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete avatar error'})
        }
    }
}

module.exports = new UserController()