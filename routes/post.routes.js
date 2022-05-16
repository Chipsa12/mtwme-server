const Router = require("express");
const router = new Router()
const authMiddleware = require("../middleware/auth.middleware")
const postController = require("../controllers/postController")

router.post('/', authMiddleware, postController.createPost)
router.post('/like', authMiddleware, postController.updateLikes)
router.post('/delete_post', authMiddleware, postController.deletePost)
router.post('/comment', authMiddleware, postController.addComment)
router.post('/delete_comment', authMiddleware, postController.deleteComment)

router.get('/', postController.getPosts)
router.get('/comment', authMiddleware, postController.getComments)

module.exports = router
