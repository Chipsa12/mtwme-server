const Router = require("express");
const router = new Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middleware/auth.middleware")

router.post('/avatar', authMiddleware, userController.uploadAvatar)
router.delete('/avatar', authMiddleware, userController.deleteAvatar)


module.exports = router
