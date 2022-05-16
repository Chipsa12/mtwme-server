const Router = require("express");
const router = new Router()
const messageController = require("../controllers/messageController")
const authMiddleware = require("../middleware/auth.middleware")

router.post('/', authMiddleware, messageController.sendMessage)
router.get('/messages', authMiddleware, messageController.getMessages)
router.post('/messages', authMiddleware, messageController.getMessagesByRoomId)



module.exports = router
