const DB = require('../DB/db');
const Uuid = require('uuid')
const fs = require('fs')
require('dotenv').config();

class PostController {
    async createPost(req, res) {
        try {
            const {desc} = req.body;
            const file = req.files?.file ?? false;
            const createdAt = new Date().toISOString();
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            if (!file) {
                const post = await DB.query(`INSERT INTO posts (user_id, description, created_at) 
                            values ($1,$2,$3) RETURNING *`,
                            [user.rows[0].id, desc, createdAt])
                const posts = await DB.query("SELECT id, user_id, description, likes, post_img, created_at FROM posts")
                return res.json({posts: posts.rows, post: post.rows[0]})
            }
            const postImgName = Uuid.v4() + '.jpg'
            const filePath = req.filePath + '\\' + user.rows[0].id;
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            }
            file.mv(filePath + "\\" + postImgName)
            const post = await DB.query(`INSERT INTO posts (user_id, description, post_img, created_at) 
                            values ($1,$2,$3,$4) RETURNING *`,
                            [user.rows[0].id, desc, postImgName, createdAt])
            const posts = await DB.query("SELECT id, user_id, description, likes, post_img, created_at FROM posts")
            return res.json({posts: posts.rows, post: post.rows[0]})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Create post error'})
        }
    }

    async getPosts(req, res) {
        try {
            const posts = await DB.query("SELECT id, user_id, description, likes, post_img, created_at FROM posts")
            return res.json({posts: posts.rows})
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    }

    async deletePost(req, res) {
        try {
            const {postId} = req.body;
            const post = await DB.query("SELECT * FROM posts WHERE id=$1", [postId])
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            if (!post.rows[0]) {
                return res.status(404).json({message: "Post not found"})
            }
            if (post.rows[0].post_img) {
                fs.unlinkSync(req.filePath + '\\' + user.rows[0].id + '\\' + post.rows[0].post_img)
            }
            await DB.query("DELETE FROM posts WHERE id=$1", [post.rows[0].id])
            await DB.query("DELETE FROM comments WHERE post_id=$1", [post.rows[0].id])
            const posts = await DB.query("SELECT id, user_id, description, likes, post_img, created_at FROM posts")
            const comments = await DB.query("SELECT id, post_id, user_id, comment, created_at FROM comments")
            return res.json({posts: posts.rows, comments: comments.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete post error'})
        }
    }

    async updateLikes (req, res) {
        try {
            const {userId, postId} = req.body;
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            const post = await DB.query("SELECT * FROM posts WHERE id=$1", [postId])
            if (!post.rows[0]) {
                return res.status(404).json({message: "Post not found"})
            }
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            if (post.rows[0].likes) {
                await DB.query("UPDATE posts SET likes=$1::text || likes WHERE id=$2", [user.rows[0].id, post.rows[0].id])
            }else {
                await DB.query("UPDATE posts SET likes=$1::text || likes WHERE id=$2", [user.rows[0].id, post.rows[0].id])
            }
            const posts = await DB.query("SELECT id, user_id, description, likes, post_img, created_at FROM posts")
            return res.send({posts: posts.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Update likes error'})
        }
    }

    async addComment (req, res) {
        try {
            const { postId, comment } = req.body;
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            const post = await DB.query("SELECT * FROM posts WHERE id=$1", [postId])
            if (!post.rows[0]) {
                return res.status(404).json({message: "Post not found"})
            }
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const createdAt = new Date().toISOString();
            await DB.query(`INSERT INTO comments (post_id, user_id, comment, created_at) 
                values ($1,$2,$3,$4)`,
                [postId, user.rows[0].id, comment, createdAt]
            )
            const comments = await DB.query("SELECT id, post_id, user_id, comment, created_at FROM comments")
            return res.send({comments: comments.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Add comment error'})
        }
    }

    async getComments (req, res) {
        try {
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const comments = await DB.query("SELECT id, post_id, user_id, comment, created_at FROM comments")
            return res.send({comments: comments.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Get comments error'})
        }
    }

    async deleteComment (req, res) {
        try {
            const {commentId} = req.body;
            const user = await DB.query("SELECT * FROM users where id=$1", [req.user.id])
            if (!user.rows[0]) {
                return res.status(404).json({message: "User not found"})
            }
            const comment = await DB.query("SELECT * FROM comments where id=$1", [commentId])
            if (!comment.rows[0]) {
                return res.status(404).json({message: "Comment not found"})
            }
            await DB.query("DELETE FROM comments WHERE id=$1", [commentId])
            const comments = await DB.query("SELECT id, post_id, user_id, comment, created_at FROM comments")
            return res.send({comments: comments.rows})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete comments error'})
        }
    }
}

module.exports = new PostController()