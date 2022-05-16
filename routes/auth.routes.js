const Router = require("express");
const router = new Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middleware/auth.middleware")

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

router.get('/auth', authMiddleware, userController.auth)
router.get('/get_users', userController.getAllUsers)

module.exports = router
